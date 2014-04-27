'use strict';

var elasticsearch = require('elasticsearch');
var _ = require('lodash');


var defaultConfig = require('./config').elasticsearch || {};

/**
 * Create an elastic search client
 *
 * @param  {Object} config
 * @return {ElasticSearchClient}
 */
module.exports.createClient = function(config) {

  config = _.extend({}, defaultConfig, config || {});

  if (!config.host) {
    throw new Error('must specify host via options');
  }

  return new elasticsearch.Client(config);
};