var elasticsearch = require('../elasticsearch'),
    Streams = require('../backend/streams');

var es = elasticsearch.createClient();

module.exports.sync = function(req, res) {
  
};

module.exports.query = function(req, res) {

  Streams.get(req.params.id, function(err, stream) {

    if (err) {
      return res.send(400, { message: err.message });
    }

    if (!stream) {
      return res.send(404, { message: 'stream not found' });
    }
    
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
        return res.send(400, err);
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