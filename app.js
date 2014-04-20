var express = require('express'),
    fs = require('fs'),
    config = require('./config/environment');

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);


app.listen(app.get('port'), app.get('hostname'), function() {
  console.log('server is listening on port %s', app.get('port'));
});