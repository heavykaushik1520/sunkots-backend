const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  description: { type: DataTypes.TEXT },
  weight: { type: DataTypes.DECIMAL(8, 2) },
  available_status: { type: DataTypes.BOOLEAN, defaultValue: true },
  // image: { type: DataTypes.STRING },
  CategoryId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: 'products',
  timestamps: true,
});

Product.associate = (models) => {
  Product.belongsTo(models.Category, { foreignKey: 'CategoryId', as: 'category' });

  Product.hasMany(models.ProductImage, {
    foreignKey: 'productId',
    as: 'images',
    onDelete: 'CASCADE',
  });

  Product.belongsToMany(models.Cart, {
    through: models.CartItem,
    as: 'carts',
    foreignKey: 'productId',
    otherKey: 'cartId',
  });
  Product.belongsToMany(models.Order, {
    through: models.OrderItem,
    as: 'orders',
    foreignKey: 'productId',
    otherKey: 'orderId',
  });
};

module.exports = Product;
