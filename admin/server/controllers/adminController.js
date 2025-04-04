const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, admin } = require('../config/firebaseAdmin');

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

      // Also create admin user in Firebase Auth
      try {
        await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: 'Admin',
        });
        console.log('Admin user created in Firebase Auth');
      } catch (authError) {
        if (authError.code === 'auth/email-already-exists') {
          console.log('Admin user already exists in Firebase Auth');
        } else {
          console.error('Error creating admin in Firebase Auth:', authError);
        }
      }
      
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

// Register security personnel in 'users' collection
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
    
    // Check if security with this email or ID already exists in users collection
    const usersRef = db.collection('users');
    const emailSnapshot = await usersRef.where('email', '==', email).get();
    const idSnapshot = await usersRef.where('securityId', '==', securityId).where('role', '==', 'security').get();
    
    if (!emailSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    if (!idSnapshot.empty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Security personnel with this ID already exists' 
      });
    }
    
    // Hash the password for Firestore
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create security document in users collection
    const securityData = {
      name,
      phone,
      email,
      securityId,
      password: hashedPassword,
      status: 'active',
      role: 'security',
      userType: 'security', // Add userType for easier filtering
      createdAt: new Date()
    };
    
    const docRef = await usersRef.add(securityData);
    
    // Also create user in Firebase Auth
    try {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      
      // Set custom claims to identify this user as security
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: 'security',
        securityId
      });
      
      // Update the document with Firebase Auth UID
      await docRef.update({
        uid: userRecord.uid
      });
      
      console.log('Security user created in Firebase Auth with custom claims');
    } catch (authError) {
      console.error('Firebase user creation error:', authError);
      // If Firebase Auth creation fails, we should delete the Firestore record
      try {
        await docRef.delete();
        return res.status(500).json({ 
          success: false, 
          message: 'Error creating security user in authentication system', 
          error: authError.message 
        });
      } catch (deleteError) {
        console.error('Error deleting security record after auth failure:', deleteError);
      }
    }
    
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

// Get all security personnel from users collection
const getAllSecurity = async (req, res) => {
  try {
    // Query users collection for security personnel
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('role', '==', 'security').get();
    
    if (snapshot.empty) {
      return res.status(200).json({ 
        success: true, 
        message: 'No security personnel found',
        security: [] 
      });
    }
    
    const securityList = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Remove password from response
      const { password, ...securityData } = data;
      
      securityList.push({
        id: doc.id,
        ...securityData
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

const getAllEntries = async (req, res) => {
  try {
    const lateEntriesRef = db.collection('lateEntries');
    const snapshot = await lateEntriesRef.get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'No late entries found',
        entries: [],
      });
    }

    const entries = [];
    snapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json({
      success: true,
      entries,
    });
  } catch (error) {
    console.error('Error fetching late entries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when fetching late entries',
      error: error.message,
    });
  }
};

const updateVerificationStatus = async (req, res) => {
  try {
    const { entryId, status } = req.body;

    if (!entryId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide entryId and status',
      });
    }

    const entryRef = db.collection('lateEntries').doc(entryId);
    const entryDoc = await entryRef.get();

    if (!entryDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Late entry not found',
      });
    }

    const entryData = entryDoc.data();

    // Update the verification status
    await entryRef.update({
      verificationStatus: status,
    });

    // Send notification to the student
    await db.collection('notifications').add({
      userId: entryData.studentId,
      message: `Your late entry has been ${status} by the admin.`,
      timestamp: new Date(),
      readStatus: false,
    });

    res.status(200).json({
      success: true,
      message: `Late entry verification status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when updating verification status',
      error: error.message,
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('role', '==', 'student').get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        message: 'No students found',
        students: [],
      });
    }

    // Fetch all students and sort them based on the first two digits of their roll number
    const students = [];
    snapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    students.sort((a, b) => {
      const rollAFirstTwo = parseInt(a.rollNumber.substring(0, 2), 10);
      const rollBFirstTwo = parseInt(b.rollNumber.substring(0, 2), 10);
    
      if (rollAFirstTwo === rollBFirstTwo) {
        return a.rollNumber.localeCompare(b.rollNumber);
      }
    
      return rollAFirstTwo - rollBFirstTwo;
    });

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when fetching students',
      error: error.message,
    });
  }
};

module.exports = {
  initializeAdmin,
  loginAdmin,
  registerSecurity,
  getAllSecurity,
  getAllEntries,
  updateVerificationStatus,
  getAllStudents, // New function
};