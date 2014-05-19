'use strict';

var elasticsearch = require('../../elasticsearch'),
    Streams = require('../../backend/streams');


var jobs = require('../../jobs');

var es = elasticsearch.createClient();


function hasAccess(type, req, stream) {

  var tokens = stream.tokens,
      token = req.query.token;

  // no tokens = no restrictions
  if (!tokens) {
    return true;
  }

  // token must exist and equal stored token
  return (token && token === tokens[type]);
}


function withStream(req, res, callback) {
  Streams.get(req.params.id, function(err, stream) {

    if (err) {
      return res.send(400, { message: err.message });
    }

    if (!stream) {
      return res.send(404, { message: 'stream not found' });
    }

    callback(stream);
  });
}

module.exports.sync = function(req, res) {

  withStream(req, res, function(stream) {

    if (!hasAccess('admin', req, stream)) {
      return res.send(401, { message: 'insufficient privileges' });
    }

    jobs.scheduler.once('sync-stream', { payload: stream }, function(err) {
      if (err) {
        res.send(500, err);
      } else {
        res.send(200, { message: 'synchronization successful' });
      }
    });
  });
};


module.exports.get = function(req, res) {

  withStream(req, res, function(stream) {

    var streamName = stream.name;

    var query = {
      match_all: {}
    };

    if (!hasAccess('admin', req, stream)) {
      query = {
        bool: {
          must : {
            term : { public : true }
          }
        }
      };
    }

    es.search({
      index: streamName,
      type: 'event-repo',
      size: '100',
      body: {
        query: query,
        sort: [
          { created_at: { order: 'desc' } },
        ]
      }
    }, function (err, response) {

      if (err) {
        if (err.message === 'No Living connections') {
          return res.send(503, err);
        } else {
          return res.send(400, err);
        }
      }

      var results = response.hits;

      var data = {
        total: results.total,
        events: results.hits.map(function(e) {
          return e._source;
        })
      };

      return res.send(200, data);
    });
  });
};