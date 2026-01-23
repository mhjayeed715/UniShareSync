import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Maximize2, FileText } from 'lucide-react';
import api from '../api';

const NoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewNotice, setPreviewNotice] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/api/notices');
      setNotices(res.notices || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'NORMAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Campus Notices</h1>
        <p className="text-brand-gray">Stay updated with the latest announcements</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No notices available</div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-brand-dark">{notice.title}</h3>
                  {notice.priority === 'HIGH' && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <AlertCircle size={14} /> Important
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                  {notice.priority}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3 whitespace-pre-wrap">{notice.content}</p>
              
              {notice.imageUrl && (
                <div className="mt-4 relative group">
                  {notice.imageUrl.endsWith('.pdf') ? (
                    <div 
                      className="bg-red-50 border-2 border-red-200 rounded-lg p-6 flex items-center gap-4 cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={() => setPreviewNotice(notice)}
                    >
                      <FileText className="w-12 h-12 text-red-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-red-800">PDF Document Attached</p>
                        <p className="text-sm text-red-600">Click to view full document</p>
                      </div>
                      <Maximize2 className="w-6 h-6 text-red-600" />
                    </div>
                  ) : (
                    <>
                      <img 
                        src={`http://localhost:5000${notice.imageUrl}`} 
                        alt={notice.title} 
                        className="rounded-lg max-h-64 object-cover cursor-pointer"
                        onClick={() => setPreviewNotice(notice)}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <button
                        onClick={() => setPreviewNotice(notice)}
                        className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Maximize2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              )}
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Posted by {notice.author?.name || 'Admin'}</span>
                <span>{new Date(notice.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Preview Modal */}
      {previewNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setPreviewNotice(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark">{previewNotice.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Posted on {new Date(previewNotice.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button 
                onClick={() => setPreviewNotice(null)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {previewNotice.priority === 'HIGH' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium">This is an important notice</span>
                </div>
              )}
              
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg whitespace-pre-wrap leading-relaxed">
                  {previewNotice.content}
                </p>
              </div>
              
              {previewNotice.imageUrl && (
                <div className="mt-6">
                  {previewNotice.imageUrl.endsWith('.pdf') ? (
                    <iframe
                      src={`http://localhost:5000${previewNotice.imageUrl}`}
                      className="w-full h-[600px] rounded-lg border-2 border-gray-200"
                      title={previewNotice.title}
                    />
                  ) : (
                    <img 
                      src={`http://localhost:5000${previewNotice.imageUrl}`} 
                      alt={previewNotice.title} 
                      className="w-full rounded-lg shadow-lg"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              )}
              
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Posted by:</span> {previewNotice.author?.name || 'Admin'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(previewNotice.priority)}`}>
                    {previewNotice.priority} Priority
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
