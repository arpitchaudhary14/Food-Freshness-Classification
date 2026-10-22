import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      const response = await authService.login(email, password); 
      login(response.user, response.access_token);
      addToast('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Welcome Back</h1>
      <p className="text-gray-500 mb-8 text-sm">Welcome back! Please enter your details.</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Input 
          label="Email Address" 
          type="email" 
          placeholder="myemail@address.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        
        <div className="relative">
          <div className="absolute right-0 top-0 text-xs font-semibold text-sage-600 hover:text-sage-700 mt-1 cursor-pointer z-10">
            <Link to="/auth/forgot-password" tabIndex="-1">Forgot password?</Link>
          </div>
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="w-full btn-primary mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 relative flex items-center py-4">
        <div className="flex-grow border-t border-cream-200"></div>
        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider font-semibold">Or</span>
        <div className="flex-grow border-t border-cream-200"></div>
      </div>

      <div className="flex justify-center mt-2">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              setLoading(true);
              if (!credentialResponse?.credential) {
                throw new Error('Google did not return credentials. Please try again.');
              }
              const response = await authService.googleLogin(credentialResponse.credential);
              login(response.user, response.access_token);
              addToast('Logged in with Google successfully');
              navigate('/dashboard');
            } catch (err) {
              setError(err.message || 'Failed to login with Google');
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            setError('Google Sign-In was cancelled or failed to initialize.');
          }}
          theme="filled_blue"
          shape="pill"
        />
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 font-medium">
        You don't have an account? <Link to="/auth/register" className="text-sage-600 hover:text-sage-700 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}
