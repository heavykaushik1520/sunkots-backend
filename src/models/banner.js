// src/models/banner.js

const { DataTypes } = require('sequelize'); // Import DataTypes from Sequelize itself
const { sequelize } = require('../config/db'); // Import the sequelize instance from your db.js

const Banner = sequelize.define(
  "Banner",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    heading: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paragraph: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "banners", 
    timestamps: true, 
  }
);




module.exports = Banner; // Export the Banner model directly