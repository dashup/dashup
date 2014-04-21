var _ = require('lodash');

var defaultConfig = require('../config');

function Streams(config) {

  this.get = function(id, done) {
    var streams = config.get('streams', {});

    var stream = streams[id];
    if (!stream) {
      return done();
    }

    done(null, _.extend({ id: id }, stream));
  };
}

module.exports = new Streams(defaultConfig);

module.exports.Streams = Streams;