// Authentication Service Layer

export const authService = {
  login: async (email, password) => {
    const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to login');
    }
    return await response.json();
  },
  
  register: async (name, email, password) => {
    const response = await fetch('http://127.0.0.1:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to register');
    }
    return await response.json();
  },

  forgotPassword: async (email) => {
    const response = await fetch('http://127.0.0.1:8000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to request reset');
    }
    return await response.json();
  },

  resetPassword: async (token, new_password) => {
    const response = await fetch('http://127.0.0.1:8000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to reset password');
    }
    return await response.json();
  },

  googleLogin: async (credential) => {
    const response = await fetch('http://127.0.0.1:8000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credential }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Google Login Failed');
    }
    return await response.json();
  },

  deleteAccount: async () => {
    const token = localStorage.getItem('freshfind_token');
    const response = await fetch('http://127.0.0.1:8000/api/auth/me', {
      method: 'DELETE',
      headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete account');
    }
    return await response.json();
  },

  updatePassword: async (current_password, new_password) => {
    const token = localStorage.getItem('freshfind_token');
    const response = await fetch('http://127.0.0.1:8000/api/auth/update-password', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ current_password, new_password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update password');
    }
    return await response.json();
  }
};
