import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Search, Users } from 'lucide-react';
import { processRoutine } from '../utils/routineParser';
import { extractFacultyRoutinesFromCentral, getAllFacultyFromCentral } from '../utils/centralRoutineParser';
import routineCSV from '../assets/8A - Central Routine.csv?raw';
import courseOfferCSV from '../assets/Proposed Course Offer Winter 2026 - CSE.csv?raw';

const RoutineViewer = () => {
  const [viewMode, setViewMode] = useState('student');
  const [routineData, setRoutineData] = useState(null);
  const [facultyRoutines, setFacultyRoutines] = useState({});
  const [facultyList, setFacultyList] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDay, setSelectedDay] = useState('Saturday');
  const [selectedTime, setSelectedTime] = useState('');
  const [searchRoom, setSearchRoom] = useState('');

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const timeSlots = ['8:30 AM - 9:50 AM', '10:00 AM - 11:20 AM', '11:30 AM - 12:50 PM', '1:00 PM - 2:20 PM', '2:30 PM - 3:50 PM', '4:00 PM - 5:20 PM'];
  const validRooms = ['1501', '1503', '1504', '1505', '1506', '2003', '2004', 'UB103', 'UB110', 'UB111', 'UB 103', 'UB 110', 'UB 111', 'Annex'];

  useEffect(() => {
    const data = processRoutine(routineCSV, courseOfferCSV);
    setRoutineData(data);
    const firstSemester = Object.keys(data)[0];
    if (firstSemester) {
      setSelectedSemester(firstSemester);
      setSelectedGroup(Object.keys(data[firstSemester])[0]);
    }

    const facRoutines = extractFacultyRoutinesFromCentral(routineCSV);
    setFacultyRoutines(facRoutines);
    const facList = getAllFacultyFromCentral(routineCSV);
    setFacultyList(facList);
    if (facList.length > 0) setSelectedFaculty(facList[0]);
  }, []);

  const getRoomOccupancy = () => {
    const allSchedules = [];
    
    if (routineData) {
      Object.keys(routineData).forEach(semester => {
        Object.keys(routineData[semester]).forEach(group => {
          routineData[semester][group].forEach(schedule => {
            const room = schedule.room?.trim();
            if (room && room !== 'Online' && room !== 'N/A') {
              allSchedules.push({ ...schedule, room, type: 'Student', semester, group });
            }
          });
        });
      });
    }

    Object.keys(facultyRoutines).forEach(faculty => {
      facultyRoutines[faculty].forEach(schedule => {
        const room = schedule.room?.trim();
        if (room && room !== 'Online' && room !== 'N/A') {
          allSchedules.push({ ...schedule, room, type: 'Faculty', faculty, timeSlot: schedule.time, courseCode: schedule.course });
        }
      });
    });

    let filtered = allSchedules.filter(s => s.day === selectedDay);
    
    if (selectedTime) {
      const searchTime = selectedTime.replace(/[.:]/g, '.').split(' ')[0];
      filtered = filtered.filter(s => {
        const schedTime = (s.timeSlot || '').replace(/[.:]/g, '.').split(' ')[0];
        return schedTime === searchTime;
      });
    }
    
    if (searchRoom) {
      filtered = filtered.filter(s => s.room && s.room.toLowerCase().includes(searchRoom.toLowerCase()));
    }

    const roomMap = {};
    filtered.forEach(schedule => {
      const room = schedule.room;
      if (!roomMap[room]) roomMap[room] = [];
      roomMap[room].push(schedule);
    });

    return roomMap;
  };

  const renderStudentView = () => {
    if (!routineData) return null;
    const schedules = routineData[selectedSemester]?.[selectedGroup] || [];
    const schedulesByDay = days.reduce((acc, day) => {
      acc[day] = schedules.filter(s => s.day === day);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <select value={selectedSemester || ''} onChange={(e) => { setSelectedSemester(e.target.value); setSelectedGroup(Object.keys(routineData[e.target.value])[0]); }} className="px-4 py-2 border rounded-lg">
            {Object.keys(routineData).map(sem => <option key={sem} value={sem}>{sem}</option>)}
          </select>
          <select value={selectedGroup || ''} onChange={(e) => setSelectedGroup(e.target.value)} className="px-4 py-2 border rounded-lg">
            {selectedSemester && Object.keys(routineData[selectedSemester]).map(group => <option key={group} value={group}>Group {group}</option>)}
          </select>
        </div>
        {days.map(day => (
          <div key={day} className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-lg text-blue-600 mb-3">{day}</h3>
            {schedulesByDay[day].length === 0 ? <p className="text-sm text-gray-400">No classes</p> : (
              <div className="space-y-2">
                {schedulesByDay[day].map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{item.courseCode}</span>
                      <span className="text-sm text-gray-600">- {item.courseName}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span><Clock className="w-4 h-4 inline" /> {item.timeSlot}</span>
                      <span><User className="w-4 h-4 inline" /> {item.faculty}</span>
                      <span><MapPin className="w-4 h-4 inline" /> {item.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderFacultyView = () => {
    const routine = facultyRoutines[selectedFaculty] || [];
    const routineByDay = days.reduce((acc, day) => {
      acc[day] = routine.filter(r => r.day === day);
      return acc;
    }, {});

    return (
      <div className="space-y-4">
        <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)} className="px-4 py-2 border rounded-lg">
          {facultyList.map(fac => <option key={fac} value={fac}>{fac}</option>)}
        </select>
        {days.map(day => (
          <div key={day} className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold text-lg text-blue-600 mb-3">{day}</h3>
            {routineByDay[day].length === 0 ? <p className="text-sm text-gray-400">No classes</p> : (
              <div className="space-y-2">
                {routineByDay[day].map((item, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{item.course}</span>
                      <span className="text-sm text-gray-600">Section: {item.section}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span><Clock className="w-4 h-4 inline" /> {item.time}</span>
                      <span><MapPin className="w-4 h-4 inline" /> Room {item.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderRoomView = () => {
    const occupiedRooms = getRoomOccupancy();
    const allRoomsList = [...new Set(Object.keys(occupiedRooms).concat(validRooms))].sort();
    const availableRooms = validRooms.filter(room => !occupiedRooms[room] && !occupiedRooms[room.replace(' ', '')]);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="px-3 py-2 border rounded-lg">
            {days.map(day => <option key={day} value={day}>{day}</option>)}
          </select>
          <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">All Times</option>
            {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" value={searchRoom} onChange={(e) => setSearchRoom(e.target.value)} placeholder="Search room" className="w-full pl-10 pr-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-red-600" />Occupied ({Object.keys(occupiedRooms).length})</h3>
            {Object.keys(occupiedRooms).length === 0 ? <p className="text-sm text-gray-400">No rooms occupied</p> : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(occupiedRooms).map(([room, schedules]) => (
                  <div key={room} className="border rounded-lg p-2 bg-red-50">
                    <div className="font-semibold text-sm mb-1">Room {room}</div>
                    {schedules.map((s, i) => (
                      <div key={i} className="text-xs text-gray-700">
                        {s.courseCode || s.course} - Sec {s.section} ({s.faculty}) @ {s.timeSlot.split(' - ')[0]}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="w-5 h-5 text-green-600" />Available ({availableRooms.length})</h3>
            <div className="grid grid-cols-2 gap-2">
              {availableRooms.map(room => (
                <div key={room} className="border rounded-lg p-2 bg-green-50 text-center text-sm">Room {room}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Routine Viewer</h1>
        <p className="text-gray-600 mt-1">View schedules by student, faculty, or room availability</p>
      </div>

      <div className="flex gap-2 bg-white rounded-lg p-1 border w-fit">
        <button onClick={() => setViewMode('student')} className={`px-4 py-2 rounded-lg ${viewMode === 'student' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Student</button>
        <button onClick={() => setViewMode('faculty')} className={`px-4 py-2 rounded-lg ${viewMode === 'faculty' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Faculty</button>
        <button onClick={() => setViewMode('room')} className={`px-4 py-2 rounded-lg ${viewMode === 'room' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>Room Availability</button>
      </div>

      {viewMode === 'student' && renderStudentView()}
      {viewMode === 'faculty' && renderFacultyView()}
      {viewMode === 'room' && renderRoomView()}
    </div>
  );
};

export default RoutineViewer;
