const express = require('express');
const router = express.Router();
const { loginAdmin, registerSecurity, getAllSecurity } = require('../controllers/adminController');

// Admin login route
router.post('/login', loginAdmin);

// Security management routes
router.post('/security/register', registerSecurity);
router.get('/security', getAllSecurity);

module.exports = router;