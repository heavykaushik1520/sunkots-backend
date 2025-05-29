// src/models/admin.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); 

const Admin = sequelize.define('Admin', {
  admin_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: { 
    type: DataTypes.STRING,
    allowNull: true, 
    unique: true,    
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin'
  }
}, {
  tableName: 'sunkots_admins', 
  timestamps: true,       
});

module.exports = Admin;