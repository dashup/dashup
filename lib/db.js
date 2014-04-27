'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var Sequelize = require('sequelize');

var config = require('./config').db,
    utils = require('./utils'),
    modelsDirectory = path.join(__dirname, 'app', 'models');


var db = {};

var sequelize = new Sequelize(config.name, config.user, config.password, _.extend({
  define: {
    underscored: true
  }
}, config));

console.log('[%s] [database] connecting to %s://%s@%s:%d/%s', utils.now(),
  config.dialect,
  config.user,
  config.host,
  config.port,
  config.name);


///// import models /////////////////////////////

fs
  .readdirSync(modelsDirectory)
  .filter(function(file) {
    return (/\.js$/).test(file);
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(modelsDirectory, file));
    db[model.name] = model;
  });


///// associate models /////////////////////////////

_.forEach(db, function(model) {
  var associate = model.options.associate;
  if (_.isFunction(associate)) {
    associate(db);
  }
});


// utility methods

db.sync = function() {
  var chain = utils.chain();

  return chain
    .add(db.StreamSource.drop())
    .add(db.Stream.drop())
    .add(sequelize.sync({ force: true }))
    .runSerially({ skipOnError: true });
};


module.exports = _.extend({ sequelize: sequelize }, db);