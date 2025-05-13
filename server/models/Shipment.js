import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
});

const requestSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

const shipmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  fromCity: {
    type: String,
    required: true,
  },
  toCity: {
    type: String,
    required: true,
  },
  description: String,
  deadline: {
    type: Date,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  volume: {
    type: String,
    required: true,
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requests: [requestSchema],
  pickupLocation: locationSchema,
  dropoffLocation: locationSchema,
  currentLocation: locationSchema,
  lastLocationUpdate: Date
}, {
  timestamps: true
});

export default mongoose.model('Shipment', shipmentSchema);