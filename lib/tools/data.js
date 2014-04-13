var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

function dump(data, file) {
  mkdirp.sync(path.resolve(path.dirname(file)));
  fs.writeFileSync(file, JSON.stringify(data));
}

function read(file) {
  return JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }));
}


module.exports.dump = dump;
module.exports.read = read;