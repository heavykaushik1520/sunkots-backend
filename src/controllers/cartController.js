// src/controllers/cartController.js

const { Cart, CartItem, Product , ProductImage} = require("../models");

// Get the cart for the logged-in user
// async function getMyCart(req, res) {
//   try {
//     const cart = await Cart.findOne({
//       where: { userId: req.user.userId },
//       include: [
//         {
//           model: Product,
//           as: "products",
//           through: {
//             model: CartItem,
//             as: "cartItem",
//             attributes: ["quantity"], // Only include the quantity from CartItem
//           },
//         },
//       ],
//     });

//     if (!cart) {
//       // return res.status(404).json({ message: "Cart not found for this user." });
//       cart = await Cart.create({ userId: req.user.userId });
//     }

//     res.status(200).json(cart);
//   } catch (error) {
//     console.error("Error fetching user cart:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch cart.", error: error.message });
//   }
// }

async function getMyCart(req, res) {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.userId },
      include: [
        {
          model: Product,
          as: "products",
          through: {
            model: CartItem,
            as: "cartItem",
            attributes: ["quantity"],
          },
          include: [
            {
              model: ProductImage,   
              as: "images",         
              attributes: ["imageUrl"], 
            },
          ],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.userId });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({ message: "Failed to fetch cart.", error: error.message });
  }
}


// Add a product to the user's cart or update quantity
async function updateMyCart(req, res) {
  const { productId, quantity } = req.body;

  if (
    !productId ||
    typeof productId !== "number" ||
    !Number.isInteger(productId)
  ) {
    return res.status(400).json({ message: "Invalid or missing productId." });
  }

  if (
    !quantity ||
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    return res.status(400).json({
      message: "Invalid or missing quantity. Must be a positive integer.",
    });
  }

  try {
    const cart = await Cart.findOne({ where: { userId: req.user.userId } });

    if (!cart) {
      // return res.status(404).json({ message: 'Cart not found for this user.' });
      cart = await Cart.create({ userId: req.user.userId });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if the product is already in the cart
    const cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId: productId },
    });

    if (cartItem) {
      // Update quantity if the product exists
      cartItem.quantity = quantity;
      await cartItem.save();
      return res
        .status(200)
        .json({ message: "Cart updated successfully.", cart });
    } else {
      // Add new product to the cart
      await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
      });
      return res
        .status(201)
        .json({ message: "Product added to cart successfully.", cart });
    }
  } catch (error) {
    console.error("Error updating user cart:", error);
    res
      .status(500)
      .json({ message: "Failed to update cart.", error: error.message });
  }
}

// Delete a product from the user's cart
async function deleteCartItem(req, res) {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ where: { userId: req.user.userId } });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user." });
    }

    const deletedRows = await CartItem.destroy({
      where: { cartId: cart.id, productId: productId },
    });

    if (deletedRows > 0) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: "Product not found in cart." });
    }
  } catch (error) {
    console.error("Error deleting item from cart:", error);
    res.status(500).json({
      message: "Failed to delete item from cart.",
      error: error.message,
    });
  }
}

async function clearMyCart(req, res) {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.userId } });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user." });
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    res.status(204).send();
  } catch (error) {
    console.error("Error clearing user cart:", error);
    res
      .status(500)
      .json({ message: "Failed to clear cart.", error: error.message });
  }
}

module.exports = {
  getMyCart,
  updateMyCart,
  deleteCartItem,
  clearMyCart,
};
