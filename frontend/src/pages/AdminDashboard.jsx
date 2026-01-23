import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Calendar, Users, Bell, Settings, LogOut, Menu, X, MessageSquare, Flag, FolderKanban, Megaphone, TrendingUp, TrendingDown, Clock, Activity, CheckCircle, UserPlus, FileText, BarChart3, Database, Shield, CalendarClock } from 'lucide-react';
import NoticeManager from '../components/Admin/NoticeManager';
import UserManagement from '../components/Admin/UserManagement';
import ResourceManagement from '../components/Admin/ResourceManagement';
import RoutineScheduler from '../components/Admin/RoutineScheduler';
import AdminRoutineManager from '../components/Admin/AdminRoutineManager';
import ClubEventManager from '../components/Admin/ClubEventManager';
import api from '../api';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [profileData, setProfileData] = useState({ name: user.name, department: user.department });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(user.profilePicture ? `http://localhost:5000${user.profilePicture}` : null);

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      if (profileData.department) formData.append('department', profileData.department);
      if (profilePicture) formData.append('profilePicture', profilePicture);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/profile/update', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const res = await response.json();
      
      if (res.success) {
        localStorage.setItem('user', JSON.stringify(res.user));
        alert('Profile updated successfully!');
        window.location.reload();
      }
    } catch (error) {
      alert(error.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const res = await api.put('/api/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.success) {
        alert('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      alert(error.message || 'Failed to change password');
    }
  };

  useEffect(() => {
    if (user.role !== 'ADMIN') {
      window.location.href = '/dashboard';
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsResponse = await api.getDashboardStats();
      setStats(statsResponse.stats);
      
      const activitiesResponse = await api.getRecentActivities();
      const activities = activitiesResponse.activities || [];
      setRecentActivities(activities.slice(0, 5));
      setAllActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({ students: { value: '0', change: '0%', trend: 'up' }, faculty: { value: '0', change: '0%', trend: 'up' }, resources: { value: '0', change: '0%', trend: 'up' }, events: { value: '0', change: '0%', trend: 'up' }, projects: { value: '0', change: '0%', trend: 'up' }, feedback: { value: '0', change: '0%', trend: 'up' } });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getSortedActivities = () => {
    const sorted = [...allActivities].sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
    const start = (activitiesPage - 1) * 10;
    return sorted.slice(start, start + 10);
  };

  const totalPages = Math.ceil(allActivities.length / 10);

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Dashboard Overview' },
    { id: 'users', icon: Users, label: 'User Management' },
    { id: 'resources', icon: BookOpen, label: 'Resource Management' },
    { id: 'notices', icon: Megaphone, label: 'Notice Board' },
    { id: 'scheduler', icon: CalendarClock, label: 'Routine & Scheduler' },
    { id: 'events', icon: Calendar, label: 'Event Management' },
    { id: 'projects', icon: FolderKanban, label: 'Project Oversight' },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback & Support' },
    { id: 'lostfound', icon: Flag, label: 'Lost & Found' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics & Reports' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderContent = () => {
    if (activeSection === 'users') return <UserManagement />;
    if (activeSection === 'resources') return <ResourceManagement />;
    if (activeSection === 'notices') return <NoticeManager />;
    if (activeSection === 'scheduler') return <AdminRoutineManager />;
    if (activeSection === 'events') return <ClubEventManager />;
    if (activeSection === 'settings') return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Settings</h2>
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0]
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Picture</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setProfilePicture(file);
                      setProfilePreview(URL.createObjectURL(file));
                    }
                  }} className="text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" value={user.email} className="w-full px-4 py-2 border rounded-lg bg-gray-50" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <input type="text" value={user.role} className="w-full px-4 py-2 border rounded-lg bg-gray-50" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input type="text" value={profileData.department || ''} onChange={(e) => setProfileData({...profileData, department: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <button onClick={handleUpdateProfile} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Update Profile</button>
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <button onClick={handleChangePassword} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    );
    if (activeSection === 'overview') {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
                <p className="text-indigo-100 text-lg">Here's what's happening in the platform today</p>
              </div>
              <div className="hidden md:block"><Shield className="w-24 h-24 opacity-20" /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {stats && Object.entries(stats).map(([key, data]) => {
              const colors = { students: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' }, faculty: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' }, resources: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }, events: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' }, projects: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' }, feedback: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' } };
              const color = colors[key] || colors.students;
              return (
                <div key={key} className={`bg-white rounded-xl shadow-sm border-2 ${color.border} p-6 hover:shadow-md transition-all`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${color.bg}`}><Database className={`w-6 h-6 ${color.text}`} /></div>
                    {data.trend && (data.trend === 'up' ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />)}
                  </div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">{key}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{data.value}</p>
                  {data.change && <p className={`text-sm font-medium ${data.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{data.change} from last month</p>}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Activity className="w-6 h-6 text-indigo-600" />Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveSection('users')} className="p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                  <UserPlus className="w-8 h-8 text-indigo-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-gray-900 text-sm">Add User</p>
                </button>
                <button onClick={() => setActiveSection('resources')} className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group">
                  <CheckCircle className="w-8 h-8 text-green-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-gray-900 text-sm">Approve Resources</p>
                </button>
                <button onClick={() => setActiveSection('notices')} className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group">
                  <Megaphone className="w-8 h-8 text-purple-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-gray-900 text-sm">Post Notice</p>
                </button>
                <button onClick={() => setActiveSection('events')} className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group">
                  <Calendar className="w-8 h-8 text-orange-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-gray-900 text-sm">Create Event</p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Clock className="w-6 h-6 text-indigo-600" />Recent Activity</h2>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="text-sm border rounded-lg px-3 py-1">
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No recent activities</p>
                ) : (
                  recentActivities.map((activity) => {
                    const iconMap = { 'Megaphone': Megaphone, 'Upload': FileText, 'Flag': FolderKanban, 'Calendar': Calendar };
                    const Icon = iconMap[activity.icon] || FileText;
                    return (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`p-2 rounded-lg ${activity.bg} flex-shrink-0`}><Icon className={`w-4 h-4 ${activity.color}`} /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900"><span className="font-semibold">{activity.user}</span> {activity.action}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <button onClick={() => setShowActivitiesModal(true)} className="w-full mt-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">View All Activity</button>
            </div>
          </div>
        </div>
      );
    }
    
    const comingSoon = { projects: { icon: FolderKanban, title: 'Project Oversight', desc: 'Monitor student projects, track progress, manage team members, and provide support.', color: 'teal' }, feedback: { icon: MessageSquare, title: 'Feedback & Support', desc: 'View and respond to user feedback, handle support requests, and track resolution.', color: 'pink' }, lostfound: { icon: Flag, title: 'Lost & Found', desc: 'Manage lost and found items, help match items with owners, and maintain records.', color: 'yellow' }, analytics: { icon: BarChart3, title: 'Analytics & Reports', desc: 'View detailed analytics, generate reports, and gain insights into platform usage.', color: 'indigo' } };
    const section = comingSoon[activeSection];
    if (section) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center max-w-md mx-auto">
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-${section.color}-100 rounded-full mb-4`}><section.icon className={`w-8 h-8 text-${section.color}-600`} /></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-gray-600 mb-6">{section.desc}</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-${section.color}-50 text-${section.color}-700 rounded-lg`}><Clock className="w-4 h-4" /><span className="text-sm font-medium">Coming Soon</span></div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 shadow-2xl ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-700 flex items-center justify-between">
            {sidebarOpen && <div className="flex items-center gap-3"><img src="/unisharesync.png" alt="UniShareSync Logo" className="w-10 h-10 rounded-lg" /><div><span className="font-bold text-lg">UniShareSync</span><p className="text-xs text-gray-400">Admin Portal</p></div></div>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === item.id ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg scale-105' : 'hover:bg-gray-700/50'}`}>
                <item.icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">{item.label}</span>}
                {sidebarOpen && item.badge && <span className="px-2 py-0.5 bg-red-500 text-xs font-bold rounded-full">{item.badge}</span>}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"><LogOut size={20} />{sidebarOpen && <span className="text-sm font-medium">Logout</span>}</button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
            <div className="flex items-center gap-4">
              <button className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Shield className="w-3 h-3" />Administrator</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
                  {user.profilePicture ? (
                    <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.[0]
                  )}
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {loading && activeSection === 'overview' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div><p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p></div>
            </div>
          ) : renderContent()}
        </main>
      </div>

      {/* Activities Modal */}
      {showActivitiesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">All Activities</h2>
              <button onClick={() => setShowActivitiesModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              <div className="space-y-3">
                {getSortedActivities().map((activity) => {
                  const iconMap = { 'Megaphone': Megaphone, 'Upload': FileText, 'Flag': FolderKanban, 'Calendar': Calendar };
                  const Icon = iconMap[activity.icon] || FileText;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-4 rounded-lg border hover:bg-gray-50">
                      <div className={`p-2 rounded-lg ${activity.bg} flex-shrink-0`}><Icon className={`w-5 h-5 ${activity.color}`} /></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900"><span className="font-semibold">{activity.user}</span> {activity.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-between">
              <button onClick={() => setActivitiesPage(p => Math.max(1, p - 1))} disabled={activitiesPage === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-600">Page {activitiesPage} of {totalPages}</span>
              <button onClick={() => setActivitiesPage(p => Math.min(totalPages, p + 1))} disabled={activitiesPage === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
