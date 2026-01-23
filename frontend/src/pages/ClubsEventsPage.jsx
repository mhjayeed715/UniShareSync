import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Plus, X, Check, XCircle } from 'lucide-react';
import api from '../api';

const ClubsEventsPage = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'event' or 'club'
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubMembers, setClubMembers] = useState([]);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdminOrFaculty = user.role === 'ADMIN' || user.role === 'FACULTY';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'events') {
        const res = await api.getEvents('?status=upcoming');
        setEvents(res.data || []);
      } else {
        const res = await api.getClubs();
        setClubs(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async (clubId) => {
    try {
      const res = await api.getClubRequests(clubId);
      setPendingRequests(res.data || []);
      setSelectedClub(clubId);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setPendingRequests([]);
      setSelectedClub(clubId);
    }
  };

  const fetchClubMembers = async (clubId) => {
    try {
      const res = await api.getClub(clubId);
      setClubMembers(res.data?.members || []);
      setShowMembersModal(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load members');
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.registerForEvent(eventId);
      alert('Registered successfully!');
      fetchData();
    } catch (error) {
      alert(error.message || 'Registration failed');
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      await api.joinClub(clubId);
      alert('Join request submitted!');
    } catch (error) {
      alert(error.message || 'Request failed');
    }
  };

  const handleJoinRequest = async (clubId, memberId, action) => {
    try {
      await api.handleClubRequest(clubId, memberId, action);
      alert(`Request ${action}d successfully!`);
      fetchPendingRequests(clubId);
      fetchData();
    } catch (error) {
      alert(error.message || 'Action failed');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.createEvent({
        title: formData.get('title'),
        description: formData.get('description'),
        clubId: formData.get('clubId') || null,
        eventDate: formData.get('eventDate'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        location: formData.get('location'),
        maxCapacity: formData.get('maxCapacity') || null
      });
      alert('Event created successfully!');
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to create event');
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.createClub({
        name: formData.get('name'),
        description: formData.get('description')
      });
      alert('Club created successfully!');
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to create club');
    }
  };

  const openCreateModal = (type) => {
    setModalType(type);
    setShowCreateModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Clubs & Events Hub</h1>
          <p className="text-brand-gray">Discover and join campus activities</p>
        </div>
        {isAdminOrFaculty && (
          <button
            onClick={() => openCreateModal(activeTab === 'events' ? 'event' : 'club')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600"
          >
            <Plus className="w-4 h-4" />
            Create {activeTab === 'events' ? 'Event' : 'Club'}
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'events' ? 'text-brand-teal border-b-2 border-brand-teal' : 'text-gray-500'}`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveTab('clubs')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'clubs' ? 'text-brand-teal border-b-2 border-brand-teal' : 'text-gray-500'}`}
        >
          Clubs
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : activeTab === 'events' ? (
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No upcoming events</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-dark mb-2">{event.title}</h3>
                    {event.club && <p className="text-sm text-brand-gray mb-3">{event.club.name}</p>}
                    <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.eventDate).toLocaleDateString()}</span>
                      {event.startTime && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.startTime}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>}
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {event.currentRegistrations}/{event.maxCapacity || '∞'}</span>
                    </div>
                  </div>
                  {user.role === 'STUDENT' && (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 font-medium"
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-8">No clubs available</p>
          ) : (
            clubs.map((club) => (
              <div key={club.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-brand-dark mb-3">{club.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{club.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Users className="w-4 h-4" /> {club.memberCount} members
                  </span>
                  {user.role === 'STUDENT' ? (
                    <button
                      onClick={() => handleJoinClub(club.id)}
                      className="text-sm text-brand-teal font-medium hover:underline"
                    >
                      Join Club
                    </button>
                  ) : isAdminOrFaculty ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchPendingRequests(club.id)}
                        className="text-sm px-3 py-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"
                      >
                        Requests
                      </button>
                      <button
                        onClick={() => fetchClubMembers(club.id)}
                        className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                      >
                        Members
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Create {modalType === 'event' ? 'Event' : 'Club'}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={modalType === 'event' ? handleCreateEvent : handleCreateClub} className="p-6 space-y-4">
              {modalType === 'event' ? (
                <>
                  <input name="title" placeholder="Event Title" required className="w-full px-4 py-2 border rounded-lg" />
                  <textarea name="description" placeholder="Description" className="w-full px-4 py-2 border rounded-lg" rows="3" />
                  <input name="eventDate" type="date" required className="w-full px-4 py-2 border rounded-lg" />
                  <div className="grid grid-cols-2 gap-4">
                    <input name="startTime" type="time" placeholder="Start Time" className="px-4 py-2 border rounded-lg" />
                    <input name="endTime" type="time" placeholder="End Time" className="px-4 py-2 border rounded-lg" />
                  </div>
                  <input name="location" placeholder="Location" className="w-full px-4 py-2 border rounded-lg" />
                  <input name="maxCapacity" type="number" placeholder="Max Capacity (optional)" className="w-full px-4 py-2 border rounded-lg" />
                </>
              ) : (
                <>
                  <input name="name" placeholder="Club Name" required className="w-full px-4 py-2 border rounded-lg" />
                  <textarea name="description" placeholder="Description" className="w-full px-4 py-2 border rounded-lg" rows="4" />
                </>
              )}
              <button type="submit" className="w-full px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600">
                Create
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pending Requests Modal */}
      {selectedClub && pendingRequests.length >= 0 && (
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

export default ClubsEventsPage;
