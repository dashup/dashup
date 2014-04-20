var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';


var environments = {

  development: {
    root: rootPath,
    app: {
      name: 'dashub'
    },
    port: 3000
  },

  test: {
    root: rootPath,
    app: {
      name: 'dashub'
    },
    port: 3000
  },

  production: {
    root: rootPath,
    app: {
      name: 'dashub'
    },
    port: 3000
  }
};

var environment = environments[env];

if (!environment) {
  throw new Error('no configuration for environment ' + env);
}

module.exports = environment;
