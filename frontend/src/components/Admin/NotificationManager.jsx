import React, { useState } from 'react';
import { Send, Users, GraduationCap, Shield, Bell } from 'lucide-react';
import api from '../../api';

const NotificationManager = () => {
  const [formData, setFormData] = useState({
    roles: [],
    title: '',
    message: '',
    type: 'info',
    link: ''
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'STUDENT', label: 'Students', icon: GraduationCap, color: 'blue' },
    { value: 'FACULTY', label: 'Faculty', icon: Users, color: 'green' },
    { value: 'ADMIN', label: 'Admins', icon: Shield, color: 'purple' }
  ];

  const types = [
    { value: 'info', label: 'Info', color: 'blue' },
    { value: 'success', label: 'Success', color: 'green' },
    { value: 'warning', label: 'Warning', color: 'yellow' },
    { value: 'error', label: 'Error', color: 'red' }
  ];

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roles.length || !formData.title || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/notifications/send-bulk', formData);
      console.log('Notification sent:', response);
      alert(`Notifications sent successfully to ${formData.roles.join(', ')}!`);
      setFormData({ roles: [], title: '', message: '', type: 'info', link: '' });
    } catch (error) {
      console.error('Send notification error:', error);
      alert(error.message || 'Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-brand-teal" />
        <h2 className="text-2xl font-bold text-brand-dark">Send Notifications</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3">Select Recipients</label>
            <div className="grid grid-cols-3 gap-4">
              {roles.map(role => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => toggleRole(role.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.roles.includes(role.value)
                      ? `border-${role.color}-500 bg-${role.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <role.icon className={`w-6 h-6 mx-auto mb-2 ${
                    formData.roles.includes(role.value) ? `text-${role.color}-600` : 'text-gray-400'
                  }`} />
                  <div className="text-sm font-medium">{role.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Notification Type</label>
            <div className="flex gap-2">
              {types.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.type === type.value
                      ? `bg-${type.color}-500 text-white`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
              placeholder="Enter notification title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
              rows="4"
              placeholder="Enter notification message"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Link (Optional)</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
              placeholder="/dashboard or https://example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationManager;
