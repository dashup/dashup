var elasticsearch = require('elasticsearch'),
    _ = require('lodash');

var config = require('../config/environment');

var clientConfig = config.elasticsearch.client || {};


module.exports.createClient = function(config) {

  config = _.extend({}, clientConfig, config || {});

  if (!config.host) {
    throw new Error('must specify host as elasticsearch.client.host in config.json or via options');
  }


  return new elasticsearch.Client(config);
};