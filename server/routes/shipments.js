import express from 'express';
import Shipment from '../models/Shipment.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new shipment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const shipment = new Shipment({
      ...req.body,
      businessId: req.user.userId,
      status: 'pending'
    });
    await shipment.save();
    res.status(201).json(shipment);
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all shipments for a business
router.get('/business', authenticateToken, async (req, res) => {
  try {
    const shipments = await Shipment.find({ businessId: req.user.userId })
      .populate('driverId', 'username')
      .sort({ createdAt: -1 });
    res.json(shipments);
  } catch (error) {
    console.error('Get business shipments error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get shipments by city for drivers
router.get('/city/:city', authenticateToken, async (req, res) => {
  try {
    const shipments = await Shipment.find({
      fromCity: req.params.city,
      status: 'pending'
    }).populate('businessId', 'businessName');
    res.json(shipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Driver requests for a shipment
router.post('/:id/request', authenticateToken, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const existingRequest = shipment.requests.find(
      request => request.driverId.toString() === req.user.id
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already exists' });
    }

    shipment.requests.push({
      driverId: req.user.id,
      status: 'pending'
    });

    await shipment.save();
    res.status(201).json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Business accepts/rejects driver request
router.patch('/:id/request/:requestId', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    const request = shipment.requests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    if (status === 'accepted') {
      shipment.status = 'active';
      shipment.driverId = request.driverId;
      
      // Reject all other requests
      shipment.requests.forEach(req => {
        if (req._id !== request._id) {
          req.status = 'rejected';
        }
      });
    }

    await shipment.save();
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update shipment status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    shipment.status = status;
    await shipment.save();
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;