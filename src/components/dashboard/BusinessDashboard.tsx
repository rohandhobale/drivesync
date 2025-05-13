import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessProfile from './BusinessProfile';
import { 
  TruckIcon, 
  Search, 
  LogOut, 
  User, 
  Package, 
  Clock, 
  CheckCircle,
  Bell,
  Settings,
  Plus,
  BarChart2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getBusinessShipments } from '../../services/shipment';
import { logoutUser } from '../../services/api';
import PostShipment from './PostShipment';
import ManageShipments from './ManageShipments';

export default function BusinessDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [metrics, setMetrics] = useState({
    totalShipments: 0,
    activeShipments: 0,
    completedShipments: 0,
    pendingRequests: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const data = await getBusinessShipments();
      setShipments(data);
      
      // Calculate metrics
      const total = data.length;
      const active = data.filter(s => s.status === 'active').length;
      const completed = data.filter(s => s.status === 'completed').length;
      const pending = data.reduce((acc, s) => acc + s.requests.filter(r => r.status === 'pending').length, 0);
      
      setMetrics({
        totalShipments: total,
        activeShipments: active,
        completedShipments: completed,
        pendingRequests: pending
      });
    } catch (error) {
      toast.error('Failed to fetch shipments');
    }
  };

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setActiveSection('manage');
    setShowNotifications(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <BusinessProfile />;
      case 'post':
        return <PostShipment onShipmentCreated={fetchShipments} />;
      case 'manage':
        return <ManageShipments 
          shipments={shipments} 
          onUpdate={fetchShipments}
          selectedShipment={selectedShipment}
        />;
      default:
        return (
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.totalShipments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-lg p-3">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.activeShipments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.completedShipments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 rounded-lg p-3">
                    <User className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.pendingRequests}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Shipments</h2>
                <div className="space-y-4">
                  {shipments.slice(0, 5).map((shipment) => (
                    <div key={shipment._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{shipment.title}</h3>
                          <p className="text-sm text-gray-500">
                            From: {shipment.fromCity} • To: {shipment.toCity}
                          </p>
                          <p className="text-sm text-gray-500">
                            Deadline: {new Date(shipment.deadline).toLocaleDateString()}
                          </p>
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
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {shipment.requests.length} driver requests
                        </span>
                        <button 
                          onClick={() => handleViewDetails(shipment)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
            
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="max-w-lg w-full">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search shipments..."
                    type="search"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-blue-600"
              >
                <Bell className="h-6 w-6" />
                {metrics.pendingRequests > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                )}
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
                alt="Business Profile"
              />
              <h2 className="mt-2 text-xl font-semibold text-gray-900">Business Dashboard</h2>
              <p className="text-sm text-gray-500">Premium Member</p>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveSection('overview');
                  setSelectedShipment(null);
                }}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'overview' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <BarChart2 className="mr-3 h-5 w-5" />
                Dashboard Overview
              </button>

              <button
                onClick={() => {
                  setActiveSection('profile');
                  setSelectedShipment(null);
                }}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'profile' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="mr-3 h-5 w-5" />
                Edit Profile
              </button>

              <button
                onClick={() => {
                  setActiveSection('post');
                  setSelectedShipment(null);
                }}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'post' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Plus className="mr-3 h-5 w-5" />
                Post a Shipment
              </button>

              <button
                onClick={() => {
                  setActiveSection('manage');
                  setSelectedShipment(null);
                }}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  activeSection === 'manage' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="mr-3 h-5 w-5" />
                Manage Shipments
              </button>

              <button
                onClick={() => {
                  setActiveSection('settings');
                  setSelectedShipment(null);
                }}
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

        {/* Notifications Panel */}
        {showNotifications && (
          <div className="fixed right-0 top-16 w-80 bg-white shadow-lg rounded-lg m-4 p-4 z-50">
            <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-4">
              {shipments
                .filter(s => s.requests.some(r => r.status === 'pending'))
                .map(shipment => (
                  <div key={shipment._id} className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        New driver request for shipment {shipment.title}
                      </p>
                      <button
                        onClick={() => handleViewDetails(shipment)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}