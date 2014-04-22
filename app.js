var express = require('express'),
    fs = require('fs'),
    config = require('./config/environment'),
    utils = require('./lib/utils');

var app = express();

require('./config/express')(app, config);
require('./config/routes')(app);



function initialize() {
  
  function terminator(sig) {
    if (typeof sig === "string") {
      console.log('[%s] [server] received %s, terminating', utils.now(), sig);
      process.exit(1);
    }
    console.log('[%s] [server] stopped.', utils.now());
  }

  function hookTerminationHandlers() {
    //  Process on exit and signals.
    process.on('exit', terminator);

    // Removed 'SIGPIPE' from the list - bugz 852598.
    ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
     'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
    ].forEach(function(element, index, array) {
        process.on(element, terminator);
    });
  }

  if (app.get('env') === 'openshift') {
    hookTerminationHandlers();
  }
}

function bootstrapApplication() {
  app.listen(app.get('port'), app.get('hostname'), function() {
    console.log('[%s] [server] listening at %s:%d', utils.now(), app.get('hostname'), app.get('port'));
  });
}

function start() {
  bootstrapApplication();
}

initialize();
start();