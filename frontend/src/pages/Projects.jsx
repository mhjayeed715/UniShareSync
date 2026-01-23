import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Calendar, CheckCircle, Clock, AlertCircle, Eye, UserPlus, X } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
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
  }, [semesterFilter, searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (semesterFilter) params.append('semester', semesterFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`http://localhost:5000/api/projects?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const allProjects = await response.json();
      setProjects(allProjects);
      
      // Fetch user's projects
      const myResponse = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (myResponse.ok) {
        const userProjects = await myResponse.json();
        setMyProjects(userProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
      setMyProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ACTIVE': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PAUSED': return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredProjects = activeTab === 'browse' ? projects : myProjects;

  const handleJoinProject = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join project');
      }
      
      const result = await response.json();
      alert(result.message);
      
      // Refresh projects
      fetchProjects();
    } catch (error) {
      console.error('Error joining project:', error);
      alert(error.message || 'Failed to join project');
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

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete project');
      }
      
      // Update local state
      setProjects(projects.filter(p => p.id !== projectId));
      setMyProjects(myProjects.filter(p => p.id !== projectId));
      
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(error.message || 'Failed to delete project');
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status update failed:', response.status, errorText);
        throw new Error(`Failed to update status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update local state
      setProjects(projects.map(p => p.id === projectId ? {...p, status: newStatus} : p));
      setMyProjects(myProjects.map(p => p.id === projectId ? {...p, status: newStatus} : p));
      
      alert(result.message || 'Project status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update status');
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
          {user.role === 'STUDENT' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          )}
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

          {/* Search and Filters */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
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
              {activeTab === 'browse' && (
                <select
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="">All Semesters</option>
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={`Semester ${i+1}`}>Semester {i+1}</option>
                  ))}
                </select>
              )}
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
                        <div className="text-sm text-gray-500 mb-2">
                          <span>Collaboration Tools: Document sharing, task management, and team communication</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{project.members.length}/{project.maxMembers} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                      {project.semester && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {project.semester}
                        </span>
                      )}
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
                      {activeTab === 'browse' && user.role !== 'FACULTY' && !project.members.includes(user.name) && project.members.length < (project.maxMembers || 10) && (
                        <button
                          onClick={() => handleJoinProject(project.id)}
                          className="bg-brand-blue text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700"
                        >
                          Request to Join
                        </button>
                      )}
                      {activeTab === 'browse' && project.members.includes(user.name) && (
                        <span className="text-green-600 text-sm font-medium">Member</span>
                      )}
                      {activeTab === 'browse' && project.members.length >= (project.maxMembers || 10) && (
                        <span className="text-gray-500 text-sm font-medium">Full</span>
                      )}
                      {activeTab === 'browse' && user.role === 'FACULTY' && (
                        <span className="text-blue-600 text-sm font-medium">Faculty View</span>
                      )}
                      {activeTab === 'my-projects' && project.createdBy === user.name && (
                        <div className="flex gap-2">
                          <select
                            value={project.status}
                            onChange={(e) => handleStatusChange(project.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PAUSED">Paused</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      {activeTab === 'my-projects' && project.createdBy !== user.name && (
                        <span className="text-green-600 text-sm font-medium">Member</span>
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
                <h3 className="font-semibold mb-2">Team Members ({selectedProject.members.length}/{selectedProject.maxMembers || 10})</h3>
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
                  {selectedProject.members.length === 0 && (
                    <p className="text-gray-500 text-sm">No members yet</p>
                  )}
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
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const token = localStorage.getItem('token');
                  
                  const response = await fetch('http://localhost:5000/api/projects', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                  });
                  
                  if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create project');
                  }
                  
                  const result = await response.json();
                  alert(result.message);
                  
                  setShowCreateModal(false);
                  setFormData({
                    title: '',
                    description: '',
                    maxMembers: 5,
                    deadline: '',
                    semester: ''
                  });
                  
                  // Refresh projects
                  fetchProjects();
                } catch (error) {
                  console.error('Error creating project:', error);
                  alert(error.message || 'Failed to create project');
                }
              }} className="p-6 space-y-4">
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
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={`Semester ${i+1}`}>Semester {i+1}</option>
                  ))}
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
