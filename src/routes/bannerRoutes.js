const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware')
const {
    getBanner ,
    updateBanner,
    createBanner
} = require('../controllers/bannerController');


// Public route
router.get('/banner',  getBanner);

// Admin route (you can add auth middleware here)
router.put('/banner', isAdmin , updateBanner);

router.post('/banner', isAdmin , createBanner);

module.exports = router;
