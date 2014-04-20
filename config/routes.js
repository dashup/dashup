module.exports = function(app) {

  var stream = require('../lib/controllers/stream');

  app.get('/s', stream.list);
  app.post('/s', stream.list);
};