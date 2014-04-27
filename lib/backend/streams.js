'use strict';

var async = require('async');

var db = require('../db');


function Streams(db) {

  var Stream = db.Stream;
  var StreamSource = db.StreamSource;

  function get(name, done) {
    Stream.find({ where: { name: name }, include: [ StreamSource ] }).complete(done);
  }

  function save(stream, done) {

    function saveEntity(e, done) {
      e.save().complete(done);
    }

    saveEntity(stream, function(err) {

      if (err) {
        return done(err);
      }

      async.map(stream.streamSources, saveEntity, done);
    });
  }

  // API
  this.get = get;
  this.save = save;
}

module.exports = new Streams(db);

module.exports.Streams = Streams;