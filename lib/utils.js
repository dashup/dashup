var moment = require('moment');

module.exports.now = function() {
  return moment().format();
};