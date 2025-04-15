import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Shipment from '../models/Shipment.js';

const router = express.Router();

// Get driver profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const driver = await User.findById(req.user.userId).select('-password');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update driver profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Prevent password update through this route
    
    const driver = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get driver's shipments
router.get('/shipments', authenticateToken, async (req, res) => {
  try {
    const shipments = await Shipment.find({
      driverId: req.user.userId
    }).populate('businessId', 'businessName contactNumber');
    
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;