var elasticsearch = require('../elasticsearch');

var es = elasticsearch.createClient();


module.exports.list = function(req, res) {

  es.search({
    index: 'dashub',
    body: req.body,
    q: req.param('q')
  }, function (err, response) {

    if (err) {
      return res.send(400, err);
    }

    return res.send(200, response);
  });
};