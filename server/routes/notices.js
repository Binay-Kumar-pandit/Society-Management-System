const express = require('express');
const Notice = require('../models/Notice');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all notices
router.get('/', auth, async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true })
      .populate('postedBy', 'name email role')
      .sort({ isPinned: -1, priority: -1, createdAt: -1 });
    
    res.json({ notices });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notice by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('postedBy', 'name email role');
    
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    res.json({ notice });
  } catch (error) {
    console.error('Get notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new notice
router.post('/', auth, authorize('admin', 'member'), async (req, res) => {
  try {
    const { title, description, category, priority, validUntil, isPinned } = req.body;
    
    const notice = new Notice({
      title,
      description,
      category,
      priority,
      validUntil,
      isPinned: req.user.role === 'admin' ? isPinned : false,
      postedBy: req.user.id
    });

    await notice.save();
    
    // Populate the notice with user data
    await notice.populate('postedBy', 'name email role');
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('new-notice', notice);
    
    res.status(201).json({ message: 'Notice created successfully', notice });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notice
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, validUntil, isPinned } = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && notice.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {
      title,
      description,
      category,
      priority,
      validUntil
    };

    // Only admin can pin/unpin notices
    if (req.user.role === 'admin') {
      updateData.isPinned = isPinned;
    }

    const updatedNotice = await Notice.findByIdAndUpdate(id, updateData, { new: true })
      .populate('postedBy', 'name email role');

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('notice-updated', updatedNotice);

    res.json({ message: 'Notice updated successfully', notice: updatedNotice });
  } catch (error) {
    console.error('Update notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notice
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && notice.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Notice.findByIdAndDelete(id);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('notice-deleted', { noticeId: id });

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;