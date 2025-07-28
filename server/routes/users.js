const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending guest users (admin only)
router.get('/pending-guests', auth, authorize('admin'), async (req, res) => {
  try {
    const pendingGuests = await User.find({ 
      role: 'guest', 
      isApproved: false 
    }).select('-password');
    
    res.json({ users: pendingGuests });
  } catch (error) {
    console.error('Get pending guests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalGuests = await User.countDocuments({ role: 'guest', isApproved: true });
    const maleCount = await User.countDocuments({ gender: 'male' });
    const femaleCount = await User.countDocuments({ gender: 'female' });
    
    const ageGroups = await User.aggregate([
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$age', 18] }, then: 'Under 18' },
                { case: { $lt: ['$age', 30] }, then: '18-29' },
                { case: { $lt: ['$age', 50] }, then: '30-49' },
                { case: { $gte: ['$age', 50] }, then: '50+' }
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      totalUsers,
      totalMembers,
      totalGuests,
      maleCount,
      femaleCount,
      ageGroups
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, phoneNumber, houseNumber, age, gender } = req.body;
    
    const updateData = {
      name,
      email,
      phoneNumber,
      age: parseInt(age),
      gender
    };

    // Only update houseNumber for members
    if (req.user.role === 'member' && houseNumber) {
      updateData.houseNumber = houseNumber;
    }

    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve guest user (admin only)
router.put('/:id/approve', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('guest-user-approved', { userId: id, isApproved });

    res.json({ message: `Guest ${isApproved ? 'approved' : 'rejected'}`, user });
  } catch (error) {
    console.error('Approve guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (admin only)
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('user-status-updated', { userId: id, isActive });

    res.json({ message: 'User status updated', user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('user-deleted', { userId: id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;