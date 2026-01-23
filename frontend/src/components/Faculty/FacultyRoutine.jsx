import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { parseFacultyRoutine } from '../../utils/facultyRoutineParser';
import facultyRoutineCSV from '../../assets/all_faculty_routines.csv?raw';

const FacultyRoutine = ({ facultyInitial }) => {
  const [routine, setRoutine] = useState([]);
  const [selectedDay, setSelectedDay] = useState('All');

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  useEffect(() => {
    const allRoutines = parseFacultyRoutine(facultyRoutineCSV);
    const facultySchedule = allRoutines[facultyInitial] || [];
    setRoutine(facultySchedule);
  }, [facultyInitial]);

  const filteredRoutine = selectedDay === 'All' 
    ? routine 
    : routine.filter(r => r.day === selectedDay);

  const routineByDay = days.reduce((acc, day) => {
    acc[day] = routine.filter(r => r.day === day);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Routine</h1>
          <p className="text-gray-600 mt-1">Faculty: {facultyInitial}</p>
        </div>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Days</option>
          {days.map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
      </div>

      {selectedDay === 'All' ? (
        <div className="space-y-4">
          {days.map(day => (
            <div key={day} className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-lg text-blue-600 mb-3">{day}</h3>
              {routineByDay[day].length === 0 ? (
                <p className="text-sm text-gray-400">No classes</p>
              ) : (
                <div className="space-y-2">
                  {routineByDay[day].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{item.course}</span>
                          <span className="text-sm text-gray-600">Section: {item.section}</span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {item.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Room {item.room}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-lg text-blue-600 mb-4">{selectedDay}</h3>
          {filteredRoutine.length === 0 ? (
            <p className="text-gray-400">No classes on this day</p>
          ) : (
            <div className="space-y-3">
              {filteredRoutine.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg text-gray-900">{item.course}</span>
                      <span className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Section {item.section}
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Room {item.room}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FacultyRoutine;
