const express = require('express');
const Guest = require('../models/Guest');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all guests
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    
    // Members can only see their own added guests
    if (req.user.role === 'member') {
      filter.addedBy = req.user.id;
    }
    
    const guests = await Guest.find(filter)
      .populate('addedBy', 'name email houseNumber')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ guests });
  } catch (error) {
    console.error('Get guests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending guests (admin only)
router.get('/pending', auth, authorize('admin'), async (req, res) => {
  try {
    const guests = await Guest.find({ status: 'pending' })
      .populate('addedBy', 'name email houseNumber')
      .sort({ createdAt: -1 });
    
    res.json({ guests });
  } catch (error) {
    console.error('Get pending guests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get guest by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const guest = await Guest.findById(id)
      .populate('addedBy', 'name email houseNumber')
      .populate('approvedBy', 'name email');
    
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    
    // Check permissions
    if (req.user.role !== 'admin' && guest.addedBy._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json({ guest });
  } catch (error) {
    console.error('Get guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new guest
router.post('/', auth, authorize('member'), async (req, res) => {
  try {
    const { name, email, phoneNumber, gender, age, purpose, visitingHouse, validUntil } = req.body;
    
    const guest = new Guest({
      name,
      email,
      phoneNumber,
      gender,
      age,
      purpose,
      visitingHouse,
      validUntil,
      addedBy: req.user.id
    });

    await guest.save();
    
    // Populate the guest with user data
    await guest.populate('addedBy', 'name email houseNumber');
    
    // Emit real-time update to admin
    const io = req.app.get('io');
    io.emit('new-guest-request', guest);
    
    res.status(201).json({ message: 'Guest added successfully. Waiting for admin approval.', guest });
  } catch (error) {
    console.error('Add guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update guest status (admin only)
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const updateData = {
      status,
      approvedBy: req.user.id,
      approvalDate: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const guest = await Guest.findByIdAndUpdate(id, updateData, { new: true })
      .populate('addedBy', 'name email houseNumber')
      .populate('approvedBy', 'name email');

    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Emit real-time update to the member who added the guest
    const io = req.app.get('io');
    io.emit('guest-status-updated', guest);

    res.json({ message: `Guest ${status} successfully`, guest });
  } catch (error) {
    console.error('Update guest status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete guest
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const guest = await Guest.findById(id);
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && guest.addedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Guest.findByIdAndDelete(id);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('guest-deleted', { guestId: id });

    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Delete guest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;