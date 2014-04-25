var express = require('express'),
    config = require('./config/environment'),
    utils = require('./lib/utils');


// initialize node env
process.env.NODE_ENV = process.env.NODE_ENV || 'development';


var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);


app.listen(app.get('port'), app.get('hostname'), function() {
  console.log('[%s] [server] listening at %s:%d in %s mode',
    utils.now(),
    app.get('hostname'),
    app.get('port'),
    app.get('env'));
});


// expose app

module.exports = app;