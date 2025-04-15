import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getDriverShipments } from '../../services/driver';

type ShipmentType = {
  _id: string;
  title: string;
  fromCity: string;
  toCity: string;
  status: string;
  deadline: string;
  weight: number;
  cost:number;
  volume: string;
  description: string;
  businessId: {
    businessName: string;
    contactNumber: string;
  };
};

export default function DriverShipments() {
  const [shipments, setShipments] = useState<ShipmentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      const data = await getDriverShipments();
      setShipments(data);
    } catch (error) {
      toast.error('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading shipments...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">My Shipments</h2>

      {shipments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No shipments found</p>
        </div>
      ) : (
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
                  <p className="text-sm text-gray-500">
                    Cost: {shipment.cost}INR
                  </p>
                  {shipment.description && (
                    <p className="mt-2 text-sm text-gray-600">{shipment.description}</p>
                  )}
                  <div className="mt-4 text-sm">
                    <p className="font-medium text-gray-900">Business Details:</p>
                    <p className="text-gray-600">
                      {shipment.businessId.businessName} • {shipment.businessId.contactNumber}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  shipment.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : shipment.status === 'completed'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {shipment.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}