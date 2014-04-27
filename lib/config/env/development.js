'use strict';

function env(name) {
  return process.env[name];
}

/**
 * Configuration that applies to dev mode
 */

module.exports = {

  github: {
    token: env('GITHUB_API_TOKEN'),
  },
  db: {
    name: 'dashup',
    dialect: 'mysql',
    host: 'localhost',
    port: 3306,
    user: env('MYSQL_DB_USER'),
    password: env('MYSQL_DB_PASSWORD')
  }
};