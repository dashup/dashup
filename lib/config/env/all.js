'use strict';

var path = require('path');

/**
 * Default configuration that applies to all environments
 */

var root = path.join(__dirname, '..', '..', '..');

module.exports = {
  root: root,
  app: {
    name: 'dashup'
  },
  port: 3000,
  hostname: '127.0.0.1',
  db: {
    name: 'dashup'
  },
  elasticsearch: {
    host: 'localhost:9200',
    log: {
      level: 'warning'
    }
  }
};