export const apiService = {
  predict: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('freshfind_token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/predict', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Prediction failed. Ensure the backend is running.');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message === 'Failed to fetch' ? 'Cannot connect to backend server.' : error.message);
    }
  },

  explainPrediction: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('freshfind_token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/explain', {
        method: 'POST',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: formData,
      });
      if (!response.ok) throw new Error('Explanation failed.');
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getInsights: async (verdict, item = "Produce") => {
    const token = localStorage.getItem('freshfind_token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/insights/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify({ verdict, item }),
      });
      if (!response.ok) throw new Error('Insights failed.');
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  },
  
  getHistory: async () => {
    const token = localStorage.getItem('freshfind_token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/history', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch history.');
      }
      return await response.json();
    } catch (error) {
      throw new Error(error.message === 'Failed to fetch' ? 'Cannot connect to backend server.' : error.message);
    }
  },

  deleteHistory: async (id) => {
    const token = localStorage.getItem('freshfind_token');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/history/${id}`, {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (!response.ok) throw new Error('Failed to delete record');
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteAllHistory: async () => {
    const token = localStorage.getItem('freshfind_token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/history', {
        method: 'DELETE',
        headers: { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
      });
      if (!response.ok) throw new Error('Failed to delete all records');
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }
};
