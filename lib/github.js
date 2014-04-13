var GitHub = require('github'),
    config = require('./config');


var github = new GitHub({
  version: '3.0.0',
  debug: false,
  protocol: 'https',
  timeout: 5000
});


// via token or client (id + secret)

github.authenticate({
  type: 'oauth',
  token: config.get('github.auth.token'),
  key: config.get('github.auth.clientID'),
  secret: config.get('github.auth.clientSecret')
});


module.exports = github;
module.exports.GitHub = GitHub;