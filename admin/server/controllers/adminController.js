const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebaseAdmin');

// Initialize admin if not exists
const initializeAdmin = async () => {
  try {
    const adminEmail = 'admin@iiitg.ac.in';
    const adminPassword = 'admin@1234';
    
    // Check if admin collection exists and if this admin already exists
    const adminRef = db.collection('admin');
    const snapshot = await adminRef.where('email', '==', adminEmail).get();
    
    if (snapshot.empty) {
      console.log('No admin found. Creating default admin...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Create admin document
      await adminRef.add({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      
      console.log('Default admin created successfully!');
      return { success: true, message: 'Admin initialized successfully' };
    } else {
      console.log('Admin already exists, skipping initialization');
      return { success: true, message: 'Admin already exists' };
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
    return { success: false, error: error.message };
  }
};

// Login admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    // Find admin by email
    const adminRef = db.collection('admin');
    const snapshot = await adminRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Get admin data
    const adminDoc = snapshot.docs[0];
    const admin = {
      id: adminDoc.id,
      ...adminDoc.data()
    };
    
    // Compare passwords
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '1d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
// Add this function to your existing adminController.js file

// Register security personnel
// Update the registerSecurity function to include password

// Register security personnel
const registerSecurity = async (req, res) => {
  try {
    const { name, phone, email, securityId, password } = req.body;
    
    // Basic validation
    if (!name || !phone || !email || !securityId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: name, phone, email, securityId, and password' 
      });
    }
    
    // Check if security with this email or ID already exists
    const securityRef = db.collection('security');
    const emailSnapshot = await securityRef.where('email', '==', email).get();
    const idSnapshot = await securityRef.where('securityId', '==', securityId).get();
    
    if (!emailSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Security personnel with this email already exists' 
      });
    }
    
    if (!idSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Security personnel with this ID already exists' 
      });
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create security document
    const securityData = {
      name,
      phone,
      email,
      securityId,
      password: hashedPassword,
      status: 'active',
      createdAt: new Date()
    };
    
    const docRef = await securityRef.add(securityData);
    
    // Return success response with the created security data (exclude password)
    const { password: _, ...securityDataWithoutPassword } = securityData;
    
    res.status(201).json({
      success: true,
      message: 'Security personnel registered successfully',
      security: {
        id: docRef.id,
        ...securityDataWithoutPassword
      }
    });
    
  } catch (error) {
    console.error('Security registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during security registration', 
      error: error.message 
    });
  }
};

// Get all security personnel
const getAllSecurity = async (req, res) => {
  try {
    const securityRef = db.collection('security');
    const snapshot = await securityRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json({ 
        success: true, 
        message: 'No security personnel found',
        security: [] 
      });
    }
    
    const securityList = [];
    snapshot.forEach(doc => {
      securityList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      security: securityList
    });
    
  } catch (error) {
    console.error('Error fetching security personnel:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error when fetching security personnel', 
      error: error.message 
    });
  }
};

// Export the new functions
module.exports = {
  initializeAdmin,
  loginAdmin,
  registerSecurity,
  getAllSecurity
};
