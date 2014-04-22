var elasticsearch = require('../elasticsearch'),
    Streams = require('../backend/streams'),
    Synchronizer = require('../tools/synchronizer');

var es = elasticsearch.createClient();

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

    new Synchronizer(stream.id).synchronize(function(err) {

      if (err) {
        res.send(500, err);
      } else {
        res.send(200, { message: 'synchronization successful' });
      }
    });
  });
};

module.exports.query = function(req, res) {

  withStream(req, res, function(stream) {
    
    var streamId = stream.id;

    es.search({
      index: streamId,
      type: 'event-repo',
      size: '100',
      body: {
        query: {
          match_all: {}
        },
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