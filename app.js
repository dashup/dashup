var express = require('express'),
    config = require('./config/environment'),
    utils = require('./lib/utils');

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);


function start() {
  app.listen(app.get('port'), app.get('hostname'), function() {
    console.log('[%s] [server] listening at %s:%d', utils.now(), app.get('hostname'), app.get('port'));
  });
}

start();