import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Search, Filter, Plus } from 'lucide-react';

const ClubsEventsPage = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data - replace with actual API calls
      setEvents([
        { id: 1, title: 'Tech Talk: AI in Education', club: 'Computer Club', date: '2026-02-15', time: '2:00 PM', location: 'Auditorium', attendees: 45, maxCapacity: 100 },
        { id: 2, title: 'Cultural Night 2026', club: 'Cultural Club', date: '2026-02-20', time: '6:00 PM', location: 'Main Hall', attendees: 120, maxCapacity: 200 },
        { id: 3, title: 'Hackathon 2026', club: 'Programming Club', date: '2026-03-01', time: '9:00 AM', location: 'Lab 301', attendees: 30, maxCapacity: 50 }
      ]);
      setClubs([
        { id: 1, name: 'Computer Club', members: 156, description: 'Exploring technology and innovation', category: 'Technical' },
        { id: 2, name: 'Cultural Club', members: 203, description: 'Celebrating diversity through arts', category: 'Cultural' },
        { id: 3, name: 'Programming Club', members: 89, description: 'Competitive programming and development', category: 'Technical' }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (eventId) => {
    alert(`Registration for event ${eventId} - Feature coming soon!`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Clubs & Events Hub</h1>
          <p className="text-brand-gray">Discover and join campus activities</p>
        </div>
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

      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-brand-dark mb-2">{event.title}</h3>
                  <p className="text-sm text-brand-gray mb-3">{event.club}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {event.attendees}/{event.maxCapacity}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRegister(event.id)}
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 font-medium"
                >
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'clubs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div key={club.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-brand-dark">{club.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{club.category}</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{club.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Users className="w-4 h-4" /> {club.members} members
                </span>
                <button className="text-sm text-brand-teal font-medium hover:underline">Join Club</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubsEventsPage;
