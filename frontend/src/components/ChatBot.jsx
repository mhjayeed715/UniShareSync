import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import routineCSV from '../assets/8A - Central Routine.csv?raw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Parse routine CSV to extract course schedules
const parseRoutineData = () => {
  const lines = routineCSV.trim().split('\n').map(l => l.replace(/\r/g, ''));
  const schedules = {};
  const byDay = {};
  const validDays = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  let currentDay = '';
  let timeSlots = [];
  
  // Initialize byDay for all valid days
  validDays.forEach(d => { byDay[d] = []; });
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());
    
    // Check for day headers (day name in column 1)
    if (values[1] && validDays.includes(values[1])) {
      currentDay = values[1];
      timeSlots = []; // Reset time slots for new day
      continue;
    }
    
    // Check for time slot headers (contains AM or PM pattern like "8.30 AM")
    if (values[1] && (values[1].includes('AM') || values[1].includes('PM')) && values[1].includes('-')) {
      timeSlots = [];
      // Time slots are at indices 1, 4, 7, 10, 13, 16 (every 3rd starting from 1)
      for (let j = 1; j < values.length; j += 3) {
        const slot = values[j];
        if (slot && (slot.includes('AM') || slot.includes('PM'))) {
          timeSlots.push(slot);
        } else {
          timeSlots.push(''); // Keep placeholder for alignment
        }
      }
      continue;
    }
    
    // Skip header row and empty rows
    if (values[0] === 'Section' || !values[0]) continue;
    
    // Process course data - section must match pattern like 1A, 8B, 10A
    const section = values[0];
    if (!section.match(/^\d+[A-Z]$/)) continue;
    
    // Course data at indices 1,2,3 for slot 0, then 4,5,6 for slot 1, etc.
    for (let slotIndex = 0; slotIndex < 6; slotIndex++) {
      const baseIdx = 1 + (slotIndex * 3);
      const course = values[baseIdx] || '';
      const faculty = values[baseIdx + 1] || '';
      const room = values[baseIdx + 2] || '';
      
      // Check if this cell has a valid course code
      if (course && course.match(/^[A-Z]{2,4}\s*\d{4}/)) {
        const codeMatch = course.match(/([A-Z]{2,4})\s*(\d{4})/);
        if (!codeMatch) continue;
        
        const courseCode = `${codeMatch[1]} ${codeMatch[2]}`;
        const timeSlot = timeSlots[slotIndex] || `Slot ${slotIndex + 1}`;
        
        const entry = {
          day: currentDay,
          time: timeSlot,
          section,
          faculty: faculty || 'TBA',
          room: room || 'TBA',
          fullName: course,
          courseCode
        };
        
        // Add to schedules by course code
        if (!schedules[courseCode]) {
          schedules[courseCode] = [];
        }
        schedules[courseCode].push(entry);
        
        // Add to byDay
        if (currentDay) {
          byDay[currentDay].push(entry);
        }
      }
    }
  }
  
  console.log('Parsed routine data:', { 
    coursesCount: Object.keys(schedules).length, 
    daysCounts: Object.fromEntries(Object.entries(byDay).map(([k,v]) => [k, v.length]))
  });
  
  return { schedules, byDay };
};

