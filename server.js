'use strict';

// initialize node env
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


var express = require('express'),
    config = require('./lib/config'),
    utils = require('./lib/utils');


var db = require('./lib/db');

var app = express();

require('./lib/config/express')(app, config);
require('./lib/config/routes')(app);


app.listen(app.get('port'), app.get('hostname'), function() {
  console.log('[%s] [server] listening at %s:%d in %s mode',
    utils.now(),
    app.get('hostname'),
    app.get('port'),
    app.get('env'));
});


if (config.db.sync) {

  // sync database
  db.sync().success(function() {
    require('./lib/config/dummydata')(db);
  });
}

// expose app

module.exports = app;