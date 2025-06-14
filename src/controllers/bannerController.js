// const Banner = require('../models/banner');

// exports.getBanner = async (req, res) => {
//   try {
//     const banner = await Banner.findOne(); // Get the first banner (assuming only one)
//     res.json({ success: true, data: banner });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching banner', error });
//   }
// };

// exports.updateBanner = async (req, res) => {
//   try {
//     const { heading, paragraph, imageUrl } = req.body;
//     let banner = await Banner.findOne();
//     if (!banner) {
//       banner = await Banner.create({ heading, paragraph, imageUrl });
//     } else {
//       await banner.update({ heading, paragraph, imageUrl });
//     }
//     res.json({ success: true, data: banner });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error updating banner', error });
//   }
// };

// exports.createBanner = async (req, res) => {
//   try {
//     const { heading, paragraph, imageUrl } = req.body;
//     const banner = await Banner.create({ heading, paragraph, imageUrl });
//     res.status(201).json({ success: true, data: banner });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error creating banner', error });
//   }
// };


// src/controllers/bannerController.js

const Banner = require('../models/banner'); // Import the Banner model directly


exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findOne(); // Get the first banner (assuming only one banner is desired)
    if (!banner) {
      // If no banner exists, return a 404 with a specific message
      return res.status(404).json({ success: false, message: 'No banner found. Consider creating one.' });
    }
    res.json({ success: true, data: banner });
  } catch (error) {
    // Log the actual error for server-side debugging
    console.error('Error fetching banner:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching banner', error: error.message });
  }
};


exports.updateBanner = async (req, res) => {
  try {
    const { heading, paragraph, imageUrl } = req.body;

    // Validate incoming data (optional but recommended)
    if (!heading || !paragraph || !imageUrl) {
      return res.status(400).json({ success: false, message: 'All fields (heading, paragraph, imageUrl) are required.' });
    }

    let banner = await Banner.findOne(); // Attempt to find an existing banner

    if (!banner) {
      // If no banner exists, create a new one
      banner = await Banner.create({ heading, paragraph, imageUrl });
      res.status(201).json({ success: true, message: 'Banner created successfully', data: banner });
    } else {
      // If a banner exists, update it
      await banner.update({ heading, paragraph, imageUrl });
      res.json({ success: true, message: 'Banner updated successfully', data: banner });
    }
  } catch (error) {
    console.error('Error updating/creating banner:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update banner', error: error.message });
  }
};


exports.createBanner = async (req, res) => {
  try {
    const { heading, paragraph, imageUrl } = req.body;

    // Validate incoming data
    if (!heading || !paragraph || !imageUrl) {
      return res.status(400).json({ success: false, message: 'All fields (heading, paragraph, imageUrl) are required.' });
    }

    // Check if a banner already exists to prevent multiple banners if that's the intention
    const existingBanner = await Banner.findOne();
    if (existingBanner) {
      return res.status(409).json({ success: false, message: 'A banner already exists. Use the PUT /api/banner route to update it instead.' });
    }

    const banner = await Banner.create({ heading, paragraph, imageUrl });
    res.status(201).json({ success: true, message: 'Banner created successfully', data: banner });
  } catch (error) {
    console.error('Error creating banner:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create banner', error: error.message });
  }
};


exports.deleteBanner = async (req, res) => {
  try {
    const deletedRows = await Banner.destroy({
      where: {}, // Delete all rows in the banners table
    });

    if (deletedRows > 0) {
      return res.status(204).send(); // 204 No Content, successful deletion
    } else {
      return res.status(404).json({ message: 'No banner found to delete.' });
    }
  } catch (error) {
    console.error('Error deleting banner:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete banner', error: error.message });
  }
};