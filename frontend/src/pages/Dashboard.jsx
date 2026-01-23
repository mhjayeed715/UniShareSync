import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, MessageSquare, 
  Clock, FileText, AlertCircle, Bell, X, Maximize2 
} from 'lucide-react';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewNotice, setPreviewNotice] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [statsRes, activitiesRes, noticesRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/dashboard/activities', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/notices', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();
      const noticesData = await noticesRes.json();

      console.log('Notices data:', noticesData);

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (activitiesData.success) {
        setActivities(activitiesData.activities);
      }
      if (noticesData.success || noticesData.notices) {
        setNotices(noticesData.notices || []);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700';
      case 'NORMAL': return 'bg-blue-100 text-blue-700';
      case 'LOW': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Welcome back, {user.name}! 👋</h1>
          <p className="text-brand-gray">Here's what's happening in your academic circle today.</p>
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

        {/* Campus Notices Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-blue">Campus Notices</h2>
              <p className="text-sm text-brand-gray">Latest announcements from administration</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-4">
              {notices.slice(0, 5).map((notice) => (
                <div 
                  key={notice.id} 
                  className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setPreviewNotice(notice)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bell className="w-6 h-6 text-brand-blue" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-brand-blue group-hover:text-brand-teal transition-colors">{notice.title}</h3>
                        {notice.priority === 'HIGH' && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Important
                          </span>
                        )}
                      </div>
                      <p className="text-brand-gray mb-3 line-clamp-2">{notice.content}</p>
                      {notice.imageUrl && (
                        <div className="relative mb-3">
                          {notice.imageUrl.endsWith('.pdf') ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                              <FileText className="w-8 h-8 text-red-600 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">PDF Document</p>
                                <p className="text-xs text-red-600">Click to view</p>
                              </div>
                              <Maximize2 className="w-5 h-5 text-red-600" />
                            </div>
                          ) : (
                            <>
                              <img 
                                src={`http://localhost:5000${notice.imageUrl}`} 
                                alt={notice.title} 
                                className="rounded-lg max-h-48 object-cover w-full"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                                <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No notices yet</h3>
              <p className="text-gray-500">Check back later for campus announcements</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-brand-dark mb-6">Recent Activity</h2>
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
      </div>

      {/* Notice Preview Modal */}
      {previewNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setPreviewNotice(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark">{previewNotice.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Posted on {new Date(previewNotice.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button 
                onClick={() => setPreviewNotice(null)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {previewNotice.priority === 'HIGH' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-800 font-medium">This is an important notice</span>
                </div>
              )}
              
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg whitespace-pre-wrap leading-relaxed">
                  {previewNotice.content}
                </p>
              </div>
              
              {previewNotice.imageUrl && (
                <div className="mt-6">
                  {previewNotice.imageUrl.endsWith('.pdf') ? (
                    <iframe
                      src={`http://localhost:5000${previewNotice.imageUrl}`}
                      className="w-full h-[600px] rounded-lg border-2 border-gray-200"
                      title={previewNotice.title}
                    />
                  ) : (
                    <img 
                      src={`http://localhost:5000${previewNotice.imageUrl}`} 
                      alt={previewNotice.title} 
                      className="w-full rounded-lg shadow-lg"
                    />
                  )}
                </div>
              )}
              
              <div className="border-t pt-4 mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Posted by:</span> {previewNotice.author?.name || 'Admin'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(previewNotice.priority)}`}>
                    {previewNotice.priority} Priority
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
