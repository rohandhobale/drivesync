import express from 'express';
import Shipment from '../models/Shipment.js';
import User from '../models/User.js';
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
    // Add debug logging
    console.log('Fetching shipments for business ID:', req.user.userId);
    
    // First, fetch shipments WITHOUT using lean() to maintain Mongoose document methods
    const shipments = await Shipment.find({ businessId: req.user.userId })
      .populate({
        path: 'driverId',
        select: 'username vehicleType contactNumber email'
      })
      .populate({
        path: 'requests.driverId',
        select: 'username vehicleType contactNumber email'
      })
      .sort({ createdAt: -1 });
    
    // Convert to plain objects AFTER population is complete and make sure driver data is properly handled
    const processedShipments = shipments.map(shipment => {
      const plainShipment = shipment.toObject();
      
      // Fix: Ensure each request has proper driver info
      if (plainShipment.requests && plainShipment.requests.length > 0) {
        plainShipment.requests = plainShipment.requests.map(request => {
          // Critical fix: Check if driverId exists and verify it's an object with the expected properties
          if (!request.driverId || typeof request.driverId !== 'object' || !request.driverId.username) {
            // Try to fetch driver info directly if possible
            return {
              ...request,
              driverId: {
                _id: typeof request.driverId === 'string' ? request.driverId : 'unknown',
                username: 'Driver data unavailable',
                vehicleType: 'Unknown',
                contactNumber: 'Not available'
              }
            };
          }
          return request;
        });
      }
      
      // Handle main shipment driver
      if (plainShipment.status === 'active' && (!plainShipment.driverId || typeof plainShipment.driverId !== 'object')) {
        // If a driver should be assigned but isn't available
        plainShipment.driverId = {
          _id: typeof plainShipment.driverId === 'string' ? plainShipment.driverId : 'unknown',
          username: 'Driver data unavailable',
          vehicleType: 'Unknown',
          contactNumber: 'Not available'
        };
      }
      
      return plainShipment;
    });
    
    // Add sample logging for debugging
    if (processedShipments.length > 0) {
      console.log('First shipment sample after processing:', {
        id: processedShipments[0]._id,
        title: processedShipments[0].title,
        status: processedShipments[0].status,
        driverId: processedShipments[0].driverId || 'none',
        requestsCount: processedShipments[0].requests?.length || 0
      });
      
      // Check if we have request data
      if (processedShipments[0].requests && processedShipments[0].requests.length > 0) {
        const firstRequest = processedShipments[0].requests[0];
        console.log('First request sample after processing:', {
          id: firstRequest._id,
          driverId: firstRequest.driverId,
          status: firstRequest.status
        });
      }
    }
    
    res.json(processedShipments);
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
    }).populate('businessId', 'businessName contactNumber');
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

    // Make sure we're using the correct ID field from req.user
    const driverId = req.user.userId || req.user.id;
    
    const existingRequest = shipment.requests.find(
      request => request.driverId && request.driverId.toString() === driverId
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already exists' });
    }

    // Add driver request
    shipment.requests.push({
      driverId: driverId,
      status: 'pending'
    });

    await shipment.save();
    
    // Fix: Make sure to fully populate driver details before returning
    await shipment.populate({
      path: 'requests.driverId',
      select: 'username vehicleType contactNumber email'
    });
    
    res.status(201).json(shipment);
  } catch (error) {
    console.error('Request shipment error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Business accepts/rejects driver request
router.patch('/:id/request/:requestId', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Fix: Ensure we have the full shipment object with populated references
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
        if (req._id.toString() !== request._id.toString()) {
          req.status = 'rejected';
        }
      });
    }

    await shipment.save();
    
    // Fix: Properly populate all references before returning
    await Shipment.populate(shipment, [
      {
        path: 'driverId',
        select: 'username vehicleType contactNumber email'
      },
      {
        path: 'requests.driverId',
        select: 'username vehicleType contactNumber email'
      }
    ]);
    
    res.json(shipment);
  } catch (error) {
    console.error('Handle driver request error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Set pickup and dropoff locations
router.patch('/:id/locations', authenticateToken, async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    if (pickupLocation) {
      shipment.pickupLocation = pickupLocation;
    }
    if (dropoffLocation) {
      shipment.dropoffLocation = dropoffLocation;
    }

    await shipment.save();
    res.json(shipment);
  } catch (error) {
    console.error('Update locations error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update current location (for drivers)
router.patch('/:id/current-location', authenticateToken, async (req, res) => {
  try {
    const { location } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    shipment.currentLocation = location;
    shipment.lastLocationUpdate = new Date();
    await shipment.save();
    res.json(shipment);
  } catch (error) {
    console.error('Update current location error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update shipment status with location tracking
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, location } = req.body;
    const shipment = await Shipment.findById(req.params.id);
    
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    shipment.status = status;
    if (location) {
      shipment.currentLocation = location;
      shipment.lastLocationUpdate = new Date();
    }

    await shipment.save();
    res.json(shipment);
  } catch (error) {
    console.error('Update shipment status error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;