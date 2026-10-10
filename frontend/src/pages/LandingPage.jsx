import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-navy-900 transition-colors duration-300">
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="bg-sage-500 p-2 rounded-xl">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
          </div>
          <span className="font-display font-bold text-2xl text-navy-900 dark:text-white">FreshFind</span>
        </div>
        <nav className="space-x-4">
          <Link to="/auth/login" className="text-gray-600 dark:text-gray-300 font-medium hover:text-navy-900 dark:hover:text-white transition-colors">Log In</Link>
          <Link to="/auth/register" className="bg-sage-600 hover:bg-sage-700 text-white px-5 py-2.5 rounded-full font-medium transition-colors">Sign Up</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-6xl font-display font-bold text-navy-900 dark:text-white mb-6 leading-tight max-w-4xl">
          AI Powered <span className="text-sage-500">Food Freshness</span> Detection
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl">
          Ensure your produce is at its peak quality. We use advanced computer vision to classify and track freshness instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/auth/login" className="bg-navy-900 dark:bg-sage-500 hover:bg-navy-800 dark:hover:bg-sage-600 text-white px-8 py-4 rounded-full font-semibold text-lg transition-colors shadow-float">
            Start Scanning Now
          </Link>
          <Link to="/guide" className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-gray-700 text-navy-900 dark:text-white hover:bg-gray-50 dark:hover:bg-navy-700 px-8 py-4 rounded-full font-semibold text-lg transition-colors">
            View Food Guide
          </Link>
        </div>
      </main>
    </div>
  );
}
