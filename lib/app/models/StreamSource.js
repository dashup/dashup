'use strict';

module.exports = function(sequelize, DataTypes) {

  var StreamSource = sequelize.define('StreamSource', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    type: DataTypes.STRING,

    keys: {
      type: DataTypes.TEXT,
      get: function()  {
        return JSON.parse(this.getDataValue('keys'));
      },
      set: function(value) {
        this.setDataValue('keys', JSON.stringify(value));
      }
    },

    lastSync: DataTypes.DATE,
    etag: DataTypes.STRING,

    stream_id: {
      type: DataTypes.INTEGER,
      references: 'Streams',
      referencesKey: 'id',
      onDelete: 'cascade',
      onUpdate: 'cascade'
    }
  }, {
    associate: function(models) {
      var Stream = models.Stream;

      Stream.hasMany(StreamSource);
      StreamSource.belongsTo(Stream);
    }
  });

  return StreamSource;
};