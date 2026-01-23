import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Plus, AlertTriangle, Trash2, Edit2, Save, X } from 'lucide-react';
import { processRoutine } from '../../utils/routineParser';
import routineCSV from '../../assets/8A - Central Routine.csv?raw';
import courseOfferCSV from '../../assets/Proposed Course Offer Winter 2026 - CSE.csv?raw';

const RoutineScheduler = () => {
  const [routineData, setRoutineData] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    courseCode: '',
    courseName: '',
    faculty: '',
    room: '',
    timeSlot: '',
    day: 'Saturday'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    const data = processRoutine(routineCSV, courseOfferCSV);
    setRoutineData(data);
    const firstSemester = Object.keys(data)[0];
    if (firstSemester) {
      setSelectedSemester(firstSemester);
      setSelectedGroup(Object.keys(data[firstSemester])[0]);
    }
  }, []);

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

  const timeToMinutes = (timeSlot) => {
    const match = timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/);
    if (!match) return 0;
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const checkConflicts = (newSched, currentSchedules, skipIndex = null) => {
    const foundConflicts = [];
    const newStart = timeToMinutes(newSched.timeSlot);
    const newEnd = newStart + 80;

    currentSchedules.forEach((sched, index) => {
      if (sched.day === newSched.day && index !== skipIndex) {
        const schedStart = timeToMinutes(sched.timeSlot);
        const schedEnd = schedStart + 80;

        if ((newStart >= schedStart && newStart < schedEnd) ||
            (newEnd > schedStart && newEnd <= schedEnd) ||
            (newStart <= schedStart && newEnd >= schedEnd)) {
          foundConflicts.push(sched);
        }
      }
    });

    return foundConflicts;
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!selectedSemester || !selectedGroup) return;

    const currentSchedules = routineData[selectedSemester][selectedGroup];
    const foundConflicts = checkConflicts(newSchedule, currentSchedules);
    
    if (foundConflicts.length > 0) {
      setConflicts(foundConflicts);
      const proceed = window.confirm(
        `⚠️ CONFLICT DETECTED!\n\nThis schedule conflicts with ${foundConflicts.length} existing class(es):\n${foundConflicts.map(c => `${c.courseCode} - ${c.timeSlot}`).join('\n')}\n\nDo you want to add it anyway?`
      );
      if (!proceed) return;
    }

    const updatedData = { ...routineData };
    updatedData[selectedSemester][selectedGroup] = [...currentSchedules, newSchedule];
    setRoutineData(updatedData);
    setNewSchedule({ courseCode: '', courseName: '', faculty: '', room: '', timeSlot: '', day: 'Saturday' });
    setShowAddForm(false);
    setConflicts([]);
  };

  const handleDeleteSchedule = (index) => {
    const schedule = schedules[index];
    if (window.confirm(`Delete ${schedule.courseCode}?`)) {
      const updatedData = { ...routineData };
      updatedData[selectedSemester][selectedGroup] = schedules.filter((_, i) => i !== index);
      setRoutineData(updatedData);
    }
  };

  const handleSaveEdit = () => {
    const updatedData = { ...routineData };
    updatedData[selectedSemester][selectedGroup] = [...schedules];
    updatedData[selectedSemester][selectedGroup][editingIndex] = { ...editingSchedule };
    setRoutineData(updatedData);
    setEditingSchedule(null);
    setEditingIndex(null);
  };

  if (!routineData) return <div className="p-6">Loading...</div>;

  const semesters = Object.keys(routineData);
  const groups = selectedSemester ? Object.keys(routineData[selectedSemester]) : [];
  const schedules = selectedSemester && selectedGroup ? routineData[selectedSemester][selectedGroup] : [];

  const schedulesByDay = days.reduce((acc, day) => {
    acc[day] = schedules.filter(s => s.day === day);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Routine & Academic Scheduler</h1>
          <p className="text-brand-gray">Manage class schedules with automatic conflict detection</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Schedule
        </button>
      </div>

      <div className="flex gap-4">
        <select
          value={selectedSemester || ''}
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setSelectedGroup(Object.keys(routineData[e.target.value])[0]);
          }}
          className="px-4 py-2 border rounded-lg"
        >
          {semesters.map(sem => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>

        <select
          value={selectedGroup || ''}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {groups.map(group => (
            <option key={group} value={group}>Group {group}</option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold mb-4">Add New Schedule</h2>
          <form onSubmit={handleAddSchedule} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Course Code (e.g., CSE 3297)"
                value={newSchedule.courseCode}
                onChange={(e) => setNewSchedule({ ...newSchedule, courseCode: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Course Name"
                value={newSchedule.courseName}
                onChange={(e) => setNewSchedule({ ...newSchedule, courseName: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Faculty (e.g., EKH)"
                value={newSchedule.faculty}
                onChange={(e) => setNewSchedule({ ...newSchedule, faculty: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Room (e.g., 1501)"
                value={newSchedule.room}
                onChange={(e) => setNewSchedule({ ...newSchedule, room: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                required
              />
              <select
                value={newSchedule.day}
                onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                {days.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              <input
                type="text"
                placeholder="Time Slot (e.g., 10:00 AM - 11:20 AM)"
                value={newSchedule.timeSlot}
                onChange={(e) => setNewSchedule({ ...newSchedule, timeSlot: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                required
              />
            </div>
            {conflicts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-900">Conflicts: {conflicts.map(c => c.courseCode).join(', ')}</h4>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600">Add</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-bold mb-4">{selectedSemester} - Group {selectedGroup}</h2>
        <div className="space-y-4">
          {days.map(day => (
            <div key={day} className="border-b pb-4 last:border-b-0">
              <h3 className="font-semibold text-brand-blue mb-2">{day}</h3>
              {schedulesByDay[day].length === 0 ? (
                <p className="text-sm text-gray-400">No classes</p>
              ) : (
                <div className="space-y-2">
                  {schedulesByDay[day].map((schedule, idx) => {
                    const globalIndex = schedules.indexOf(schedule);
                    return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      {editingIndex === globalIndex ? (
                        <div className="flex-1 grid grid-cols-5 gap-2">
                          <input value={editingSchedule.courseCode} onChange={(e) => setEditingSchedule({ ...editingSchedule, courseCode: e.target.value })} className="px-2 py-1 border rounded" />
                          <input value={editingSchedule.faculty} onChange={(e) => setEditingSchedule({ ...editingSchedule, faculty: e.target.value })} className="px-2 py-1 border rounded" />
                          <input value={editingSchedule.room} onChange={(e) => setEditingSchedule({ ...editingSchedule, room: e.target.value })} className="px-2 py-1 border rounded" />
                          <input value={editingSchedule.timeSlot} onChange={(e) => setEditingSchedule({ ...editingSchedule, timeSlot: e.target.value })} className="px-2 py-1 border rounded" />
                          <div className="flex gap-1">
                            <button onClick={handleSaveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="w-4 h-4" /></button>
                            <button onClick={() => { setEditingSchedule(null); setEditingIndex(null); }} className="p-1 text-gray-600 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{schedule.courseCode}</span>
                              <span className="text-sm text-gray-600">- {schedule.courseName}</span>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-600 mt-1">
                              <span>{schedule.timeSlot}</span>
                              <span>Faculty: {schedule.faculty}</span>
                              <span>Room: {schedule.room}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingSchedule({ ...schedule }); setEditingIndex(globalIndex); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteSchedule(globalIndex)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoutineScheduler;
