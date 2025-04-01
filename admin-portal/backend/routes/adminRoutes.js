const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/login', adminController.loginAdmin);

// Example of a protected route
// router.get('/protected', adminMiddleware, (req, res) => {
//   res.json({ message: 'This is a protected route', admin: req.admin });
// });

module.exports = router;
