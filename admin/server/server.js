const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeAdmin } = require('./controllers/adminController');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use routes
app.use('/api/admin', adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Admin API is running' });
});

// Test route specifically for the login endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API routes are working' });
});

// Function to initialize admin during server startup
const bootstrapAdmin = async () => {
  try {
    const result = await initializeAdmin();
    console.log('Admin bootstrap result:', result.message);
  } catch (error) {
    console.error('Failed to bootstrap admin:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize admin when server starts
  await bootstrapAdmin();
});