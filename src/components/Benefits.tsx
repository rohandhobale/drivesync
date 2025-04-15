import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function Benefits() {
  return (
    <section id="benefits" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Why Choose DriveSync?</h2>
            <p className="mt-4 text-xl text-gray-600">
              Join thousands of drivers and businesses optimizing their logistics operations
            </p>
            
            <div className="mt-8 space-y-4">
              {[
                "Reduce empty return trips by up to 40%",
                "Increase your earnings with smart load matching",
                "Access to a network of verified businesses",
                "Real-time tracking and performance analytics",
                "Secure and timely payments",
                "24/7 customer support"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <button className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700">
              Get Started Now
            </button>
          </div>

          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80"
              alt="Logistics Benefits"
              className="rounded-lg shadow-xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold text-blue-600">40%</div>
              <div className="text-gray-600">Average cost savings</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}