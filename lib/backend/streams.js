var _ = require('lodash');

var defaultConfig = require('../config');

function Streams(config) {

  function get(id, done) {
    var streams = config.get('streams', {});

    var stream = streams[id];
    if (!stream) {
      return done();
    }

    done(null, _.extend({ id: id }, stream));
  }

  // API
  this.get = get;
}

module.exports = new Streams(defaultConfig);

module.exports.Streams = Streams;