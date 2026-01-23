import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, MessageSquare, 
  ArrowUpRight, Clock, FileText, AlertCircle 
} from 'lucide-react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [statsRes, activitiesRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/dashboard/activities', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (activitiesData.success) {
        setActivities(activitiesData.activities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForStat = (label) => {
    if (label.includes('Resources')) return { icon: BookOpen, color: 'bg-blue-500' };
    if (label.includes('Projects') || label.includes('Uploads')) return { icon: Users, color: 'bg-teal-500' };
    if (label.includes('Events')) return { icon: Calendar, color: 'bg-purple-500' };
    if (label.includes('Notices') || label.includes('Students')) return { icon: MessageSquare, color: 'bg-orange-500' };
    return { icon: FileText, color: 'bg-blue-500' };
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'resource': return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'project': return { icon: Users, color: 'text-teal-500', bg: 'bg-teal-50' };
      case 'event': return { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' };
      default: return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' };
    }
  };

  const upcomingClasses = [
    { subject: 'Software Engineering', code: 'CSE 3297', time: '10:00 AM - 11:20 AM', room: 'Room 1501' },
    { subject: 'Database Management Systems', code: 'CSE 3170', time: '12:00 PM - 01:20 PM', room: 'Room 1504' },
    { subject: 'Web Programming', code: 'CSE 3313', time: '02:00 PM - 03:30 PM', room: 'Room 1503' },
  ];

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">Welcome back, {user.name}! 👋</h1>
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-teal border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats && Object.entries(stats).map(([key, data]) => {
              const { icon: Icon, color } = getIconForStat(data.label);
              return (
                <div key={key} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">This Semester</span>
                  </div>
                  <h3 className="text-3xl font-bold text-brand-dark mb-1">{data.value}</h3>
                  <p className="text-sm text-brand-gray">{data.label}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-brand-dark">Recent Activity</h2>
              <button className="text-sm text-brand-teal font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {activities.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No recent activities</p>
              ) : (
                activities.map((activity) => {
                  const { icon: Icon, color: iconColor, bg } = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
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
                  );
                })
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-brand-dark">Today's Schedule</h2>
              <span className="text-xs font-medium text-brand-blue bg-blue-50 px-2 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
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
    </div>
  );
};

export default Dashboard;
