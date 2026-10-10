import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await authService.resetPassword(token, password);
      setSuccess('Password reset successful! You can now log in.');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
        <p className="text-gray-600 mb-6">The password reset link is invalid or has expired.</p>
        <Link to="/auth/login" className="btn-primary inline-block">Return to Login</Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Reset Password</h1>
      <p className="text-gray-500 mb-8 text-sm">Please choose a new secure password.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}
      
      {success ? (
        <div className="text-center">
           <div className="bg-sage-50 text-sage-600 p-3 rounded-lg mb-6 text-sm font-medium border border-sage-100">
            {success}
          </div>
          <Link to="/auth/login" className="btn-primary w-full">Go to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Input 
            label="New Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Input 
            label="Confirm New Password" 
            type="password" 
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />

          <button 
            type="submit" 
            className="w-full btn-primary mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
