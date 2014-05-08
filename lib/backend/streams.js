'use strict';

var async = require('async');

var db = require('../db');


function Streams(db) {

  var Stream = db.Stream;
  var StreamSource = db.StreamSource;

  function get(name, done) {
    Stream.find({ where: { name: name }, include: [ StreamSource ] }).complete(done);
  }

  function save(stream, fields, done) {


    function saveEntity(e, fields, done) {

      if (!done) {
        done = fields;
        fields = null;
      }

      var emitter = fields ? e.save(fields) : e.save();
      emitter.complete(done);
    }

    saveEntity(stream, fields, function(err) {

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