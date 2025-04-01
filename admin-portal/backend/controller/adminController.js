const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebaseAdmin');

const initializeAdmin = async () => {
  const email = 'admin@iiit.ac.in';
  const password = 'admin@1234';

  try {
    // Check if admin already exists in Firestore
    const adminRef = db.collection('admins').doc(email);
    const doc = await adminRef.get();
    if (doc.exists) {
      console.log('Admin already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    // Store admin data in Firestore
    await adminRef.set({
      uid: userRecord.uid,
      email: email,
      password: hashedPassword, // Store the hashed password
    });

    console.log('Admin created successfully');
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

exports.initializeAdmin = initializeAdmin;

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get admin from Firestore
    const adminRef = db.collection('admins').doc(email);
    const doc = await adminRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const adminData = doc.data();

    // Compare password
    const passwordMatch = await bcrypt.compare(password, adminData.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ uid: adminData.uid, email: email }, 'your-secret-key', { // Replace 'your-secret-key' with a strong, secret key
      expiresIn: '1h'
    });

    res.status(200).json({ message: 'Admin logged in successfully', token: token });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Failed to log in admin', error: error.message });
  }
};
