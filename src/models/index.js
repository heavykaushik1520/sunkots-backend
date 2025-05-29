// src/models/index.js

const Admin = require('./admin');
const Category = require('./category');
const Product = require('./product');
const User = require("./user");
const Contact = require('./contact');
const Cart = require('./cart');
const CartItem = require('./cartItem');

// Call the associate functions to define the relationships
if (Category.associate) {
  Category.associate({ Product });
}

if (Product.associate) {
  Product.associate({ Category });
}


if (User.associate) {
  User.associate({ Cart });
}

if (Cart.associate) {
  Cart.associate({ User, Product, CartItem }); // 🔁 Make sure these are Sequelize models
}

if (CartItem.associate) {
  CartItem.associate({ Cart, Product });
}

module.exports = {
  Admin,
  Category,
  Product,
  User,
  Contact,
  Cart,       // Export the Cart model
  CartItem, 
  sequelize: Admin.sequelize, 
  Sequelize: Admin.Sequelize, // Export the Sequelize library
};