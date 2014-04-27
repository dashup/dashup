'use strict';

var moment = require('moment');

module.exports.now = function() {
  return moment().format();
};


var Sequelize = require('sequelize');

module.exports.chain = function() {
  return new Sequelize.Utils.QueryChainer();
};


var _ = require('lodash');

module.exports.logger = function(type, prefix) {

  var defaultFormat = '[%s]';
  var defaultArgs = [ type ];

  if (prefix) {
    defaultFormat += ' %s';
    defaultArgs.push(prefix);
  }

  return function() {
    var args = Array.prototype.slice.call(arguments);

    var format;

    if (_.isString(args[0])) {
      format = defaultFormat + ' ' + args.shift();
    } else {
      format = defaultFormat;
    }

    args = [format].concat(defaultArgs, args);

    console.log.apply(console, args);
  };
};