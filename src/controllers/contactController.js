// src/controllers/contactController.js

const { Contact } = require('../models');

// Public: Create a new contact message
async function createContact(req, res) {
  try {
    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Failed to create contact message.', error: error.message });
  }
}

// Admin-only: Get all contact messages
async function getAllContacts(req, res) {
  try {
    const contacts = await Contact.findAll();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Error fetching all contact messages:', error);
    res.status(500).json({ message: 'Failed to fetch contact messages.', error: error.message });
  }
}

// Admin-only: Get a single contact message by ID
async function getContactById(req, res) {
  const { id } = req.params;
  try {
    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found.' });
    }
    res.status(200).json(contact);
  } catch (error) {
    console.error(`Error fetching contact message with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch contact message.', error: error.message });
  }
}

// Admin-only: Delete a contact message by ID
async function deleteContact(req, res) {
  const { id } = req.params;
  try {
    const deletedRows = await Contact.destroy({
      where: { id: id },
    });
    if (deletedRows > 0) {
      return res.status(204).send(); // 204 No Content
    } else {
      return res.status(404).json({ message: 'Contact message not found.' });
    }
  } catch (error) {
    console.error(`Error deleting contact message with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete contact message.', error: error.message });
  }
}

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
};