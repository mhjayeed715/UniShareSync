import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

const NoticeManager = () => {
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'NORMAL'
  });
  const { request, loading } = useApi();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const data = await request('/api/notices', 'GET');
    if (data) setNotices(data.notices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingNotice) {
      await request(`/api/notices/${editingNotice.id}`, 'PUT', formData);
    } else {
      await request('/api/notices', 'POST', formData);
    }
    
    setFormData({ title: '', content: '', priority: 'NORMAL' });
    setShowForm(false);
    setEditingNotice(null);
    fetchNotices();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      await request(`/api/notices/${id}`, 'DELETE');
      fetchNotices();
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      priority: notice.priority
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-brand-blue">Manage Campus Notices</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingNotice(null);
            setFormData({ title: '', content: '', priority: 'NORMAL' });
          }}
          className="flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-teal-600"
        >
          <Plus size={20} />
          Create Notice
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">{editingNotice ? 'Edit Notice' : 'Create New Notice'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-teal-600"
                disabled={loading}
              >
                {editingNotice ? 'Update' : 'Create'} Notice
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingNotice(null);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-brand-blue">{notice.title}</h3>
                  {notice.priority === 'HIGH' && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <AlertCircle size={14} /> Important
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{notice.content}</p>
                <p className="text-sm text-gray-400">
                  Posted on {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(notice)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeManager;
