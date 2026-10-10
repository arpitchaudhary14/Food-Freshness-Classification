import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, LayoutDashboard, History, LogOut, Menu, X, UploadCloud, BookOpen, User, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast('Successfully logged out', 'success');
    navigate('/auth/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Scan', path: '/scan', icon: UploadCloud },
    { name: 'Prediction History', path: '/history', icon: History },
    { name: 'Food Guide', path: '/guide', icon: BookOpen },
    { name: 'Profile/Settings', path: '/settings', icon: User },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <aside className="hidden md:flex flex-col w-64 bg-navy-900 text-white transition-all duration-300 z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-sage-500 p-2 rounded-xl">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-wide">FreshFind</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-sage-500/20 text-sage-300' 
                    : 'text-gray-400 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-400 hover:bg-navy-800 hover:text-white transition-colors duration-200 text-sm">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-cream-100 z-20">
          <div className="flex items-center space-x-2">
            <div className="bg-sage-500 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-navy-900">FreshFind</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-navy-900"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[65px] left-0 right-0 bg-white border-b border-cream-100 shadow-float z-50 p-4 space-y-1">
             {navItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-sage-50 text-sage-600' 
                      : 'text-gray-600 hover:bg-cream-50 hover:text-navy-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
             <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-cream-50 hover:text-navy-900 transition-colors duration-200 text-sm">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