const { schedules: routineData, byDay: routineByDay } = parseRoutineData();

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m UniShareSync Assistant. Ask me about course schedules, resources, notices, projects, or any feature! Try asking "When is CSE 3314?" or "Saturday routine for semester 1"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [platformData, setPlatformData] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch real platform data when chat opens
  useEffect(() => {
    if (isOpen && !platformData) {
      fetchPlatformData();
    }
  }, [isOpen]);

  const fetchPlatformData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [resourcesRes, noticesRes, projectsRes, lostFoundRes] = await Promise.all([
        fetch(`${API_URL}/api/resources`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch(`${API_URL}/api/notices`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch(`${API_URL}/api/projects`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch(`${API_URL}/api/lost-found`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null)
      ]);

      const data = {};
      
      if (resourcesRes?.ok) {
        const res = await resourcesRes.json();
        data.resources = (res.resources || res.data || []).slice(0, 20);
      }
      if (noticesRes?.ok) {
        const res = await noticesRes.json();
        data.notices = (Array.isArray(res) ? res : res.notices || []).slice(0, 10);
      }
      if (projectsRes?.ok) {
        const res = await projectsRes.json();
        data.projects = (res.projects || res.data || []).slice(0, 15);
      }
      if (lostFoundRes?.ok) {
        const res = await lostFoundRes.json();
        data.lostFound = (res.items || res.data || []).slice(0, 10);
      }

      setPlatformData(data);
    } catch (error) {
      console.error('Failed to fetch platform data:', error);
    }
  };

  const buildSystemPrompt = (userQuery) => {
    let prompt = `You are UniShareSync Assistant. IMPORTANT: Only mention data that is explicitly listed below. Do NOT make up or invent any notices, resources, projects, or items. If data shows "None" or is empty, say there are none.

FEATURES: Resources (upload/download course materials), Projects (showcase), Notices (announcements), Lost & Found, Feedback, Club Events, Routine (class schedules).

HOW TO USE: Resources tab to upload/download. Lost & Found to report items. Routine tab for schedules.
`;

    // Parse query for schedule-related questions
    const queryLower = (userQuery || '').toLowerCase();
    const courseMatch = queryLower.match(/([a-z]{2,4})\s*(\d{4})/i);
    const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const dayMatch = days.find(d => queryLower.includes(d));
    const semesterMatch = queryLower.match(/semester\s*(\d+)/i) || queryLower.match(/sem\s*(\d+)/i);
    const sectionMatch = queryLower.match(/section\s*(\d+[a-z])/i) || queryLower.match(/\b(\d+[a-z])\b/i);
    
    const isScheduleQuery = courseMatch || dayMatch || semesterMatch || sectionMatch ||
      queryLower.includes('schedule') || queryLower.includes('routine') || 
      queryLower.includes('class') || queryLower.includes('course');
    
    if (isScheduleQuery) {
      const courseList = Object.keys(routineData);
      
      // Handle specific course query first
      if (courseMatch && !dayMatch && !semesterMatch) {
        const searchCode = `${courseMatch[1].toUpperCase()} ${courseMatch[2]}`;
        const matchingCourses = courseList.filter(c => c.includes(searchCode) || c.includes(courseMatch[1].toUpperCase()));
        
        if (matchingCourses.length > 0) {
          prompt += `\nCOURSE SCHEDULES:\n`;
          matchingCourses.slice(0, 5).forEach(code => {
            const sessions = routineData[code];
            prompt += `${code}: `;
            sessions.forEach(s => {
              prompt += `${s.day} ${s.time} (Sec ${s.section}, Room ${s.room}, ${s.faculty}); `;
            });
            prompt += '\n';
          });
        } else {
          prompt += `\nNo schedule found for "${searchCode}". Available courses: ${courseList.slice(0, 10).join(', ')}...\n`;
        }
      }
      // Handle day + optional semester/section query
      else if (dayMatch || semesterMatch || sectionMatch) {
        const dayCapitalized = dayMatch ? dayMatch.charAt(0).toUpperCase() + dayMatch.slice(1) : null;
        const semNum = semesterMatch ? semesterMatch[1] : null;
        const secFilter = sectionMatch ? sectionMatch[1].toUpperCase() : null;
        
        let filteredEntries = [];
        
        if (dayCapitalized && routineByDay[dayCapitalized]) {
          filteredEntries = [...routineByDay[dayCapitalized]];
        } else if (!dayCapitalized) {
          // Get all entries from all days
          Object.values(routineByDay).forEach(entries => {
            filteredEntries = filteredEntries.concat(entries);
          });
        }
        
        // Filter by semester (section starts with semester number)
        if (semNum) {
          filteredEntries = filteredEntries.filter(e => e.section.startsWith(semNum));
        }
        
        // Filter by specific section
        if (secFilter) {
          filteredEntries = filteredEntries.filter(e => e.section === secFilter);
        }
        
        if (filteredEntries.length > 0) {
          const header = dayCapitalized || 'ALL DAYS';
          const semLabel = semNum ? ` (Semester ${semNum})` : '';
          const secLabel = secFilter ? ` Section ${secFilter}` : '';
          prompt += `\n${header} SCHEDULE${semLabel}${secLabel}:\n`;
          
          // Group by section for cleaner output
          const bySection = {};
          filteredEntries.forEach(e => {
            if (!bySection[e.section]) bySection[e.section] = [];
            bySection[e.section].push(e);
          });
          
          Object.entries(bySection).slice(0, 6).forEach(([section, entries]) => {
            prompt += `Section ${section}:\n`;
            entries.slice(0, 5).forEach(e => {
              prompt += `  - ${e.courseCode} at ${e.time} (Room ${e.room}, ${e.faculty})\n`;
            });
          });
        } else {
          const searchDesc = [
            dayCapitalized || '',
            semNum ? `semester ${semNum}` : '',
            secFilter ? `section ${secFilter}` : ''
          ].filter(Boolean).join(', ');
          prompt += `\nNo classes found for ${searchDesc}. Available days: ${Object.keys(routineByDay).filter(d => routineByDay[d].length > 0).join(', ')}.\n`;
        }
      } else {
        // General schedule query - show summary
        const daysWithClasses = Object.entries(routineByDay)
          .filter(([_, entries]) => entries.length > 0)
          .map(([day, entries]) => `${day}: ${entries.length} classes`);
        prompt += `\nSCHEDULE SUMMARY:\n${daysWithClasses.join('\n')}\nAsk about a specific day like "Saturday routine" or course like "CSE 3314", or by semester like "semester 1 schedule".\n`;
      }
    }

    // Always show actual data status
    prompt += `\nCURRENT DATABASE STATUS:\n`;
    
    if (platformData) {
      if (platformData.resources?.length > 0) {
        prompt += `- Resources: ${platformData.resources.length} available (${platformData.resources.slice(0, 3).map(r => `"${r.title}"`).join(', ')})\n`;
      } else {
        prompt += `- Resources: None uploaded yet\n`;
      }
      
      if (platformData.notices?.length > 0) {
        prompt += `- Notices: ${platformData.notices.length} posted (${platformData.notices.slice(0, 3).map(n => `"${n.title}"`).join(', ')})\n`;
      } else {
        prompt += `- Notices: None posted yet\n`;
      }
      
      if (platformData.projects?.length > 0) {
        prompt += `- Projects: ${platformData.projects.length} submitted (${platformData.projects.slice(0, 3).map(p => `"${p.title}"`).join(', ')})\n`;
      } else {
        prompt += `- Projects: None submitted yet\n`;
      }
      
      if (platformData.lostFound?.length > 0) {
        prompt += `- Lost/Found: ${platformData.lostFound.length} items reported\n`;
      } else {
        prompt += `- Lost/Found: No items reported\n`;
      }
    } else {
      prompt += `- Data not loaded yet. Please try again.\n`;
    }

    prompt += `\nRemember: Only report what's listed above. Never invent data.`;
    return prompt;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          systemPrompt: buildSystemPrompt(userQuery),
          messages: [...messages.slice(-6), userMessage]
        })
      });

      const data = await response.json();
      
      if (data.success && data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-brand-teal to-brand-blue rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 group"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">?</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-teal to-brand-blue p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">UniShare Assistant</h3>
                <p className="text-white/70 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-brand-blue' : 'bg-brand-teal'
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-brand-blue text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-teal/50 text-sm"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-10 h-10 bg-brand-teal rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
