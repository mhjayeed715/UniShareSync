import { useState, useEffect } from 'react';
import { useApi } from './useApi';

export const useSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const { request, loading, error } = useApi();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const data = await request('/api/schedules', 'GET');
    if (data) setSchedules(data.schedules || []);
  };

  const createSchedule = async (scheduleData) => {
    const data = await request('/api/schedules', 'POST', scheduleData);
    if (data) {
      await fetchSchedules();
      return data;
    }
  };

  const updateSchedule = async (id, scheduleData) => {
    const data = await request(`/api/schedules/${id}`, 'PUT', scheduleData);
    if (data) {
      await fetchSchedules();
      return data;
    }
  };

  const deleteSchedule = async (id) => {
    const data = await request(`/api/schedules/${id}`, 'DELETE');
    if (data) {
      await fetchSchedules();
      return data;
    }
  };

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule
  };
};
