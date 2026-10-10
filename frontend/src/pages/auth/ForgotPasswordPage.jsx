import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await authService.forgotPassword(email);
      setSuccess(response.message || 'If that email is in our database, we will send a reset link.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Forgot Password</h1>
      <p className="text-gray-500 mb-8 text-sm">No worries! Enter your email and we'll send you a reset link.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-sage-50 text-sage-600 p-3 rounded-lg mb-6 text-sm font-medium border border-sage-100">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="myemail@address.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || !!success}
        />

        <button 
          type="submit" 
          className="w-full btn-primary mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading || !!success}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 font-medium">
        Back to <Link to="/auth/login" className="text-sage-600 hover:text-sage-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
