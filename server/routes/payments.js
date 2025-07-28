const express = require('express');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get payments
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    
    // Members can only see their own payments
    if (req.user.role === 'member') {
      filter.houseNumber = req.user.houseNumber;
    }
    
    const payments = await Payment.find(filter)
      .populate('paidBy', 'name email')
      .sort({ dueDate: -1 });
    
    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    let filter = {};
    
    // Members can only see their own stats
    if (req.user.role === 'member') {
      filter.houseNumber = req.user.houseNumber;
    }
    
    const totalDue = await Payment.aggregate([
      { $match: { ...filter, status: { $in: ['pending', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalPaid = await Payment.aggregate([
      { $match: { ...filter, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingPayments = await Payment.countDocuments({ ...filter, status: 'pending' });
    const overduePayments = await Payment.countDocuments({ ...filter, status: 'overdue' });
    
    res.json({
      totalDue: totalDue[0]?.total || 0,
      totalPaid: totalPaid[0]?.total || 0,
      pendingPayments,
      overduePayments
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      houseNumber,
      description,
      amount,
      dueDate,
      type
    } = req.body;
    
    const payment = new Payment({
      houseNumber,
      description,
      amount,
      dueDate,
      type,
      createdBy: req.user.id
    });

    await payment.save();
    
    res.status(201).json({ message: 'Payment created successfully', payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process payment
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && payment.houseNumber !== req.user.houseNumber) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    payment.status = 'paid';
    payment.paidBy = req.user.id;
    payment.paidDate = new Date();
    payment.paymentMethod = paymentMethod || 'online';

    await payment.save();

    res.json({ message: 'Payment processed successfully', payment });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update payment status (admin only)
router.put('/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = { status };
    
    // If marking as paid, set payment date and method
    if (status === 'paid') {
      updateData.paidDate = new Date();
      updateData.paymentMethod = 'cash'; // Default for admin updates
    } else if (status === 'pending') {
      updateData.paidDate = null;
      updateData.paymentMethod = null;
    }

    const payment = await Payment.findByIdAndUpdate(id, updateData, { new: true });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('payment-status-updated', payment);

    res.json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;