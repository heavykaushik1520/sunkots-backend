// src/app.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import the database configuration
const { sequelize, testConnection } = require('./config/db'); 

//models
// const Admin = require('./models/admin'); 
// const Category = require('./models/category'); 
// const Product = require('./models/product'); 
// const User = require("./models/user"); 
// const Contact = require("./models/contact"); 
// const Banner = require("./models/banner");
// const Order = require("./models/order");
// const OrderItems = require("./models/orderItem");
// const Cart = require("./models/cart");
// const CartItem = require("./models/cartItem");
// const ProductImage = require("./models/productImage");


const models = require('./models'); 

//routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes'); 
const cartRoutes = require('./routes/cartRoutes'); 
const orderRoutes = require("./routes/orderRoutes"); 
const paymentRoutes = require("./routes/paymentRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const shipRoutes = require("./routes/shipRoutes");//created on 12/06





const app = express();
const port = process.env.PORT || 3000;

// Middleware 
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://artiststation.co.in'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies or Authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

testConnection();


async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}
syncDatabase(); 


// Use your authentication routes
app.use('/api/auth', authRoutes);

//user auth routes
app.use('/api/auth/user', userAuthRoutes);

//admin route
app.use('/api', adminRoutes); 

//user Routes
app.use('/api', userRoutes);

//category route
app.use('/api', categoryRoutes);

//product route
app.use('/api', productRoutes);

// Use your contact routes
app.use('/api', contactRoutes);

// Use your cart routes
app.use('/api', cartRoutes);

//order route
app.use('/api', orderRoutes );

//payment route
app.use("/api/payment", paymentRoutes);

//banner routes
app.use('/api', bannerRoutes);

//admin order routes
app.use('/api/admin', adminOrderRoutes);

//created on 12-06
app.use('/api/webhooks',shipRoutes)




// Define your routes here
app.get('/', (req, res) => {
  res.send('Hello from your Node.js Express app in Devrukh!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port} in Devrukh.`);
});

module.exports = app;