import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Star, Eye, Filter, X, Clock, CheckCircle, AlertCircle, Lock, Camera, Image, Edit, Trash2 } from 'lucide-react';

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submit');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'MEDIUM',
    isAnonymous: false,
    rating: 5,
    image: null
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all feedback for community view
      const response = await fetch('http://localhost:5000/api/feedback', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      
      const allFeedbacks = await response.json();
      setFeedbacks(allFeedbacks);
      
      // Fetch user's feedback
      const myResponse = await fetch('http://localhost:5000/api/feedback/my-feedback', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (myResponse.ok) {
        const userFeedbacks = await myResponse.json();
        setMyFeedbacks(userFeedbacks);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
      setMyFeedbacks([]);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'RESPONDED': return <MessageSquare className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getRatingStars = (rating, interactive = false, onChange = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} ${
          interactive ? 'cursor-pointer hover:text-yellow-400' : ''
        }`}
        onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
      />
    ));
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      formDataToSend.append('isAnonymous', formData.isAnonymous);
      formDataToSend.append('rating', formData.rating);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit feedback');
      }
      
      const result = await response.json();
      alert(result.message);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: 'General',
        priority: 'MEDIUM',
        isAnonymous: false,
        rating: 5,
        image: null
      });
      
      // Refresh feedbacks
      fetchFeedbacks();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(error.message || 'Failed to submit feedback');
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
      
      alert('Feedback deleted successfully!');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  const handleArchiveFeedback = async (feedbackId) => {
    if (!confirm('Are you sure you want to archive this feedback?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to archive feedback');
      }
      
      alert('Feedback archived successfully!');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error archiving feedback:', error);
      alert('Failed to archive feedback');
    }
  };

  const handleResolveFeedback = async (feedbackId) => {
    if (!confirm('Are you sure this issue has been resolved?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/feedback/${feedbackId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to resolve feedback');
      }
      
      alert('Feedback marked as resolved!');
      fetchFeedbacks();
    } catch (error) {
      console.error('Error resolving feedback:', error);
      alert('Failed to resolve feedback');
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-brand-blue">Feedback & Suggestions</h2>
            <p className="text-brand-gray mt-1">Share your thoughts and help us improve the university experience</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Feedback</p>
                <p className="text-2xl font-bold text-blue-600">{myFeedbacks.length}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{feedbacks.filter(f => f.status === 'RESPONDED').length}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-3 font-medium ${activeTab === 'submit' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500'}`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab('my-feedback')}
              className={`px-6 py-3 font-medium ${activeTab === 'my-feedback' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500'}`}
            >
              My Feedback ({myFeedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 font-medium ${activeTab === 'browse' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500'}`}
            >
              Community Feedback
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'submit' && (
              <form onSubmit={handleSubmitFeedback} className="max-w-2xl space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                    placeholder="Brief title for your feedback"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="General">General</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Food Services">Food Services</option>
                    <option value="Technology">Technology</option>
                    <option value="Academic">Academic</option>
                    <option value="Student Services">Student Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {getRatingStars(formData.rating, true, (rating) => setFormData({...formData, rating}))}
                    <span className="text-sm text-gray-600 ml-2">({formData.rating}/5)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue h-32"
                    placeholder="Please provide detailed feedback..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (Optional)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                    />
                    <Camera className="w-5 h-5 text-gray-400" />
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(formData.image)} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})}
                    className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <label htmlFor="anonymous" className="text-sm text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Submit anonymously
                  </label>
                </div>
                
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </button>
              </form>
            )}

            {(activeTab === 'my-feedback' || activeTab === 'browse') && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading feedback...</p>
                  </div>
                ) : (
                  (activeTab === 'my-feedback' ? myFeedbacks : feedbacks).length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No feedback found</h3>
                      <p className="text-gray-500">
                        {activeTab === 'my-feedback' ? 'You haven\'t submitted any feedback yet' : 'No community feedback available'}
                      </p>
                    </div>
                  ) : (
                    (activeTab === 'my-feedback' ? myFeedbacks.filter(f => f.status !== 'ARCHIVED') : feedbacks).map(feedback => (
                      <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(feedback.priority)}`}>
                                {feedback.priority}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feedback.status)}`}>
                                {getStatusIcon(feedback.status)}
                                {feedback.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                              <span>Category: {feedback.category}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {feedback.isAnonymous ? <Lock className="w-3 h-3" /> : null}
                                {feedback.submittedBy}
                              </span>
                              <span>•</span>
                              <span>{new Date(feedback.submittedAt).toLocaleDateString()}</span>
                              <div className="flex items-center gap-1">
                                {getRatingStars(feedback.rating)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4 line-clamp-3">{feedback.content}</p>
                        
                        {feedback.imageUrl && (
                          <div className="mb-4">
                            <img 
                              src={feedback.imageUrl.startsWith('blob:') ? feedback.imageUrl : `http://localhost:5000${feedback.imageUrl}`} 
                              alt="Feedback attachment" 
                              className="w-full max-w-sm h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        
                        {feedback.response && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Admin Response:
                            </h4>
                            <p className="text-blue-800">{feedback.response}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setShowViewModal(true);
                            }}
                            className="flex items-center gap-1 text-brand-blue hover:bg-brand-blue/10 px-3 py-1 rounded-lg text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          {activeTab === 'my-feedback' && (
                            <div className="flex gap-2">
                              {feedback.response && feedback.status === 'RESPONDED' && (
                                <button
                                  onClick={() => handleResolveFeedback(feedback.id)}
                                  className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg text-sm"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark Resolved
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteFeedback(feedback.id)}
                                className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Details Modal */}
      {showViewModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedFeedback.title}</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedFeedback(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-3 flex-wrap">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(selectedFeedback.priority)}`}>
                  {selectedFeedback.priority} Priority
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                  {getStatusIcon(selectedFeedback.status)}
                  {selectedFeedback.status}
                </span>
                <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
                  {selectedFeedback.category}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Rating</h3>
                <div className="flex items-center gap-2">
                  {getRatingStars(selectedFeedback.rating)}
                  <span className="text-sm text-gray-600">({selectedFeedback.rating}/5)</span>
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
                  <p className="text-gray-600 flex items-center gap-2">
                    {selectedFeedback.isAnonymous && <Lock className="w-4 h-4" />}
                    {selectedFeedback.submittedBy}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Submitted Date</h3>
                  <p className="text-gray-600">{new Date(selectedFeedback.submittedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedFeedback.response && (
                <div>
                  <h3 className="font-semibold mb-2">Admin Response</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800">{selectedFeedback.response}</p>
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

export default Feedback;
