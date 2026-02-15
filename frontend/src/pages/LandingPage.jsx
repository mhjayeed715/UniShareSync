import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, MessageSquare, ArrowRight, Shield, CheckCircle, Bell, X, Mail, Phone, Linkedin, GraduationCap, Briefcase, HelpCircle, FileText, ChevronRight, Star, Zap, Globe, Lock, Search, Upload, ClipboardList, MapPin, Menu } from 'lucide-react';
import { Hero } from '../components/ui/animated-hero';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm" onClick={onClose}></div>
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-brand-blue to-brand-teal">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const LandingPage = ({ onNavigate }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notices/public`);
      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }
      const data = await response.json();
      setNotices(data.notices || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3"> 
              <img 
                src="/unisharesync.png"
                alt="UniShareSync Logo"
                className="h-10 w-auto"  
              />
              <span className="text-xl font-bold text-gray-900 tracking-tight">UniShareSync</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-gray-700">
              <a href="#features" className="hover:text-brand-teal transition-colors">Features</a>
              <a href="#roles" className="hover:text-brand-teal transition-colors">For You</a>
              <a href="#how-it-works" className="hover:text-brand-teal transition-colors">How it works</a>
              <button onClick={() => openModal('contact')} className="hover:text-brand-teal transition-colors">Contact</button>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <button 
                onClick={() => onNavigate('login')}
                className="text-gray-700 font-semibold hover:text-brand-teal transition-colors px-4 py-2"
              >
                Login
              </button>
              <button 
                onClick={() => onNavigate('signup')}
                className="bg-brand-teal text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-teal-600 hover:shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Features</a>
              <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">For You</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">How it works</a>
              <button onClick={() => { openModal('contact'); setMobileMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">Contact</button>
              <div className="flex gap-3 px-4 pt-2 border-t border-gray-200">
                <button 
                  onClick={() => onNavigate('login')}
                  className="flex-1 text-center text-gray-700 font-semibold border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Login
                </button>
                <button 
                  onClick={() => onNavigate('signup')}
                  className="flex-1 text-center bg-brand-teal text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-teal-600"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <Hero onNavigate={onNavigate} />

      {/* Stats Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Active Students" },
              { value: "50+", label: "Faculty Members" },
              { value: "1000+", label: "Resources Shared" },
              { value: "100+", label: "Projects Completed" }
            ].map((stat, idx) => (
              <div key={idx} className="group">
                <div className="text-4xl font-bold mb-2 text-white group-hover:scale-110 transition-transform">{stat.value}</div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campus Notices Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-brand-teal/10 px-4 py-2 rounded-full mb-4">
              <Bell className="w-5 h-5 text-brand-teal" />
              <span className="text-brand-teal font-semibold">Campus Notices</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Stay Updated</h2>
            <p className="text-gray-600">Latest announcements from university administration</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : notices.length > 0 ? (
              <div className="space-y-4">
                {notices.slice(0, 3).map((notice) => (
                  <div key={notice.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-brand-teal transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-teal rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{notice.title}</h3>
                        <p className="text-gray-600 mb-3">{notice.content}</p>
                        {notice.imageUrl && (
                          <img 
                            src={notice.imageUrl.startsWith('data:') || notice.imageUrl.startsWith('http') ? notice.imageUrl : `${API_URL}${notice.imageUrl}`} 
                            alt={notice.title} 
                            className="rounded-lg max-h-48 object-cover mb-3"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{new Date(notice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {notice.priority === 'HIGH' && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium animate-pulse">🔴 Important</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No notices yet</h3>
                <p className="text-gray-500">Check back later for campus announcements</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-teal font-semibold text-sm uppercase tracking-wider">Powerful Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Everything you need to succeed</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">From academic resources to lost items, we've streamlined the entire university experience into one powerful platform.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Resource Sharing", desc: "Upload and discover study materials, notes, past papers, and assignments organized by course and semester.", color: "bg-blue-600" },
              { icon: Users, title: "Project Hub", desc: "Collaborate on academic projects, track milestones, share files, and coordinate with team members seamlessly.", color: "bg-brand-teal" },
              { icon: Calendar, title: "Smart Scheduler", desc: "Never miss a class with our intelligent routine viewer. View your entire week's schedule at a glance.", color: "bg-purple-600" },
              { icon: MessageSquare, title: "Feedback System", desc: "Submit anonymous feedback, report issues, and communicate directly with administration.", color: "bg-orange-500" },
              { icon: Search, title: "Lost & Found", desc: "Report lost items or help others find their belongings. Connect with the campus community instantly.", color: "bg-pink-600" },
              { icon: Bell, title: "Notifications", desc: "Stay informed with real-time updates on notices, events, approvals, and important announcements.", color: "bg-green-600" },
              { icon: GraduationCap, title: "Club Events", desc: "Discover and join university clubs, register for events, and stay connected with campus activities.", color: "bg-indigo-600" },
              { icon: Shield, title: "Secure Platform", desc: "Your data is protected with industry-standard security. Role-based access ensures privacy.", color: "bg-red-600" },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-xl border border-gray-200 hover:border-brand-teal hover:shadow-lg transition-all group bg-white">
                <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Benefits */}
      <section id="roles" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-teal font-semibold text-sm uppercase tracking-wider">Built for Everyone</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">Tailored for Your Role</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Whether you're a student seeking resources or faculty managing courses, UniShareSync adapts to your needs.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Students Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-brand-teal transition-all group">
              <div className="w-14 h-14 bg-brand-teal rounded-xl flex items-center justify-center mb-6">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">For Students</h3>
              <p className="text-gray-600 mb-6">Maximize your academic potential with tools designed specifically for student success.</p>
              <ul className="space-y-3">
                {[
                  { text: 'Access course notes, past papers & study materials instantly', icon: BookOpen },
                  { text: 'Collaborate on group projects with built-in task management', icon: Users },
                  { text: 'View your class schedule and never miss a lecture', icon: Calendar },
                  { text: 'Report lost items and connect with fellow students', icon: Search },
                  { text: 'Join clubs and register for exciting campus events', icon: Star },
                  { text: 'Submit feedback and suggestions anonymously', icon: MessageSquare }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => openModal('students')}
                className="mt-6 text-brand-teal font-semibold flex items-center gap-2 hover:gap-3 transition-all"
              >
                Learn more <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Faculty Card */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-600 transition-all group">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">For Faculty</h3>
              <p className="text-gray-600 mb-6">Streamline your teaching workflow with powerful tools for resource management and student engagement.</p>
              <ul className="space-y-3">
                {[
                  { text: 'Upload official course materials, syllabi & resources', icon: Upload },
                  { text: 'Approve or review student-submitted resources', icon: CheckCircle },
                  { text: 'Post important announcements to your students', icon: Bell },
                  { text: 'Monitor student project progress and submissions', icon: ClipboardList },
                  { text: 'Manage club activities and event approvals', icon: Calendar },
                  { text: 'Access comprehensive dashboard with analytics', icon: Star }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item.text}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => openModal('faculty')}
                className="mt-6 text-blue-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all"
              >
                Learn more <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-teal font-semibold text-sm uppercase tracking-wider">Simple Process</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">Get started in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account with your university email and verify via OTP", icon: Mail },
              { step: "2", title: "Explore", desc: "Browse resources, join projects, view schedules, and discover features", icon: Globe },
              { step: "3", title: "Collaborate", desc: "Share resources, collaborate on projects, and engage with campus life", icon: Users }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-brand-teal rounded-xl flex items-center justify-center text-white">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Campus Experience?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">Join thousands of students and faculty members who are already using UniShareSync to enhance their academic journey.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => onNavigate('signup')}
              className="bg-brand-teal text-white px-8 py-4 rounded-lg font-bold hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => openModal('contact')}
              className="border-2 border-gray-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-800 transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/unisharesync.png"
                  alt="UniShareSync Logo"
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold">UniShareSync</span>
              </div>
              <p className="text-gray-400 text-sm mb-6">Unify your campus. Simplify your academics. Transform your university experience.</p>
              <div className="flex gap-4">
                <a href="https://www.linkedin.com/in/mhjayeed715" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-teal transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:mehrabjayeed715@gmail.com" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-brand-teal transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={() => openModal('features')} className="hover:text-brand-teal transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Features</button></li>
                <li><button onClick={() => openModal('students')} className="hover:text-brand-teal transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> For Students</button></li>
                <li><button onClick={() => openModal('faculty')} className="hover:text-brand-teal transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> For Faculty</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button onClick={() => openModal('help')} className="hover:text-brand-teal transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Help Center</button></li>
                <li><button onClick={() => openModal('contact')} className="hover:text-brand-teal transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Contact Us</button></li>
                <li><button onClick={() => openModal('privacy')} className="hover:text-brand-teal transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-lg">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-teal" />
                  <a href="mailto:mehrabjayeed715@gmail.com" className="hover:text-brand-teal transition-colors">mehrabjayeed715@gmail.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand-teal" />
                  <a href="tel:+8801533652232" className="hover:text-brand-teal transition-colors">+8801533652232</a>
                </li>
                <li className="flex items-center gap-3">
                  <Linkedin className="w-4 h-4 text-brand-teal" />
                  <a href="https://www.linkedin.com/in/mhjayeed715" target="_blank" rel="noopener noreferrer" className="hover:text-brand-teal transition-colors">linkedin.com/in/mhjayeed715</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2026 UniShareSync. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <button onClick={() => openModal('privacy')} className="hover:text-brand-teal transition-colors">Privacy Policy</button>
              <button onClick={() => openModal('terms')} className="hover:text-brand-teal transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* Features Modal */}
      <Modal isOpen={activeModal === 'features'} onClose={closeModal} title="Platform Features">
        <div className="space-y-6">
          <p className="text-brand-gray">UniShareSync provides a comprehensive suite of tools designed to enhance your university experience:</p>
          <div className="grid gap-4">
            {[
              { title: "Resource Library", desc: "Access thousands of study materials including notes, past papers, assignments, and lecture slides organized by course and semester." },
              { title: "Project Collaboration", desc: "Create project teams, assign tasks, track progress, and share files seamlessly with your group members." },
              { title: "Smart Scheduling", desc: "View your complete class routine, set reminders for important deadlines, and never miss a lecture or exam." },
              { title: "Lost & Found", desc: "Report lost items with photos and descriptions. Browse found items and connect with the finder easily." },
              { title: "Campus Notices", desc: "Stay updated with official announcements, events, and important notifications from the administration." },
              { title: "Feedback System", desc: "Submit feedback, suggestions, or complaints. Admin can respond and track issue resolution." },
              { title: "Club Management", desc: "Discover university clubs, join memberships, and register for exciting campus events." }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-brand-blue mb-1">{item.title}</h4>
                <p className="text-sm text-brand-gray">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Students Modal */}
      <Modal isOpen={activeModal === 'students'} onClose={closeModal} title="For Students">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-brand-teal/10 to-teal-50 p-6 rounded-xl">
            <h4 className="font-bold text-brand-blue text-lg mb-2">Maximize Your Academic Success</h4>
            <p className="text-brand-gray">UniShareSync is built with students in mind. Access everything you need to excel in your studies and make the most of your university life.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-brand-blue">What You Can Do:</h4>
            <ul className="space-y-3">
              {[
                "📚 Download notes, past papers, and study materials uploaded by seniors and faculty",
                "👥 Create or join project teams and collaborate with classmates",
                "📅 View your complete class routine and exam schedules",
                "🔍 Report lost items or help others find their belongings",
                "🎉 Discover and join university clubs and events",
                "💬 Submit anonymous feedback about courses or campus facilities",
                "🔔 Receive real-time notifications about important updates",
                "📱 Access everything from any device - mobile or desktop"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-brand-gray text-sm">{item}</li>
              ))}
            </ul>
          </div>
          <button 
            onClick={() => { closeModal(); onNavigate('signup'); }}
            className="w-full bg-brand-teal text-white py-3 rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Sign Up as Student
          </button>
        </div>
      </Modal>

      {/* Faculty Modal */}
      <Modal isOpen={activeModal === 'faculty'} onClose={closeModal} title="For Faculty">
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-brand-blue/10 to-blue-50 p-6 rounded-xl">
            <h4 className="font-bold text-brand-blue text-lg mb-2">Streamline Your Teaching Workflow</h4>
            <p className="text-brand-gray">UniShareSync empowers faculty members with tools to manage resources, engage with students, and oversee academic activities efficiently.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-brand-blue">Faculty Features:</h4>
            <ul className="space-y-3">
              {[
                "📤 Upload course materials, syllabi, and resources directly",
                "✅ Review and approve student-submitted resources",
                "📢 Post announcements visible to all students",
                "📊 Monitor student project submissions and progress",
                "🎓 Manage club activities and event approvals",
                "📈 Access dashboard with insights and analytics",
                "👥 View student engagement and resource downloads",
                "🔐 Secure access with role-based permissions"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-brand-gray text-sm">{item}</li>
              ))}
            </ul>
          </div>
          <button 
            onClick={() => { closeModal(); onNavigate('signup'); }}
            className="w-full bg-brand-blue text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Sign Up as Faculty
          </button>
        </div>
      </Modal>

      {/* Help Center Modal */}
      <Modal isOpen={activeModal === 'help'} onClose={closeModal} title="Help Center">
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <p className="text-yellow-800 text-sm">Need assistance? We're here to help you make the most of UniShareSync.</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-brand-blue">Frequently Asked Questions</h4>
            {[
              { q: "How do I upload resources?", a: "Navigate to the Resources page, click 'Upload Resource', fill in the details, attach your file, and submit. Faculty-uploaded resources are published instantly, while student uploads require approval." },
              { q: "How do I join a project?", a: "Go to the Projects page, browse available projects, and click 'Request to Join' on any project that interests you. The project owner will receive your request." },
              { q: "How do I report a lost item?", a: "Visit the Lost & Found page, click 'Report Lost Item', provide details and optionally upload a photo. The item will be visible to all users." },
              { q: "Can I change my password?", a: "Yes! Go to your Profile settings and click 'Change Password'. You'll need to enter your current password and choose a new one." },
              { q: "How do notifications work?", a: "You'll receive real-time notifications for resource approvals, project updates, new notices, and more. Click the bell icon in the navbar to view all notifications." }
            ].map((item, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-4">
                <h5 className="font-medium text-brand-blue mb-1">{item.q}</h5>
                <p className="text-sm text-brand-gray">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-bold text-brand-blue mb-2">Still need help?</h4>
            <p className="text-sm text-brand-gray mb-3">Contact us directly and we'll get back to you within 24 hours.</p>
            <a href="mailto:mehrabjayeed715@gmail.com" className="text-brand-teal font-medium hover:underline">mehrabjayeed715@gmail.com</a>
          </div>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={activeModal === 'contact'} onClose={closeModal} title="Contact Us">
        <div className="space-y-6">
          <p className="text-brand-gray">Have questions, feedback, or need support? We'd love to hear from you!</p>
          <div className="grid gap-4">
            <a href="mailto:mehrabjayeed715@gmail.com" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-brand-teal/10 transition-colors group">
              <div className="w-12 h-12 bg-brand-teal/10 rounded-xl flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-colors">
                <Mail className="w-6 h-6 text-brand-teal group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-bold text-brand-blue">Email</h4>
                <p className="text-brand-gray text-sm">mehrabjayeed715@gmail.com</p>
              </div>
            </a>
            <a href="tel:+8801533652232" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-brand-blue/10 transition-colors group">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                <Phone className="w-6 h-6 text-brand-blue group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-bold text-brand-blue">Phone</h4>
                <p className="text-brand-gray text-sm">+8801533652232</p>
              </div>
            </a>
            <a href="https://www.linkedin.com/in/mhjayeed715" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Linkedin className="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <h4 className="font-bold text-brand-blue">LinkedIn</h4>
                <p className="text-brand-gray text-sm">linkedin.com/in/mhjayeed715</p>
              </div>
            </a>
          </div>
          <div className="bg-gradient-to-r from-brand-blue/5 to-brand-teal/5 p-6 rounded-xl">
            <h4 className="font-bold text-brand-blue mb-2">Response Time</h4>
            <p className="text-sm text-brand-gray">We typically respond within 24-48 hours. For urgent matters, please call directly.</p>
          </div>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal isOpen={activeModal === 'privacy'} onClose={closeModal} title="Privacy Policy">
        <div className="space-y-6 text-sm">
          <p className="text-brand-gray">Last updated: February 2026</p>
          <div className="space-y-4">
            <section>
              <h4 className="font-bold text-brand-blue mb-2">1. Information We Collect</h4>
              <p className="text-brand-gray">We collect information you provide directly, including your name, email address, student/faculty ID, and profile information. We also collect data about your usage of the platform to improve our services.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">2. How We Use Your Information</h4>
              <p className="text-brand-gray">Your information is used to provide and improve our services, communicate with you about updates and features, and ensure platform security. We never sell your personal data to third parties.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">3. Data Security</h4>
              <p className="text-brand-gray">We implement industry-standard security measures including encryption, secure authentication (JWT), and role-based access control to protect your data.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">4. Your Rights</h4>
              <p className="text-brand-gray">You have the right to access, update, or delete your personal information at any time through your profile settings. You can also request a copy of your data by contacting us.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">5. Cookies</h4>
              <p className="text-brand-gray">We use essential cookies to maintain your session and preferences. No third-party tracking cookies are used.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">6. Contact</h4>
              <p className="text-brand-gray">For privacy-related inquiries, contact us at mehrabjayeed715@gmail.com</p>
            </section>
          </div>
        </div>
      </Modal>

      {/* Terms Modal */}
      <Modal isOpen={activeModal === 'terms'} onClose={closeModal} title="Terms of Service">
        <div className="space-y-6 text-sm">
          <p className="text-brand-gray">Last updated: February 2026</p>
          <div className="space-y-4">
            <section>
              <h4 className="font-bold text-brand-blue mb-2">1. Acceptance of Terms</h4>
              <p className="text-brand-gray">By using UniShareSync, you agree to these terms of service. If you do not agree, please do not use the platform.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">2. User Responsibilities</h4>
              <p className="text-brand-gray">Users must provide accurate information, respect intellectual property rights, and not upload harmful or inappropriate content. You are responsible for maintaining the security of your account.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">3. Content Guidelines</h4>
              <p className="text-brand-gray">All uploaded resources must be educational in nature. Plagiarized or copyrighted content without permission is strictly prohibited. Admin reserves the right to remove inappropriate content.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">4. Account Termination</h4>
              <p className="text-brand-gray">We reserve the right to suspend or terminate accounts that violate these terms or engage in abusive behavior.</p>
            </section>
            <section>
              <h4 className="font-bold text-brand-blue mb-2">5. Limitation of Liability</h4>
              <p className="text-brand-gray">UniShareSync is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.</p>
            </section>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;
