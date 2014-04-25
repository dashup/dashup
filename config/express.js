var express = require('express');

module.exports = function(app, config) {

  app.configure('development', function() {
    app.use(express.logger('dev'));

    app.use(require('connect-livereload')());

    // disable script caching
    app.use(function noCache(req, res, next) {
      if (/\.js/.test(req.url)) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.errorHandler());
  });

  app.configure(function () {

    app.set('port', config.port);
    app.set('hostname', config.hostname);

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
    app.use(express.favicon(config.root + '/favicon.ico'));

    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(app.router);
  });
};
