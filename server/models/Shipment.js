import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  fromCity: {
    type: String,
    required: true
  },
  toCity: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed'],
    default: 'pending'
  },
  deadline: {
    type: Date,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  volume: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  description: String,
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  requests: [{
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Shipment', shipmentSchema);