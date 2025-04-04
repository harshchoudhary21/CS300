const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  registerSecurity,
  getAllSecurity,
  getAllEntries,
  updateVerificationStatus,
  getAllStudents, // New function
} = require('../controllers/adminController');

// Admin login route
router.post('/login', loginAdmin);

// Security management routes
router.post('/security/register', registerSecurity);
router.get('/security', getAllSecurity);

// Late entry management routes
router.get('/entries', getAllEntries);
router.post('/entries/update', updateVerificationStatus);

// Student management route
router.get('/students', getAllStudents); // Fetch all students

module.exports = router;