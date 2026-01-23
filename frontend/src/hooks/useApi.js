import { useState } from 'react';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = async (endpoint, method = 'GET', body = null, isFormData = false) => {
    setLoading(true);
    setError(null);

    const headers = {};

    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
    }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { request, loading, error };
};
