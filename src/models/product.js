// src/models/product.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db'); 
const Category = require('./category'); 

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), // Example: 10 digits in total, 2 after the decimal point
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2), // Example: weight with 2 decimal places
    allowNull: true,
  },
  available_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  image: {
    type: DataTypes.STRING, // Store the image path or URL
    allowNull: true,
  },

  CategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'id',
    },
    onUpdate: 'CASCADE', 
  },
 
}, {
  tableName: 'products', // Explicitly set the table name
  timestamps: true,
});

// Define the association with Category
Product.associate = function(models) {
  Product.belongsTo(models.Category, {
    foreignKey: 'CategoryId',
    as: 'category', 
  });
};

module.exports = Product;