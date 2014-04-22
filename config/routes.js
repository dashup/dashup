module.exports = function(app) {

  var stream = require('../lib/controllers/stream');

  app.get('/stream/:id', stream.query);
  app.post('/stream/:id/sync', stream.sync);
};