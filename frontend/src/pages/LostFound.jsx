import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Calendar, Eye, Filter, X, Clock, CheckCircle, AlertTriangle, Camera } from 'lucide-react';

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'LOST',
    category: 'Personal Items',
    location: '',
    contactInfo: '',
    image: null
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/lost-found', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const items = await response.json();
      setItems(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    return type === 'LOST' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'MATCHED': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ACTIVE': return <Clock className="w-4 h-4" />;
      case 'MATCHED': return <AlertTriangle className="w-4 h-4" />;
      case 'RESOLVED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesTab = activeTab === 'browse' || 
                      (activeTab === 'my-reports' && item.reportedBy === user.name);
    return matchesSearch && matchesCategory && matchesTab;
  });

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('contactInfo', formData.contactInfo);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      const response = await fetch('http://localhost:5000/api/lost-found', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit report');
      }
      
      const result = await response.json();
      alert(result.message);
      
      setShowReportModal(false);
      setFormData({
        title: '',
        description: '',
        type: 'LOST',
        category: 'Personal Items',
        location: '',
        contactInfo: '',
        image: null
      });
      
      // Refresh items
      fetchItems();
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(error.message || 'Failed to submit report');
    }
  };

  const handleFoundResponse = async (itemId) => {
    try {
      const response = prompt('Please provide your contact information and details about finding this item:');
      if (!response) return;
      
      const token = localStorage.getItem('token');
      const apiResponse = await fetch(`http://localhost:5000/api/lost-found/${itemId}/found-response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: response })
      });
      
      if (!apiResponse.ok) {
        const error = await apiResponse.json();
        throw new Error(error.message || 'Failed to submit response');
      }
      
      alert('Your response has been sent to the item owner!');
    } catch (error) {
      console.error('Error submitting found response:', error);
      alert(error.message || 'Failed to submit response');
    }
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/lost-found/${itemId}/status`, {
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
      
      alert('Status updated successfully!');
      fetchItems();
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/lost-found/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete item');
      }
      
      alert('Item deleted successfully!');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(error.message || 'Failed to delete item');
    }
  };

  const myReportsCount = items.filter(item => item.reportedBy === user.name).length;

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-brand-blue">Lost & Found Portal</h2>
            <p className="text-brand-gray mt-1">Report lost items or help others find their belongings</p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Report Item
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lost Items</p>
                <p className="text-2xl font-bold text-red-600">{items.filter(i => i.type === 'LOST').length}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Found Items</p>
                <p className="text-2xl font-bold text-green-600">{items.filter(i => i.type === 'FOUND').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-blue-600">{items.filter(i => i.status === 'RESOLVED').length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 font-medium ${activeTab === 'browse' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500'}`}
            >
              Browse All Items ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('my-reports')}
              className={`px-6 py-3 font-medium ${activeTab === 'my-reports' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500'}`}
            >
              My Reports ({myReportsCount})
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items, location, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
              >
                <option value="all">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Personal Items">Personal Items</option>
                <option value="Books">Books</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Items Grid */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
                <p className="text-gray-500">
                  {activeTab === 'browse' ? 'No items match your search criteria' : 'You haven\'t reported any items yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                    
                    {item.imageUrl && (
                      <div className="mb-4">
                        <img 
                          src={item.imageUrl.startsWith('blob:') ? item.imageUrl : `http://localhost:5000${item.imageUrl}`} 
                          alt={item.title} 
                          className="w-full h-48 object-contain rounded-lg border bg-gray-50"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.reportedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mb-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">{item.category}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center gap-1 text-brand-blue hover:bg-brand-blue/10 px-3 py-1 rounded-lg text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <div className="flex gap-2">
                        {item.status === 'ACTIVE' && (
                          <>
                            <button className="bg-brand-blue text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
                              Contact
                            </button>
                            {item.type === 'LOST' && (
                              <button 
                                onClick={() => handleFoundResponse(item.id)}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                              >
                                I Found This
                              </button>
                            )}
                          </>
                        )}
                        {(item.reportedBy === user.name || user.role === 'ADMIN') && (
                          <>
                            {item.status !== 'RESOLVED' && (
                              <select
                                onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                                className="text-xs border rounded px-2 py-1"
                                defaultValue=""
                              >
                                <option value="" disabled>Update Status</option>
                                <option value="MATCHED">Mark as Matched</option>
                                <option value="RESOLVED">Mark as Resolved</option>
                              </select>
                            )}
                            {activeTab === 'my-reports' && (
                              <button 
                                onClick={() => handleDeleteItem(item.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedItem.title}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(selectedItem.type)}`}>
                  {selectedItem.type}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                  {getStatusIcon(selectedItem.status)}
                  {selectedItem.status}
                </span>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedItem.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Category</h3>
                  <p className="text-gray-600">{selectedItem.category}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {selectedItem.location}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <p className="text-gray-600">{selectedItem.contactInfo}</p>
              </div>
              
              {selectedItem.imageUrl && (
                <div>
                  <h3 className="font-semibold mb-2">Image</h3>
                  <img 
                    src={selectedItem.imageUrl.startsWith('blob:') ? selectedItem.imageUrl : `http://localhost:5000${selectedItem.imageUrl}`} 
                    alt={selectedItem.title} 
                    className="w-full max-w-md h-64 object-cover rounded-lg border"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Reported By</h3>
                  <p className="text-gray-600">{selectedItem.reportedBy}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Reported Date</h3>
                  <p className="text-gray-600">{new Date(selectedItem.reportedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Item Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Report Lost/Found Item</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  required
                >
                  <option value="LOST">Lost Item</option>
                  <option value="FOUND">Found Item</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  placeholder="e.g., Black Laptop Bag"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue h-24"
                  placeholder="Detailed description of the item..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  required
                >
                  <option value="Personal Items">Personal Items</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  placeholder="Where was it lost/found?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  placeholder="Email or phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
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
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;
