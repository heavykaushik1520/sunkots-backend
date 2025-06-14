const Admin = require('./admin');
const Category = require('./category');
const Product = require('./product');
const User = require('./user');
const Contact = require('./contact');
const Cart = require('./cart');
const CartItem = require('./cartItem');
const Order = require('./order');
const OrderItem = require('./orderItem');
const ProductImage = require('./productImage');
const Banner = require("./banner");


const models = {
  Admin,
  Category,
  Product,
  User,
  Contact,
  Cart,
  CartItem,
  Order,
  OrderItem,
  ProductImage,
  Banner
};

// Apply associations
Object.keys(models).forEach((key) => {
  if (models[key].associate) {
    models[key].associate(models);
  }
});

module.exports = {
  ...models,
  sequelize: Admin.sequelize,
  Sequelize: Admin.Sequelize,
};
