import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle, Image as ImageIcon, X, FileText } from 'lucide-react';
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
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const { request, loading } = useApi();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const data = await request('/api/notices', 'GET');
    if (data) setNotices(data.notices);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      if (file.type === 'application/pdf') {
        setImagePreview('pdf');
      } else {
        setImagePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('priority', formData.priority);
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }
    
    console.log('Submitting notice:', { title: formData.title, priority: formData.priority, hasImage: !!imageFile });
    
    let result;
    if (editingNotice) {
      result = await request(`/api/notices/${editingNotice.id}`, 'PUT', formDataToSend, true);
    } else {
      result = await request('/api/notices', 'POST', formDataToSend, true);
    }
    
    console.log('API result:', result);
    
    if (result) {
      alert('Notice saved successfully!');
      setFormData({ title: '', content: '', priority: 'NORMAL' });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      setEditingNotice(null);
      fetchNotices();
    } else {
      alert('Failed to save notice. Check console for details.');
    }
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
    if (notice.imageUrl) {
      if (notice.imageUrl.endsWith('.pdf')) {
        setImagePreview('pdf');
      } else {
        setImagePreview(`http://localhost:5000${notice.imageUrl}`);
      }
    }
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
            setImageFile(null);
            setImagePreview(null);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image or PDF (Optional)</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal"
              />
              {imagePreview && (
                <div className="mt-2 relative inline-block">
                  {imagePreview === 'pdf' ? (
                    <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
                      <FileText className="w-8 h-8 text-red-600" />
                      <span className="text-sm font-medium">{imageFile?.name}</span>
                    </div>
                  ) : (
                    <img src={imagePreview} alt="Preview" className="h-32 rounded-lg" />
                  )}
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
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
                  setImageFile(null);
                  setImagePreview(null);
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
                {notice.imageUrl && (
                  notice.imageUrl.endsWith('.pdf') ? (
                    <div className="mt-3 flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-red-600" />
                      <span className="text-sm font-medium text-red-800">PDF Attachment</span>
                    </div>
                  ) : (
                    <img 
                      src={`http://localhost:5000${notice.imageUrl}`} 
                      alt={notice.title} 
                      className="mt-3 rounded-lg max-h-48 object-cover"
                    />
                  )
                )}
                <p className="text-sm text-gray-400 mt-2">
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
