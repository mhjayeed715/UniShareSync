import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Calendar, CheckCircle, Clock, AlertCircle, Eye, UserPlus, X } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxMembers: 5,
    deadline: '',
    semester: ''
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const allProjects = [
        {
          id: 1,
          title: 'Web Development Project',
          description: 'Build a responsive e-commerce website using React and Node.js',
          members: ['John Doe', 'Jane Smith'],
          maxMembers: 5,
          deadline: '2024-03-15',
          createdBy: 'Prof. Wilson',
          createdById: 'prof123',
          status: 'RECRUITING',
          skills: ['React', 'Node.js', 'MongoDB'],
          progress: 25,
          semester: 'Spring 2024',
          pendingRequests: [
            { id: 1, name: 'Bob Smith', email: 'bob@university.edu', requestedAt: '2024-01-22' },
            { id: 2, name: 'Carol White', email: 'carol@university.edu', requestedAt: '2024-01-21' }
          ]
        },
        {
          id: 2,
          title: 'Mobile App Development',
          description: 'Create a student management mobile application',
          members: ['Alice Johnson', 'Bob Wilson'],
          maxMembers: 4,
          deadline: '2024-04-20',
          createdBy: 'Dr. Smith',
          createdById: 'dr456',
          status: 'ACTIVE',
          skills: ['React Native', 'Firebase'],
          progress: 60,
          semester: 'Spring 2024',
          pendingRequests: []
        }
      ];
      
      setProjects(allProjects);
      setMyProjects(allProjects.filter(p => p.members.includes(user.name)));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'RECRUITING': return 'bg-blue-100 text-blue-800';
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'RECRUITING': return <UserPlus className="w-4 h-4" />;
      case 'ACTIVE': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredProjects = (activeTab === 'browse' ? projects : myProjects).filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleJoinProject = async (projectId) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (project.createdById === user.id) {
        alert('You are the creator of this project');
        return;
      }
      
      // Add to pending requests
      setProjects(projects.map(p => 
        p.id === projectId
          ? { ...p, pendingRequests: [...(p.pendingRequests || []), { 
              id: Date.now(), 
              name: user.name, 
              email: user.email, 
              requestedAt: new Date().toISOString().split('T')[0] 
            }] }
          : p
      ));
      alert('Join request sent successfully!');
    } catch (error) {
      console.error('Error joining project:', error);
    }
  };

  const handleAcceptRequest = (projectId, requestId) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const request = p.pendingRequests.find(r => r.id === requestId);
        return {
          ...p,
          members: [...p.members, request.name],
          pendingRequests: p.pendingRequests.filter(r => r.id !== requestId)
        };
      }
      return p;
    }));
  };

  const handleDeclineRequest = (projectId, requestId) => {
    setProjects(projects.map(p => 
      p.id === projectId
        ? { ...p, pendingRequests: p.pendingRequests.filter(r => r.id !== requestId) }
        : p
    ));
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      setMyProjects(myProjects.filter(p => p.id !== projectId));
      alert('Project deleted successfully!');
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-brand-blue">Project Collaboration</h2>
            <p className="text-brand-gray mt-1">Join collaborative projects and work with your peers</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 font-medium ${activeTab === 'browse' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500'}`}
            >
              Browse Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('my-projects')}
              className={`px-6 py-3 font-medium ${activeTab === 'my-projects' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-gray-500'}`}
            >
              My Projects ({myProjects.length})
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects found</h3>
                <p className="text-gray-500">
                  {activeTab === 'browse' ? 'No projects available to join' : 'You haven\'t joined any projects yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map(project => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{project.title}</h3>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                    
                    {project.skills && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-brand-blue/10 text-brand-blue text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                        {project.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{project.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {activeTab === 'my-projects' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-brand-blue h-2 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.members.length}/{project.maxMembers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 mb-4">
                      Created by: {project.createdBy}
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="text-brand-blue hover:bg-brand-blue/10 px-3 py-1 rounded-lg text-sm"
                      >
                        View Details
                      </button>
                      {activeTab === 'browse' && !project.members.includes(user.name) && project.members.length < project.maxMembers && !project.pendingRequests?.some(r => r.name === user.name) && (
                        <button
                          onClick={() => handleJoinProject(project.id)}
                          className="bg-brand-blue text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                        >
                          Request to Join
                        </button>
                      )}
                      {activeTab === 'browse' && project.pendingRequests?.some(r => r.name === user.name) && (
                        <span className="text-yellow-600 text-sm font-medium">Request Pending</span>
                      )}
                      {activeTab === 'my-projects' && project.createdBy === user.name && (
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>
              
              {selectedProject.skills && (
                <div>
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-brand-blue/10 text-brand-blue text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-2">Team Members ({selectedProject.members.length}/{selectedProject.maxMembers})</h3>
                <div className="space-y-2">
                  {selectedProject.members.map((member, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-brand-blue/10 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-brand-blue" />
                      </div>
                      <span>{member}</span>
                      {member === selectedProject.createdBy && (
                        <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Creator</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedProject.createdBy === user.name && selectedProject.pendingRequests?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Pending Join Requests ({selectedProject.pendingRequests.length})</h3>
                  <div className="space-y-2">
                    {selectedProject.pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div>
                          <p className="font-medium">{request.name}</p>
                          <p className="text-sm text-gray-600">{request.email}</p>
                          <p className="text-xs text-gray-400">Requested: {new Date(request.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleAcceptRequest(selectedProject.id, request.id);
                              setSelectedProject({
                                ...selectedProject,
                                members: [...selectedProject.members, request.name],
                                pendingRequests: selectedProject.pendingRequests.filter(r => r.id !== request.id)
                              });
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              handleDeclineRequest(selectedProject.id, request.id);
                              setSelectedProject({
                                ...selectedProject,
                                pendingRequests: selectedProject.pendingRequests.filter(r => r.id !== request.id)
                              });
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedProject.status)}`}>
                    {getStatusIcon(selectedProject.status)}
                    {selectedProject.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Deadline</h3>
                  <p className="text-gray-600">{new Date(selectedProject.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue h-24"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  required
                >
                  <option value="">Select Semester</option>
                  <option value="Spring 2024">Spring 2024</option>
                  <option value="Summer 2024">Summer 2024</option>
                  <option value="Fall 2024">Fall 2024</option>
                  <option value="Winter 2024">Winter 2024</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({...formData, maxMembers: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-blue-700"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
