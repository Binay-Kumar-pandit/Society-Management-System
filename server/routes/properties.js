const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Property = require('../models/Property');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all properties
router.get('/', auth, async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('currentTenant', 'name email phoneNumber')
      .sort({ flatNumber: 1 });
    
    res.json({ properties });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get property by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('currentTenant', 'name email phoneNumber');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json({ property });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new property (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const {
      flatNumber,
      type,
      bedrooms,
      bathrooms,
      area,
      rent,
      status,
      description,
      amenities,
      images
    } = req.body;
    
    // Check if flat number already exists
    const existingProperty = await Property.findOne({ flatNumber });
    if (existingProperty) {
      return res.status(400).json({ message: 'Flat number already exists' });
    }
    
    const property = new Property({
      flatNumber,
      type,
      bedrooms,
      bathrooms,
      area,
      rent,
      status,
      description,
      amenities,
      images,
      createdBy: req.user.id
    });

    await property.save();
    
    res.status(201).json({ message: 'Property created successfully', property });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update property (admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const property = await Property.findByIdAndUpdate(id, updateData, { new: true })
      .populate('currentTenant', 'name email phoneNumber');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property updated successfully', property });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete property (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByIdAndDelete(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book property (member only)
router.post('/:id/book', auth, authorize('member'), async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'available') {
      return res.status(400).json({ message: 'Property is not available for booking' });
    }

    property.status = 'reserved';
    property.currentTenant = req.user.id;
    property.leaseStartDate = startDate;
    property.leaseEndDate = endDate;

    await property.save();

    res.json({ message: 'Property booked successfully', property });
  } catch (error) {
    console.error('Book property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;