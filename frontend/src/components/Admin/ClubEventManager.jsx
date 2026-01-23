import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, X, Check, XCircle, Edit, Trash2 } from 'lucide-react';
import api from '../../api';

const ClubEventManager = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'events') {
        const res = await api.get('/api/events');
        setEvents(res.data || []);
      } else {
        const res = await api.get('/api/clubs');
        setClubs(res.data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async (clubId) => {
    try {
      const res = await api.get(`/api/clubs/${clubId}/requests`);
      setPendingRequests(res.data || []);
      setSelectedClub(clubId);
    } catch (error) {
      console.error('Error:', error);
      setPendingRequests([]);
      setSelectedClub(clubId);
    }
  };

  const fetchClubMembers = async (clubId) => {
    try {
      const res = await api.get(`/api/clubs/${clubId}`);
      setClubMembers(res.data?.members || []);
      setShowMembersModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load members');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      if (modalType === 'event') {
        const data = {
          title: formData.get('title'),
          description: formData.get('description'),
          eventDate: formData.get('eventDate'),
          startTime: formData.get('startTime'),
          endTime: formData.get('endTime'),
          location: formData.get('location'),
          maxCapacity: formData.get('maxCapacity') || null
        };
        
        if (editingItem) {
          await api.put(`/api/events/${editingItem.id}`, data);
        } else {
          await api.post('/api/events', data);
        }
      } else {
        const data = {
          name: formData.get('name'),
          description: formData.get('description')
        };
        
        if (editingItem) {
          await api.put(`/api/clubs/${editingItem.id}`, data);
        } else {
          await api.post('/api/clubs', data);
        }
      }
      
      setShowModal(false);
      setEditingItem(null);
      fetchData();
    } catch (error) {
      alert(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await api.delete(`/api/${type}s/${id}`);
      alert('Deleted successfully');
      fetchData();
    } catch (error) {
      alert(error.message || 'Delete failed');
    }
  };

  const handleJoinRequest = async (clubId, memberId, action) => {
    try {
      await api.put(`/api/clubs/${clubId}/requests/${memberId}`, { action });
      alert(`Request ${action}d successfully`);
      fetchPendingRequests(clubId);
      fetchData();
    } catch (error) {
      alert(error.message || 'Action failed');
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clubs & Events Management</h2>
        <button
          onClick={() => openModal(activeTab === 'events' ? 'event' : 'club')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Create {activeTab === 'events' ? 'Event' : 'Club'}
        </button>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 font-medium ${activeTab === 'events' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab('clubs')}
          className={`px-4 py-2 font-medium ${activeTab === 'clubs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
        >
          Clubs
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : activeTab === 'events' ? (
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No events found</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.eventDate).toLocaleDateString()}
                      </span>
                      {event.location && <span>{event.location}</span>}
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.currentRegistrations}/{event.maxCapacity || '∞'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('event', event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(event.id, 'event')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-8">No clubs found</p>
          ) : (
            clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-bold mb-2">{club.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{club.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {club.memberCount} members
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchPendingRequests(club.id)}
                    className="flex-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                  >
                    Requests
                  </button>
                  <button
                    onClick={() => fetchClubMembers(club.id)}
                    className="flex-1 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                  >
                    Members
                  </button>
                  <button
                    onClick={() => openModal('club', club)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(club.id, 'club')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingItem ? 'Edit' : 'Create'} {modalType === 'event' ? 'Event' : 'Club'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalType === 'event' ? (
                <>
                  <input
                    name="title"
                    defaultValue={editingItem?.title}
                    placeholder="Event Title"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <textarea
                    name="description"
                    defaultValue={editingItem?.description}
                    placeholder="Description"
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                  />
                  <input
                    name="eventDate"
                    type="date"
                    defaultValue={editingItem?.eventDate?.split('T')[0]}
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="startTime"
                      type="time"
                      defaultValue={editingItem?.startTime}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      name="endTime"
                      type="time"
                      defaultValue={editingItem?.endTime}
                      className="px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <input
                    name="location"
                    defaultValue={editingItem?.location}
                    placeholder="Location"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <input
                    name="maxCapacity"
                    type="number"
                    defaultValue={editingItem?.maxCapacity}
                    placeholder="Max Capacity (optional)"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </>
              ) : (
                <>
                  <input
                    name="name"
                    defaultValue={editingItem?.name}
                    placeholder="Club Name"
                    required
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <textarea
                    name="description"
                    defaultValue={editingItem?.description}
                    placeholder="Description"
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="4"
                  />
                </>
              )}
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pending Requests Modal */}
      {selectedClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Pending Join Requests</h2>
              <button onClick={() => setSelectedClub(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No pending requests</p>
              ) : (
                pendingRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{req.user.name}</p>
                      <p className="text-sm text-gray-500">{req.user.email}</p>
                      {req.user.department && <p className="text-xs text-gray-400">{req.user.department}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJoinRequest(selectedClub, req.id, 'approve')}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleJoinRequest(selectedClub, req.id, 'reject')}
                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Club Members</h2>
              <button onClick={() => setShowMembersModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
              {clubMembers.filter(m => m.role !== 'pending').length === 0 ? (
                <p className="text-center text-gray-500 py-4">No members yet</p>
              ) : (
                clubMembers.filter(m => m.role !== 'pending').map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{member.user.name}</p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                      {member.user.role && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1 inline-block">{member.user.role}</span>}
                    </div>
                    <span className="text-sm text-gray-500">{new Date(member.joinedDate).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubEventManager;
