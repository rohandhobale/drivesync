import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { handleDriverRequest, updateShipmentStatus, updateShipmentLocations } from '../../services/shipment';
import LocationPicker from '../tracking/LocationPicker';
import ShipmentMap from '../tracking/ShipmentMap';

type ShipmentType = {
  _id: string;
  title: string;
  fromCity: string;
  toCity: string;
  status: string;
  deadline: string;
  weight: number;
  volume: string;
  description: string;
  pickupLocation?: { lat: number; lng: number };
  dropoffLocation?: { lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  requests: Array<{
    _id: string;
    driverId: {
      _id: string;
      username: string;
      vehicleType: string;
      contactNumber: string;
    };
    status: string;
  }>;
};

type ManageShipmentsProps = {
  shipments: ShipmentType[];
  onUpdate: () => void;
};

export default function ManageShipments({ shipments, onUpdate }: ManageShipmentsProps) {
  const [selectedShipment, setSelectedShipment] = useState<ShipmentType | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState<'pickup' | 'dropoff' | null>(null);

  const handleRequestAction = async (shipmentId: string, requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await handleDriverRequest(shipmentId, requestId, status);
      toast.success(`Driver request ${status}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const handleStatusUpdate = async (shipmentId: string, status: string) => {
    try {
      await updateShipmentStatus(shipmentId, status);
      toast.success('Shipment status updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    if (!selectedShipment || !showLocationPicker) return;

    try {
      await updateShipmentLocations(
        selectedShipment._id,
        showLocationPicker === 'pickup' ? location : undefined,
        showLocationPicker === 'dropoff' ? location : undefined
      );
      toast.success(`${showLocationPicker === 'pickup' ? 'Pickup' : 'Dropoff'} location updated`);
      onUpdate();
      setShowLocationPicker(null);
    } catch (error) {
      toast.error('Failed to update location');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manage Shipments</h2>
      
      <div className="space-y-6">
        {shipments.map((shipment) => (
          <div key={shipment._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{shipment.title}</h3>
                <p className="text-sm text-gray-500">
                  From: {shipment.fromCity} • To: {shipment.toCity}
                </p>
                <p className="text-sm text-gray-500">
                  Deadline: {new Date(shipment.deadline).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Weight: {shipment.weight}kg • Volume: {shipment.volume}
                </p>
                {shipment.description && (
                  <p className="mt-2 text-sm text-gray-600">{shipment.description}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={shipment.status}
                  onChange={(e) => handleStatusUpdate(shipment._id, e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  shipment.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : shipment.status === 'delivered'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {shipment.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Location Management */}
            <div className="mt-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedShipment(shipment);
                    setShowLocationPicker('pickup');
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Set Pickup Location
                </button>
                <button
                  onClick={() => {
                    setSelectedShipment(shipment);
                    setShowLocationPicker('dropoff');
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Set Dropoff Location
                </button>
              </div>

              {selectedShipment?._id === shipment._id && showLocationPicker && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Select {showLocationPicker === 'pickup' ? 'Pickup' : 'Dropoff'} Location
                  </h4>
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={
                      showLocationPicker === 'pickup'
                        ? shipment.pickupLocation
                        : shipment.dropoffLocation
                    }
                  />
                </div>
              )}

              {shipment.pickupLocation && shipment.dropoffLocation && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Shipment Route</h4>
                  <ShipmentMap shipment={shipment} />
                </div>
              )}
            </div>

            {shipment.requests.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Driver Requests</h4>
                <div className="space-y-3">
                  {shipment.requests.map((request) => (
                    <div key={request._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {request.driverId.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          Vehicle: {request.driverId.vehicleType} • Contact: {request.driverId.contactNumber}
                        </p>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRequestAction(shipment._id, request._id, 'accepted')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRequestAction(shipment._id, request._id, 'rejected')}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          request.status === 'accepted' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}