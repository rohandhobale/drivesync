import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TruckIcon, 
  Search, 
  LogOut, 
  User, 
  MapPin,
  Package,
  Settings,
  Bell
} from 'lucide-react';
import { toast } from 'react-toastify';
import { logoutUser } from '../../services/api';
import { getCityShipments, requestShipment } from '../../services/shipment';
import DriverProfile from './DriverProfile';
import DriverShipments from './DriverShipments';

export default function DriverDashboard() {
  const [activeSection, setActiveSection] = useState('shipments');
  const [selectedCity, setSelectedCity] = useState('');
  const [availableShipments, setAvailableShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cities = [
    'Delhi', 'Pune', 'Mumbai', 'Banglore', 'Kolkata',
    'Thane', 'Surat', 'Ahemdabad', 'Srinagar', 'Indore'
  ];

  useEffect(() => {
    if (selectedCity) {
      fetchShipments();
    }
  }, [selectedCity]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const data = await getCityShipments(selectedCity);
      setAvailableShipments(data);
    } catch (error) {
      toast.error('Failed to fetch shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptShipment = async (shipmentId: string) => {
    try {
      await requestShipment(shipmentId);
      toast.success('Shipment request sent successfully');
      fetchShipments();
    } catch (error) {
      toast.error('Failed to request shipment');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <DriverProfile />;
      case 'shipments':
        return <DriverShipments />;
      default:
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Available Shipments</h2>
              <p className="mt-2 text-gray-600">Select a city to view available shipments</p>
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`p-3 rounded-lg text-sm font-medium ${
                      selectedCity === city
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading shipments...</p>
              </div>
            ) : selectedCity ? (
              <div className="space-y-6">
                {availableShipments.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg">
                    <Package className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="mt-4 text-gray-600">No shipments available in {selectedCity}</p>
                  </div>
                ) : (
                  availableShipments.map((shipment) => (
                    <div key={shipment._id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{shipment.title}</h3>
                          <p className="text-sm text-gray-500">
                            To: {shipment.toCity}
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
                        <button
                          onClick={() => handleAcceptShipment(shipment._id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Accept Shipment
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-4 text-gray-600">Select a city to view available shipments</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TruckIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">DriveSync</span>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-blue-600">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Profile"
                />
                <button 
                  onClick={handleLogout}
                  className="ml-2 p-2 text-gray-600 hover:text-blue-600"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="fixed w-64 h-full bg-white shadow-sm">
          <div className="p-4">
            <div className="text-center mb-6">
              <img
                className="h-20 w-20 rounded-full mx-auto"
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="Driver Profile"
              />
              <h2 className="mt-2 text-xl font-semibold text-gray-900">Driver Dashboard</h2>
              <p className="text-sm text-gray-500">Active Driver</p>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveSection('available')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'available' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="mr-3 h-5 w-5" />
                Available Shipments
              </button>

              <button
                onClick={() => setActiveSection('shipments')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'shipments' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TruckIcon className="mr-3 h-5 w-5" />
                My Shipments
              </button>

              <button
                onClick={() => setActiveSection('profile')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'profile' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Profile
              </button>

              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'settings' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="mr-3 h-5 w-5" />
                Settings
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="ml-64 flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}