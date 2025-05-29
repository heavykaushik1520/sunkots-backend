// src/models/category.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); // Import the sequelize instance

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Categories should ideally have unique names
  },
  // Sequelize will automatically add createdAt and updatedAt
}, {
  tableName: 'categories', // Explicitly set the table name
  timestamps: true,
});

Category.associate = function(models) {
  Category.hasMany(models.Product, {
    foreignKey: 'CategoryId',
    as: 'products',         
    onDelete: 'CASCADE',   
  });
};

module.exports = Category;