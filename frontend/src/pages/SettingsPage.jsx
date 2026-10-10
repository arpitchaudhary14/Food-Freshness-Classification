import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });

  const [profilePhoto, setProfilePhoto] = useState(null);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    addToast('Profile updated successfully!', 'success');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(URL.createObjectURL(file));
      addToast('Photo uploaded successfully!', 'success');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    
    try {
      const { authService } = await import('../services/authService');
      await authService.updatePassword(passwordForm.current, passwordForm.new);
      addToast('Password updated successfully!', 'success');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      addToast(err.message || 'Failed to update password.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-navy-900 dark:text-white">Profile & Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="card dark:bg-navy-800 dark:border-navy-700">
        <h2 className="font-semibold text-xl text-navy-900 dark:text-white mb-6">Personal Information</h2>
        <div className="flex items-start gap-6 mb-6">
          <div className="w-20 h-20 bg-cream-200 dark:bg-navy-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-white dark:border-navy-900 shadow-soft">
             {profilePhoto ? (
               <img src={profilePhoto} className="w-full h-full object-cover" alt="Profile" />
             ) : (
               <span className="text-2xl text-sage-600 dark:text-sage-400 font-semibold">{user?.name?.charAt(0) || 'U'}</span>
             )}
          </div>
          <div>
            <label className="bg-white dark:bg-navy-900 border border-sage-200 dark:border-sage-700 text-sage-700 dark:text-sage-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-sage-50 dark:hover:bg-navy-800 cursor-pointer transition-colors">
               Upload Photo
               <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
            <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
          </div>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
          <Input 
            label="Full Name" 
            value={profileForm.name} 
            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
          />
          <Input 
            label="Email Address" 
            type="email" 
            value={profileForm.email} 
            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} 
          />
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-xl text-navy-900 mb-6">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <Input 
            label="Current Password" 
            type="password" 
            value={passwordForm.current} 
            onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})} 
          />
          <Input 
            label="New Password" 
            type="password" 
            value={passwordForm.new} 
            onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})} 
          />
          <Input 
            label="Confirm New Password" 
            type="password" 
            value={passwordForm.confirm} 
            onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})} 
          />
          <button type="submit" className="btn-secondary">Update Password</button>
        </form>
      </div>
      
      <div className="card">
         <h2 className="font-semibold text-xl text-navy-900 mb-6">Preferences</h2>
         <div className="flex items-center justify-between py-2 border-b border-cream-100">
            <div>
              <p className="font-medium text-navy-900">Dark Mode</p>
              <p className="text-sm text-gray-500">Enable dark theme across the application.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" onChange={() => document.documentElement.classList.toggle('dark')} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-500"></div>
            </label>
         </div>
      </div>

      <div className="card border-red-200">
         <h2 className="font-semibold text-xl text-red-600 mb-6">Danger Zone</h2>
         <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-navy-900">Delete Account</p>
              <p className="text-sm text-gray-500">Permanently remove your account and all scan history.</p>
            </div>
            <button 
              onClick={async () => {
                let input = window.prompt('Type DELETE to confirm account deletion:');
                if(input === 'DELETE') {
                   try {
                     const { authService } = await import('../services/authService');
                     await authService.deleteAccount();
                     logout();
                     addToast('Account deleted successfully.', 'success');
                   } catch(err) {
                     addToast('Failed to delete account.', 'error');
                   }
                }
              }} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Delete Account
            </button>
         </div>
      </div>
    </div>
  );
}
