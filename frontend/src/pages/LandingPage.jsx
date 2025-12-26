import React from 'react';
import { BookOpen, Users, Calendar, MessageSquare, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { Hero } from '../components/ui/animated-hero';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-dark">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-0.7"> 
              {/* Custom Logo */}
              <img 
                src="/unisharesync.png"
                alt="UniShareSync Logo"
                className="h-10 w-auto"  
              />
              <span className="text-xl font-bold text-brand-blue tracking-tight">UniShareSync</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-brand-gray">
              <a href="#features" className="hover:text-brand-blue transition-colors">Features</a>
              <a href="#roles" className="hover:text-brand-blue transition-colors">For You</a>
              <a href="#how-it-works" className="hover:text-brand-blue transition-colors">How it works</a>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('login')}
                className="text-brand-blue font-medium hover:text-brand-teal transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => onNavigate('signup')}
                className="bg-brand-teal text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-600 transition-all shadow-sm hover:shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero onNavigate={onNavigate} />

      <div className="bg-brand-light pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-5xl">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 md:p-4">
              <div className="bg-gray-50 rounded-xl overflow-hidden aspect-[16/9] flex items-center justify-center border border-gray-100">
                <div className="text-center text-gray-400">
                  <div className="mb-2">Dashboard Interface Preview</div>
                  <div className="text-sm">Includes Scheduler, Resources, and Notifications</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-blue mb-4">Everything you need to succeed</h2>
            <p className="text-brand-gray max-w-2xl mx-auto">From academic resources to lost items, we've streamlined the university experience.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, title: "Resource Sharing", desc: "Upload and find notes by course, subject, or professor tags." },
              { icon: Users, title: "Project Collaboration", desc: "Track tasks, share files, and coordinate deadlines with your team." },
              { icon: Calendar, title: "Smart Scheduler", desc: "Stay on top of events and classes with a conflict-aware calendar." },
              { icon: MessageSquare, title: "Campus Feedback", desc: "Report lost items and share anonymous suggestions securely." },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-gray-100 hover:border-brand-teal/30 hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-brand-blue mb-2">{feature.title}</h3>
                <p className="text-brand-gray text-sm mb-4">{feature.desc}</p>
                <a href="#" className="text-brand-teal font-medium text-sm hover:underline">Learn more &rarr;</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Benefits */}
      <section id="roles" className="py-20 bg-brand-light/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-brand-teal">
              <h3 className="text-2xl font-bold text-brand-blue mb-4">Students</h3>
              <ul className="space-y-3">
                {['Access course notes instantly', 'Manage group projects', 'View class schedules'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-brand-gray">
                    <CheckCircle className="w-5 h-5 text-brand-teal" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-brand-blue">
              <h3 className="text-2xl font-bold text-brand-blue mb-4">Faculty</h3>
              <ul className="space-y-3">
                {['Upload official resources', 'Send class announcements', 'Monitor project progress'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-brand-gray">
                    <CheckCircle className="w-5 h-5 text-brand-blue" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-blue text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-0.7 mb-4">
                <img
                 src="/unisharesync.png"
                 alt="UniShareSync Logo"
               className="h-8 w-auto"
                />
                <span className="text-xl font-bold">UniShareSync</span>
              </div>

              <p className="text-gray-400 text-sm">Unify your campus. Simplify your academics.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">For Students</a></li>
                <li><a href="#" className="hover:text-white">For Faculty</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex justify-between items-center text-sm text-gray-400">
            <p>&copy;  2025 UniShareSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;