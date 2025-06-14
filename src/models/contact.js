// src/models/contact.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // email: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  //   validate: {
  //     isEmail: true,
  //   },
  // },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  // Sequelize will automatically add createdAt and updatedAt
}, {
  tableName: 'contacts',
  timestamps: true,
});

module.exports = Contact;