'use strict';

var GitHubClient = require('github');

var _ = require('lodash');


var defaultConfig = require('./config').github || {};

/**
 * Create a GitHub client
 *
 * @param  {Object} config
 * @return {GitHubClient}
 */
module.exports.createClient = function(config) {

  config = _.extend({}, defaultConfig, config || {});

  var client = new GitHubClient({
    version: '3.0.0',
    debug: false,
    protocol: 'https',
    timeout: 5000
  });


  // authenticate
  // via token or client (id + secret)

  client.authenticate({
    type: 'oauth',
    token: config.token,
    key: config.clientID,
    secret: config.clientSecret
  });

  return client;
};