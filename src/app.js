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
const Admin = require('./models/admin'); 
const Category = require('./models/category'); 
const Product = require('./models/product'); 
const User = require("./models/user"); 
const Contact = require("./models/contact"); 



//routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userAuthRoutes = require('./routes/userAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes'); 
const cartRoutes = require('./routes/cartRoutes'); 



const app = express();
const port = process.env.PORT || 3000;

// Middleware 
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173', // Allow your frontend origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));


testConnection();


async function syncDatabase() {
  try {
    await sequelize.sync();
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