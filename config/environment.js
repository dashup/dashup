var _ = require('lodash'),
    path = require('path'),
    rootPath = path.normalize(__dirname + '/..');

function env(str) {
  return process.env[str];
}

var defaults = {
  root: rootPath,
  app: {
    name: 'dashub'
  },
  port: 3000,
  hostname: '127.0.0.1',
  db: {
    name: 'dashub'
  },
  elasticsearch: {
    client: {
      host: 'localhost:9200',
      log: {
        level: 'warning'
      }
    }
  }
};


function withDefaults(options) {
  return _.merge({}, defaults, options);
}

var environments = {

  development: withDefaults({
    db: {
      dialect: 'sqlite',
      storage: 'tmp/db/development.sqlite'
    }
  }),

  test: withDefaults({
    db: {
      dialect: 'sqlite',
      storage: 'tmp/db/test.sqlite'
    }
  }),

  test_mysql: withDefaults({
    db: {
      dialect: 'mysql',
      name: 'dashub_test',
      host: env('MYSQL_DB_HOST'),
      port: env('MYSQL_DB_PORT'),
      user: env('MYSQL_USER'),
      password: env('MYSQL_PASSWORD')
    }
  }),

  production: withDefaults({
    db: {
      logging: false,
      dialect: 'mysql',
      name: 'dashub',
      host: env('MYSQL_DB_HOST'),
      port: env('MYSQL_DB_PORT'),
      user: env('MYSQL_DB_USERNAME'),
      password: env('MYSQL_DB_PASSWORD')
    }
  }),

  openshift: withDefaults({
    hostname: env('OPENSHIFT_NODEJS_IP') || '127.0.0.1',
    port: env('OPENSHIFT_NODEJS_PORT') || 8080,
    db: {
      logging: false,
      dialect: 'mysql',
      name: 'app',
      host: env('OPENSHIFT_MYSQL_DB_HOST'),
      port: env('OPENSHIFT_MYSQL_DB_PORT'),
      user: env('OPENSHIFT_MYSQL_DB_USERNAME'),
      password: env('OPENSHIFT_MYSQL_DB_PASSWORD')
    },
    elasticsearch: {
      client: {
        host: env('OPENSHIFT_ES_IP') + ':' + env('OPENSHIFT_ES_PORT'),
      }
    }
  })
};

var envname = env('NODE_ENV') || 'development';

var environment = environments[envname];

if (!environment) {
  throw new Error('no configuration for environment ' + envname);
}

environment.envname = envname;

// create directory for database files (if specified)
if (environment.db && environment.db.storage) {
  var mkdirp = require('mkdirp'),
      path = require('path');

  mkdirp.sync(path.dirname(environment.db.storage));
}

module.exports = environment;