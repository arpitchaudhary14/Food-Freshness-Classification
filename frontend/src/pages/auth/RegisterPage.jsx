import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Email is invalid';
    
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setGeneralError('');
    setLoading(true);
    
    try {
      await authService.register(form.name, form.email, form.password);
      const response = await authService.login(form.email, form.password);
      login(response.user, response.access_token);
      navigate('/dashboard');
    } catch (err) {
      setGeneralError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Create Account</h1>
      <p className="text-gray-500 mb-8 text-sm">Join us to start reducing food waste today.</p>

      {generalError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Full Name" 
          placeholder="Jane Doe" 
          value={form.name} 
          onChange={(e) => setForm({ ...form, name: e.target.value })} 
          error={errors.name}
          disabled={loading}
        />

        <Input 
          label="Email Address" 
          type="email" 
          placeholder="myemail@address.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          disabled={loading}
        />
        
        <Input 
          label="Password" 
          type="password" 
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          disabled={loading}
        />

        <Input 
          label="Confirm Password" 
          type="password" 
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          disabled={loading}
        />

        <button 
          type="submit" 
          className="w-full btn-primary mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Create Account'}
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
              addToast('Signed up with Google successfully');
              navigate('/dashboard');
            } catch (err) {
              setGeneralError(err.message || 'Failed to sign up with Google');
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            setGeneralError('Google Sign-In was cancelled or failed to initialize.');
          }}
          theme="filled_blue"
          shape="pill"
        />
      </div>

      <p className="mt-8 text-center text-sm text-gray-500 font-medium">
        Already have an account? <Link to="/auth/login" className="text-sage-600 hover:text-sage-700 hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
