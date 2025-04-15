import React from 'react';
import { MapPin, Clock, Shield, TrendingUp, Zap, Phone } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Dynamic Route Optimization",
      description: "AI-powered algorithms find the most efficient routes for your return trips"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Matching",
      description: "Instant connection with businesses looking for delivery services"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Compliant",
      description: "Enterprise-grade security and regulatory compliance built-in"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Detailed insights to optimize your operations and earnings"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Quick Payments",
      description: "Fast and secure payment processing after delivery completion"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance for all your delivery needs"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Powerful Features for Modern Logistics</h2>
          <p className="mt-4 text-xl text-gray-600">Everything you need to optimize your delivery operations</p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-lg w-12 h-12 flex items-center justify-center text-blue-600">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}