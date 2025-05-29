// src/routes/contactRoutes.js

const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware');
const {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
} = require('../controllers/contactController');

// Public route (Create)
router.post('/contact', createContact);

// Admin-only routes (Read All, Read by ID, Delete)
router.get('/contact', isAdmin, getAllContacts);
router.get('/contact/:id', isAdmin, getContactById);
router.delete('/contact/:id', isAdmin, deleteContact);

// Note: We are not implementing an update operation for contact messages based on your requirements.

module.exports = router;