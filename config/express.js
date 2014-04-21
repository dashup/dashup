var express = require('express');

module.exports = function(app, config) {
  
  app.configure(function () {

    app.set('port', config.port);
    app.set('hostname', config.hostname);

    if (config.debug) {
      app.use(express.logger('dev'));
    }
    
    // forward all requests to /s/:token to the /index.html page

    function redirectToIndex(pattern) {
      return function(req, res, next) {

        if (pattern.test(req.url)) {
          req.url = '/index.html';
        }

        next();
      };
    }

    app.use(redirectToIndex(/^\/s\/[^\/]+$/));
    app.use(redirectToIndex(/^\/about$/));

    app.use(express.static(config.root + '/public'));
    app.use(express.favicon(config.root + '/public/img/favicon.ico'));

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(app.router);
  });
};
