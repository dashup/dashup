'use strict';

module.exports = function(sequelize, DataTypes) {

  var Stream = sequelize.define('Stream', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    lastSync: DataTypes.DATE,

    tokens: {

      type: DataTypes.TEXT,
      get: function()  {
        var value = this.getDataValue('tokens');
        return value ? JSON.parse(value) : null;
      },
      set: function(value) {
        this.setDataValue('tokens', value ? JSON.stringify(value) : null);
      }
    }
  });

  return Stream;
};