import React from 'react';
import { 
  BookOpen, Users, Calendar, MessageSquare, 
  ArrowUpRight, Clock, FileText, AlertCircle 
} from 'lucide-react';

const DashboardPage = () => {
  const stats = [
    { label: 'Total Resources', value: '124', icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Active Projects', value: '3', icon: Users, color: 'bg-teal-500' },
    { label: 'Upcoming Events', value: '5', icon: Calendar, color: 'bg-purple-500' },
    { label: 'Unread Notices', value: '2', icon: MessageSquare, color: 'bg-orange-500' },
  ];

  const recentActivities = [
    { 
      id: 1, 
      user: 'Md Akram Hossain', 
      action: 'uploaded a new resource', 
      target: 'Advanced Algorithms Notes', 
      time: '2 hours ago',
      icon: FileText,
      iconColor: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    { 
      id: 2, 
      user: 'CSE 3311 Group', 
      action: 'updated project status', 
      target: 'AI Chatbot Implementation', 
      time: '4 hours ago',
      icon: Users,
      iconColor: 'text-teal-500',
      bg: 'bg-teal-50'
    },
    { 
      id: 3, 
      user: 'Admin', 
      action: 'posted an announcement', 
      target: 'Mid-term Exam Schedule', 
      time: '1 day ago',
      icon: AlertCircle,
      iconColor: 'text-orange-500',
      bg: 'bg-orange-50'
    },
  ];

  const upcomingClasses = [
    { subject: 'Software Engineering', code: 'CSE 3297', time: '10:00 AM - 11:20 AM', room: 'Room 1501' },
    { subject: 'Database Management Systems', code: 'CSE 3170', time: '12:00 PM - 01:20 PM', room: 'Room 1504' },
    { subject: 'Web Programming', code: 'CSE 3313', time: '02:00 PM - 03:30 PM', room: 'Room 1503' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Welcome back, Mehrab! 👋</h1>
          <p className="text-brand-gray">Here's what's happening in your academic circle today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 text-brand-dark rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors">
            View Schedule
          </button>
          <button className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 font-medium text-sm shadow-sm hover:shadow transition-all flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            Quick Upload
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">This Semester</span>
            </div>
            <h3 className="text-3xl font-bold text-brand-dark mb-1">{stat.value}</h3>
            <p className="text-sm text-brand-gray">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-brand-dark">Recent Activity</h2>
            <button className="text-sm text-brand-teal font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.bg}`}>
                  <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-brand-dark">
                    <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-medium text-brand-blue">"{activity.target}"</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-brand-dark">Today's Schedule</h2>
            <span className="text-xs font-medium text-brand-blue bg-blue-50 px-2 py-1 rounded-full">Jan 02, 2026</span>
          </div>
          <div className="space-y-4">
            {upcomingClasses.map((cls, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-gray-100 hover:border-brand-teal/30 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-brand-dark group-hover:text-brand-teal transition-colors">{cls.subject}</h4>
                    <p className="text-xs text-brand-gray">{cls.code}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">{cls.room}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {cls.time}
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-sm text-brand-gray hover:text-brand-blue border border-dashed border-gray-300 rounded-lg hover:border-brand-blue transition-all">
              + Add Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
