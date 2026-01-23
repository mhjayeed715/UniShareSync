import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Users } from 'lucide-react';
import { processRoutine } from '../utils/routineParser';
import { parseFacultyRoutine } from '../utils/facultyRoutineParser';
import routineCSV from '../assets/8A - Central Routine.csv?raw';
import courseOfferCSV from '../assets/Proposed Course Offer Winter 2026 - CSE.csv?raw';
import facultyRoutineCSV from '../assets/all_faculty_routines.csv?raw';

const RoomAvailability = () => {
  const [allSchedules, setAllSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Saturday');
  const [selectedTime, setSelectedTime] = useState('');
  const [searchRoom, setSearchRoom] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const timeSlots = [
    '8:30 AM - 9:50 AM',
    '10:00 AM - 11:20 AM',
    '11:30 AM - 12:50 PM',
    '1:00 PM - 2:20 PM',
    '2:30 PM - 3:50 PM',
    '4:00 PM - 5:20 PM'
  ];

  useEffect(() => {
    // Load student routines
    const studentRoutines = processRoutine(routineCSV, courseOfferCSV);
    const studentSchedules = [];
    
    Object.keys(studentRoutines).forEach(semester => {
      Object.keys(studentRoutines[semester]).forEach(group => {
        studentRoutines[semester][group].forEach(schedule => {
          studentSchedules.push({
            ...schedule,
            type: 'Student',
            semester,
            group
          });
        });
      });
    });

    // Load faculty routines
    const facultyRoutines = parseFacultyRoutine(facultyRoutineCSV);
    const facultySchedules = [];
    
    Object.keys(facultyRoutines).forEach(faculty => {
      facultyRoutines[faculty].forEach(schedule => {
        facultySchedules.push({
          ...schedule,
          type: 'Faculty',
          faculty
        });
      });
    });

    setAllSchedules([...studentSchedules, ...facultySchedules]);
  }, []);

  useEffect(() => {
    let filtered = allSchedules.filter(s => s.day === selectedDay);

    if (selectedTime) {
      filtered = filtered.filter(s => 
        s.timeSlot?.includes(selectedTime.split(' - ')[0]) || 
        s.time?.includes(selectedTime.split(' - ')[0])
      );
    }

    if (searchRoom) {
      filtered = filtered.filter(s => 
        s.room?.toLowerCase().includes(searchRoom.toLowerCase())
      );
    }

    // Group by room
    const roomMap = {};
    filtered.forEach(schedule => {
      const room = schedule.room || 'N/A';
      if (!roomMap[room]) roomMap[room] = [];
      roomMap[room].push(schedule);
    });

    setFilteredRooms(roomMap);
  }, [selectedDay, selectedTime, searchRoom, allSchedules]);

  const getAvailableRooms = () => {
    const allRooms = [...new Set(allSchedules.map(s => s.room).filter(Boolean))];
    const occupiedRooms = Object.keys(filteredRooms);
    return allRooms.filter(room => !occupiedRooms.includes(room));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Room Availability Checker</h1>
        <p className="text-gray-600 mt-1">Check room occupancy by day and time</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Times</option>
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Room</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                placeholder="e.g., 1501"
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            Occupied Rooms ({Object.keys(filteredRooms).length})
          </h3>
          {Object.keys(filteredRooms).length === 0 ? (
            <p className="text-gray-400 text-sm">No rooms occupied</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(filteredRooms).map(([room, schedules]) => (
                <div key={room} className="border rounded-lg p-3 bg-red-50">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-gray-900">Room {room}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    {schedules.map((schedule, idx) => (
                      <div key={idx} className="text-gray-700">
                        <span className="font-medium">{schedule.courseCode || schedule.course}</span>
                        {schedule.section && <span> - Section {schedule.section}</span>}
                        {schedule.faculty && <span> ({schedule.faculty})</span>}
                        <div className="text-xs text-gray-600">
                          {schedule.timeSlot || schedule.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Available Rooms ({getAvailableRooms().length})
          </h3>
          {getAvailableRooms().length === 0 ? (
            <p className="text-gray-400 text-sm">All rooms are occupied</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {getAvailableRooms().map(room => (
                <div key={room} className="border rounded-lg p-2 bg-green-50 text-center">
                  <MapPin className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <span className="text-sm font-medium text-gray-900">Room {room}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomAvailability;
