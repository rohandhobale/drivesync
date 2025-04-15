import React from 'react';
import { ArrowRight, BarChart2, Truck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="relative bg-gradient-to-r from-blue-900 to-blue-700 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Optimize Your Return Trips with Smart Logistics
            </h1>
            <p className="mt-6 text-xl text-blue-100">
              Connect with businesses, reduce empty runs, and maximize your earnings with our intelligent delivery matching platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/driver-login')}
                className="bg-white text-blue-900 px-8 py-3 rounded-md font-semibold hover:bg-blue-50 flex items-center justify-center"
              >
                Start Driving <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={() => navigate('/business-login')}
                className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white/10 flex items-center justify-center"
              >
                Ship with Us
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80"
              alt="Logistics Dashboard"
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mb-24">
        <div className="grid md:grid-cols-3 gap-8 bg-white rounded-lg shadow-xl p-8 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Optimized Routes</h3>
              <p className="text-gray-600 mt-2">Smart algorithms to maximize your return trips</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Business Network</h3>
              <p className="text-gray-600 mt-2">Connect with trusted shipping partners</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Real-time Analytics</h3>
              <p className="text-gray-600 mt-2">Track and improve your performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}