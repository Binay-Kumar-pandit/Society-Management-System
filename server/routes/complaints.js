const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/complaints');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/complaints/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Get all complaints
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    
    // Members can only see their own complaints
    if (req.user.role === 'member') {
      filter.reportedBy = req.user.id;
    }
    
    const complaints = await Complaint.find(filter)
      .populate('reportedBy', 'name email houseNumber')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all complaints (admin only)
router.get('/all', auth, authorize('admin'), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('reportedBy', 'name email houseNumber')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ complaints });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get complaint by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findById(id)
      .populate('reportedBy', 'name email houseNumber')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && complaint.reportedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ complaint });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new complaint
router.post('/', auth, authorize('member', 'guest'), upload.single('photo'), async (req, res) => {
  try {
    const { title, description, category, priority, houseNumber } = req.body;
    
    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      houseNumber,
      reportedBy: req.user.id,
      photo: req.file ? req.file.filename : null
    });

    await complaint.save();
    
    // Populate the complaint with user data
    await complaint.populate('reportedBy', 'name email houseNumber');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('new-complaint', complaint);
    
    res.status(201).json({ message: 'Complaint reported successfully', complaint });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update complaint status
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, assignedTo },
      { new: true }
    ).populate('reportedBy', 'name email houseNumber')
     .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('complaint-status-updated', complaint);

    res.json({ message: 'Complaint status updated', complaint });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to complaint
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.comments.push({
      user: req.user.id,
      text,
      createdAt: new Date()
    });

    await complaint.save();
    
    // Populate the updated complaint
    await complaint.populate('comments.user', 'name email');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('complaint-comment-added', { complaintId: id, comment: complaint.comments[complaint.comments.length - 1] });

    res.json({ message: 'Comment added successfully', complaint });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete complaint
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('complaint-deleted', { complaintId: id });

    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;