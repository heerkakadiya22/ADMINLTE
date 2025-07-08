'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      Admin.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
    }
  }

  Admin.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    image: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    address: DataTypes.TEXT,
    hobby: DataTypes.STRING,
    dob: DataTypes.DATEONLY,
    gender: DataTypes.STRING,
    roleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'admin',
    freezeTableName: true,
    timestamps: false // Only use true if you have `createdAt`/`updatedAt` columns
  });

  return Admin;
};
