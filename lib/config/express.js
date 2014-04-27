'use strict';

var express = require('express'),

    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    morgan  = require('morgan'),
    favicon = require('static-favicon');


function redirect(pattern) {

  function Builder(pattern) {

    this.to = function(destination) {
      return function(req, res, next) {

        if (pattern.test(req.url)) {
          req.url = destination;
        }

        next();
      };
    };
  }

  return new Builder(pattern);
}


module.exports = function(app, config) {

  var env = process.env.NODE_ENV;


  /**
   * Development configuration
   */
  if (env === 'development') {

    app.use(morgan('dev'));

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

    app.use(require('errorhandler')());
  }

  /**
   * All configuration
   */

  app.set('port', config.port);
  app.set('hostname', config.hostname);


  // forward all requests to /s/:token and /about to the /index.html page

  app.use(redirect(/^\/s\/[^\/]+$/).to('/index.html'));
  app.use(redirect(/^\/about$/).to('/index.html'));


  app.use(express.static(config.root + '/public'));
  app.use(favicon(config.root + '/favicon.ico'));

  app.use(bodyParser());
  app.use(methodOverride());


  // session handling

  app.use(cookieParser());
  app.use(session({
    secret: (config.session || {}).secret || 'hads78gj187!sda89op',
    key: 'sid',
    cookie: { secure: true }
  }));

};
