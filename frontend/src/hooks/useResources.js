import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useResources = () => {
  const [resources, setResources] = useState([]);
  const { request, loading, error } = useApi();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const data = await request('/api/resources', 'GET');
    if (data) setResources(data.resources || []);
  };

  const createResource = async (resourceData) => {
    const data = await request('/api/resources', 'POST', resourceData);
    if (data) {
      await fetchResources();
      return data;
    }
  };

  const deleteResource = async (id) => {
    const data = await request(`/api/resources/${id}`, 'DELETE');
    if (data) {
      await fetchResources();
      return data;
    }
  };

  return {
    resources,
    loading,
    error,
    fetchResources,
    createResource,
    deleteResource
  };
};
