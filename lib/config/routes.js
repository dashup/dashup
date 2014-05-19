'use strict';

module.exports = function(app) {

  var stream = require('../app/controllers/stream');

  app.get('/stream/:id', stream.get);
  app.post('/stream/:id/sync', stream.sync);
};