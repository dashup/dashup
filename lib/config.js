var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

var utils = require('./utils');


var DATA_DIR = process.env['DASHUP_DATA_DIR'] || '.';

var DEFAULT_PATH = path.resolve(DATA_DIR + '/config.json');

module.exports = new Config(DEFAULT_PATH);

module.exports.Config = Config;


function load(path) {

  try {
    var contents = fs.readFileSync(path, { encoding: 'utf-8' });
    return JSON.parse(contents);
  } catch (e) {
    console.error('[%s] [config] failed to load configuration', utils.now(), e);
  }
}

function save(location, config) {

  var dirName = path.dirname(location);

  // make sure directory exists
  mkdirp.sync(dirName);

  try {
    var contents = JSON.stringify(config);
    fs.writeFileSync(location, contents, { encoding: 'utf-8' });
  } catch (e) {
    throw new Error('failed to save config: ' + e.message);
  }
}


function Config(location) {

  var config, saving, reloading;

  function localSave(path) {
    saving = true;
    save(path || location, config);
  }

  function set(name, value, pivot) {
    var parts = name.split('.');
    var first = parts.shift();

    pivot = pivot || config;

    if (parts.length) {
      var sub = pivot[first] = pivot[first] || {};
      set(parts.join('.'), value, sub);
    } else {
      pivot[first] = value;
    }
  }

  function get(name, defaultValue, pivot) {
    var parts = name.split('.');
    var first = parts.shift();

    pivot = pivot || config;

    var element = pivot[first] = pivot[first] || (parts.length ? {} : defaultValue);

    if (parts.length) {
      return get(parts.join('.'), defaultValue, element);
    } else {
      return element;
    }
  }

  function reload() {
    console.info('[%s] [config] %sloading configuration from %s', utils.now(), config ? 're' : '', location);
    config = load(location) || {};
    reloading = false;
  }

  fs.watch(location, function (event, filename) {
    if (!saving && !reloading) {
      reloading = true;
      setTimeout(reload, 2000);
    }
    saving = false;
  });

  // API
  this.save = localSave;
  this.reload = reload;
  this.get = get;
  this.set = set;

  this.location = function() {
    return location;
  };

  reload();
}