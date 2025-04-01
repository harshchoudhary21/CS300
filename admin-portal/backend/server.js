const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/adminRoutes');
const adminController = require('./controller/adminController');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRoutes);

const initializeAdmin = async () => {
  try {
    await adminController.initializeAdmin();
    console.log('Admin initialization process started.');
  } catch (error) {
    console.log('Admin already exists or initialization failed.');
    console.error('Error during admin initialization:', error.message);
  }
};

app.listen(port, async () => {
  console.log(`Server is running on port: ${port}`);
  await initializeAdmin();
});
