const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
}, {
  tableName: 'cart',
  timestamps: true,
});

Cart.associate = (models) => {
  Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Cart.belongsToMany(models.Product, {
    through: models.CartItem,
    as: 'products',
    foreignKey: 'cartId',
    otherKey: 'productId',
  });
  Cart.hasMany(models.CartItem, { foreignKey: 'cartId', as: 'cartItems' });
};

module.exports = Cart;
