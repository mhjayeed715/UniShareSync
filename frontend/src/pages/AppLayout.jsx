import React, { useState } from 'react';
import { 
  LayoutDashboard, BookOpen, FolderKanban, Calendar, 
  MessageSquare, Bell, Search, Menu, X, LogOut, ChevronDown, Users 
} from 'lucide-react';
import Dashboard from './Dashboard';
import CourseResourcesPage from './CourseResourcesPage';
import ClubsEventsPage from './ClubsEventsPage';
import RoutineViewer from './RoutineViewer';

const AppLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: BookOpen, label: 'Course Resources' },
    { icon: Users, label: 'Clubs & Events' },
    { icon: FolderKanban, label: 'Projects' },
    { icon: Calendar, label: 'Scheduler' },
    { icon: MessageSquare, label: 'Lost & Found' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Course Resources':
        return <CourseResourcesPage />;
      case 'Clubs & Events':
        return <ClubsEventsPage />;
      case 'Scheduler':
        return <RoutineViewer />;
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
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-brand-blue text-white transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex-shrink-0
      `}>
        <div className="h-16 flex items-center px-6 border-b border-blue-800">
           <span className="text-xl font-bold tracking-tight">UniShareSync</span>
        </div>

        <div className="p-4 space-y-1">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-4 px-2">Menu</div>
          {menuItems.map((item, index) => (
            <button 
              key={index}
              onClick={() => {
                setActiveTab(item.label);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.label
                  ? 'bg-brand-teal text-white shadow-md' 
                  : 'text-blue-100 hover:bg-blue-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-blue-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-blue-100 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-10 flex-shrink-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-500 hover:text-brand-blue"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search resources, projects, or events..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-brand-teal/50 outline-none text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-400 hover:text-brand-blue transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm">
                MH
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-brand-dark">Mehrab Hossain</div>
                <div className="text-xs text-brand-gray">Computer Science & Engineering</div>
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
    </div>
  );
};

export default AppLayout;