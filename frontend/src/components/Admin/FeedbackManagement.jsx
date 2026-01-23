import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Filter, Eye, Reply, Archive, Star, TrendingUp, Users, Clock, X } from 'lucide-react';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/feedback', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      
      const feedbacks = await response.json();
      setFeedbacks(feedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'RESPONDED': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || feedback.category === categoryFilter;
    
    // Handle status filtering
    if (statusFilter === 'all') {
      // Show all except archived when "All Status" is selected
      return matchesSearch && matchesCategory && feedback.status !== 'ARCHIVED';
    } else {
      // Show specific status when selected
      return matchesSearch && matchesCategory && feedback.status === statusFilter;
    }
  }).sort((a, b) => {
    // Sort by status: PENDING first, then others
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
    // Then sort by date (newest first)
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update status');
      }
      
      // Refresh feedbacks
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  const handleResponse = async (feedbackId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}/respond`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: responseText })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send response');
      }
      
      const result = await response.json();
      alert(result.message);
      
      setResponseText('');
      setSelectedFeedback(null);
      
      // Refresh feedbacks
      fetchFeedbacks();
    } catch (error) {
      console.error('Error sending response:', error);
      alert(error.message || 'Failed to send response');
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  const stats = {
    total: feedbacks.length,
    responded: feedbacks.filter(f => f.status === 'RESPONDED').length,
    avgRating: feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length || 0,
    anonymous: feedbacks.filter(f => f.isAnonymous).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feedback Management</h2>
          <p className="text-gray-600">Monitor and respond to student feedback and suggestions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Responded</p>
              <p className="text-2xl font-bold text-green-600">{stats.responded}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Reply className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgRating.toFixed(1)}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Anonymous</p>
              <p className="text-2xl font-bold text-purple-600">{stats.anonymous}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="General">General</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Food Services">Food Services</option>
            <option value="Technology">Technology</option>
            <option value="Academic">Academic</option>
            <option value="Student Services">Student Services</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESPONDED">Responded</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading feedback...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No feedback found</h3>
            <p className="text-gray-500">No feedback matches your current filters</p>
          </div>
        ) : (
          filteredFeedbacks.map(feedback => (
            <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(feedback.priority)}`}>
                      {feedback.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>Category: {feedback.category}</span>
                    <span>•</span>
                    <span>{feedback.isAnonymous ? 'Anonymous' : `By: ${feedback.submittedBy}`}</span>
                    <span>•</span>
                    <span>{new Date(feedback.submittedAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      {getRatingStars(feedback.rating)}
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 line-clamp-3">{feedback.content}</p>
              
              {feedback.response && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Admin Response:</h4>
                  <p className="text-blue-800">{feedback.response}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {feedback.status === 'PENDING' && (
                    <select
                      onChange={(e) => handleStatusUpdate(feedback.id, e.target.value)}
                      className="text-sm border rounded px-3 py-1"
                      defaultValue=""
                    >
                      <option value="" disabled>Update Status</option>
                      <option value="RESPONDED">Mark as Responded</option>
                    </select>
                  )}
                  <button
                    onClick={() => handleStatusUpdate(feedback.id, 'ARCHIVED')}
                    className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg text-sm"
                  >
                    <Archive className="w-4 h-4" />
                    Archive
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedFeedback(feedback)}
                    className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {!selectedFeedback?.response && (
                    <button
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        setResponseText('');
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg text-sm"
                    >
                      <Reply className="w-4 h-4" />
                      Respond
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Details/Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedFeedback.title}</h2>
              <button
                onClick={() => {
                  setSelectedFeedback(null);
                  setResponseText('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Category</h3>
                  <p className="text-gray-600">{selectedFeedback.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Priority</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedFeedback.priority)}`}>
                    {selectedFeedback.priority}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                    {selectedFeedback.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Rating</h3>
                  <div className="flex items-center gap-1">
                    {getRatingStars(selectedFeedback.rating)}
                    <span className="ml-2 text-sm text-gray-600">({selectedFeedback.rating}/5)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Feedback Content</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.content}</p>
              </div>
              
              {selectedFeedback.imageUrl && (
                <div>
                  <h3 className="font-semibold mb-2">Attachment</h3>
                  <img 
                    src={selectedFeedback.imageUrl.startsWith('blob:') ? selectedFeedback.imageUrl : `http://localhost:5000${selectedFeedback.imageUrl}`} 
                    alt="Feedback attachment" 
                    className="w-full max-w-md h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Submitted By</h3>
                  <p className="text-gray-600">{selectedFeedback.isAnonymous ? 'Anonymous User' : selectedFeedback.submittedBy}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Submitted Date</h3>
                  <p className="text-gray-600">{new Date(selectedFeedback.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedFeedback.response && (
                <div>
                  <h3 className="font-semibold mb-2">Current Response</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">{selectedFeedback.response}</p>
                  </div>
                </div>
              )}
              
              {!selectedFeedback.response && (
                <div>
                  <h3 className="font-semibold mb-2">Write Response</h3>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Write your response to this feedback..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  />
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setSelectedFeedback(null);
                        setResponseText('');
                      }}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResponse(selectedFeedback.id)}
                      disabled={!responseText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;