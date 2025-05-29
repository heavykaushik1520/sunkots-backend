const bcrypt = require("bcrypt");

const Admin = require('../models/admin');


async function createAdmin(req, res) {
    try {
      const { password, ...adminData } = req.body; 
  
      
      const hashedPassword = await bcrypt.hash(password, 10); 
  
      const newAdmin = await Admin.create({
        ...adminData,
        password: hashedPassword, 
      });
  
      res.status(201).json(newAdmin);
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({ message: 'Failed to create admin', error: error.message });
    }
  }
  

// Get all admins
async function getAllAdmins(req, res) {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching all admins:', error);
    res.status(500).json({ message: 'Failed to fetch admins', error: error.message });
  }
}

// Get a single admin by ID
async function getAdminById(req, res) {
  const { id } = req.params;
  try {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (error) {
    console.error(`Error fetching admin with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch admin', error: error.message });
  }
}

// Update an existing admin by ID
async function updateAdmin(req, res) {
  const { id } = req.params;
  try {
    const [updatedRows] = await Admin.update(req.body, {
      where: { admin_id: id },
    });

    if (updatedRows > 0) {
      const updatedAdmin = await Admin.findByPk(id);
      return res.status(200).json(updatedAdmin);
    } else {
      return res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    console.error(`Error updating admin with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to update admin', error: error.message });
  }
}


async function deleteAdmin(req, res) {
  const { id } = req.params;
  try {
    const deletedRows = await Admin.destroy({
      where: { admin_id: id },
    });

    if (deletedRows > 0) {
      return res.status(204).send(); 
    } else {
      return res.status(404).json({ message: 'Admin not found' });
    }
  } catch (error) {
    console.error(`Error deleting admin with ID ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete admin', error: error.message });
  }
}

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
};