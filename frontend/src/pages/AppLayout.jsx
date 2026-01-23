import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, FolderKanban, Calendar, 
  MessageSquare, Bell, Search, Menu, X, LogOut, ChevronDown, Users, Settings 
} from 'lucide-react';
import Dashboard from './Dashboard';
import CourseResourcesPage from './CourseResourcesPage';
import ClubsEventsPage from './ClubsEventsPage';
import RoutineViewer from './RoutineViewer';
import Projects from './Projects';
import LostFound from './LostFound';
import Feedback from './Feedback';
import api from '../api';

const AppLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [profileData, setProfileData] = useState({ name: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(user.profilePicture ? `http://localhost:5000${user.profilePicture}` : null);

  useEffect(() => {
    setProfileData({ name: user.name });
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
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

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Fetched notifications:', data);
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: BookOpen, label: 'Course Resources' },
    { icon: Users, label: 'Clubs & Events' },
    { icon: FolderKanban, label: 'Projects' },
    { icon: Calendar, label: 'Scheduler' },
    { icon: Search, label: 'Lost & Found' },
    { icon: MessageSquare, label: 'Feedback' },
  ];

  const renderContent = () => {
    if (showSettings) {
      return (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Settings</h2>
            <button onClick={() => setShowSettings(false)} className="text-brand-teal hover:underline">Back to Dashboard</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : user.profilePicture ? (
                      <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || 'U'
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
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input type="text" value={user.department || ''} className="w-full px-4 py-2 border rounded-lg bg-gray-50" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input type="text" value={user.role} className="w-full px-4 py-2 border rounded-lg bg-gray-50" disabled />
                </div>
                <button onClick={handleUpdateProfile} className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600">Update Profile</button>
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
                <button onClick={handleChangePassword} className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600">Change Password</button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Course Resources':
        return <CourseResourcesPage />;
      case 'Clubs & Events':
        return <ClubsEventsPage />;
      case 'Projects':
        return <Projects />;
      case 'Scheduler':
        return <RoutineViewer />;
      case 'Lost & Found':
        return <LostFound />;
      case 'Feedback':
        try {
          return <Feedback />;
        } catch (error) {
          console.error('Feedback component error:', error);
          return (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-semibold">Error Loading Feedback</h3>
                <p className="text-red-600 text-sm mt-1">Please try refreshing the page.</p>
              </div>
            </div>
          );
        }
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-brand-gray mb-2">{activeTab}</h2>
              <p>This feature is coming soon!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex font-sans">
      
      {/* Sidebar */}
      <aside className={`bg-brand-blue text-white transition-all duration-300 shadow-2xl ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-blue-800">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <img src="/unisharesync.png" alt="UniShareSync Logo" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold tracking-tight">UniShareSync</span>
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-blue-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
            {sidebarOpen && <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-4 px-2">Menu</div>}
            {menuItems.map((item, index) => (
              <button 
                key={index}
                onClick={() => {
                  setActiveTab(item.label);
                  setShowSettings(false);
                }}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-all ${
                  activeTab === item.label && !showSettings
                    ? 'bg-brand-teal text-white shadow-md' 
                    : 'text-blue-100 hover:bg-blue-800'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-blue-800">
            <button 
              onClick={() => { setShowSettings(true); setActiveTab('Dashboard'); }}
              className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg text-blue-100 hover:bg-blue-800 transition-colors mb-2`}
            >
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span>Settings</span>}
            </button>
            <button 
              onClick={onLogout}
              className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-lg text-blue-100 hover:bg-red-500/10 hover:text-red-400 transition-colors`}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-10 flex-shrink-0">
          {/* Search Bar */}
          <div className="flex flex-1 max-w-lg mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search resources, projects, or events..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-brand-teal/50 outline-none text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="relative p-2 text-gray-400 hover:text-brand-blue transition-colors"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowSettings(true)}>
              <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                {user.profilePicture ? (
                  <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-brand-dark">{user.name}</div>
                <div className="text-xs text-brand-gray">{user.department || user.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-y-auto bg-brand-light min-h-0">
          {renderContent()}
        </main>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)}>
          <div className="absolute right-4 top-20 w-96 bg-white rounded-xl shadow-2xl border max-h-[600px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-brand-blue to-brand-teal text-white">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); fetchNotifications(); }} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                  Refresh
                </button>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto max-h-[520px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      if (notif.link) window.location.href = notif.link;
                    }}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notif.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        notif.type === 'success' ? 'bg-green-500' :
                        notif.type === 'warning' ? 'bg-yellow-500' :
                        notif.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900">{notif.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 bg-brand-blue rounded-full flex-shrink-0 mt-2" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;