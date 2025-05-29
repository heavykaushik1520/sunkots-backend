// src/models/cart.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, 
  },
  // No direct product or quantity here; managed by CartItem
}, {
  tableName: 'cart',
  timestamps: true, 
});

Cart.associate = ({ User, Product, CartItem }) => {
  Cart.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  Cart.belongsToMany(Product, {
    through: CartItem,
    as: 'products',
    foreignKey: 'cartId',
    otherKey: 'productId',
  });

  Cart.hasMany(CartItem, {
    foreignKey: 'cartId',
    as: 'cartItems',
  });
};



module.exports = Cart;