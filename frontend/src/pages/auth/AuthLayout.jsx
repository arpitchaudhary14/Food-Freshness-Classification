import React from 'react';
import { Outlet } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col md:flex-row">
      {/* Left side - Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white md:w-1/2 relative z-10 shadow-float">
        <div className="w-full max-w-md">
          <div className="flex items-center space-x-2 mb-10">
            <div className="bg-sage-500 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-navy-900 tracking-wide">FreshFind</span>
          </div>
          <Outlet />
        </div>
      </div>

      {/* Right side - Decorative / Brand Area */}
      <div className="hidden md:flex flex-1 bg-sage-500 relative overflow-hidden items-center justify-center">
        {/* Decorative Circles matching the UI reference split-screen aesthetic */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sage-400/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cream-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-sage-300/40 rounded-full blur-xl"></div>
        
        <div className="relative z-10 text-center p-12 max-w-lg">
          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight">AI Powered Food Freshness</h2>
          <p className="text-sage-100 text-lg">
            Ensure your produce is at its peak quality. We use advanced computer vision to classify and track freshness across 22 categories.
          </p>
        </div>
      </div>
    </div>
  );
}
