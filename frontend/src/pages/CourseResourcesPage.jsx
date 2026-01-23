import React, { useState, useEffect } from 'react';
import {
  BookOpen, Download, Upload, Search, Filter, Eye, MessageSquare,
  FileText, FileVideo, FileAudio, Code, Grid, List, ChevronDown, X
} from 'lucide-react';

const CourseResourcesPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resources, setResources] = useState([]);
  const [resourcesBySemester, setResourcesBySemester] = useState({});
  const [coursesBySemester, setCoursesBySemester] = useState({});
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    courseName: '',
    semester: 8,
    type: 'notes',
    file: null
  });

  useEffect(() => {
    console.log('CourseResourcesPage mounted');
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      console.log('Fetching resources...');
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'present' : 'missing');
      const response = await fetch('http://localhost:5000/api/resources', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        if (data.success) {
          const resourcesData = data.resources || data.data || [];
          console.log('Resources data:', resourcesData);
          console.log('Resources count:', resourcesData.length);
          setResources(resourcesData);
          
          // Group resources by semester
          const grouped = {};
          for (let i = 1; i <= 10; i++) {
            grouped[i] = [];
          }
          
          resourcesData.forEach(resource => {
            const sem = resource.semester || 8;
            if (grouped[sem]) {
              grouped[sem].push(resource);
            }
          });
          
          setResourcesBySemester(grouped);
        }
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData({ ...uploadData, file });
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('courseName', uploadData.courseName);
      formData.append('semester', uploadData.semester);
      formData.append('type', uploadData.type);

      const response = await fetch('http://localhost:5000/api/resources/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('Resource uploaded successfully!');
        setShowUploadModal(false);
        setUploadData({
          title: '',
          description: '',
          courseName: '',
          semester: 8,
          type: 'notes',
          file: null
        });
        fetchResources(); // Refresh resources after upload
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      alert('Error uploading resource: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Get semesters for sidebar (1-10) - show all semesters
  const semesters = [1,2,3,4,5,6,7,8,9,10];

  // Get current semester resources
  const currentSemesterResources = selectedSemester 
    ? resourcesBySemester[selectedSemester] || []
    : resources;

  // Group current resources by course
  const courseGroups = currentSemesterResources.reduce((acc, resource) => {
    const courseName = resource.matchedCourse || resource.courseName || 'Other';
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(resource);
    return acc;
  }, {});

  const courses = Object.keys(courseGroups).map((courseName, index) => ({
    id: index + 1,
    name: courseName,
    code: courseName,
    resources: courseGroups[courseName].length,
    color: ['bg-blue-500', 'bg-purple-500', 'bg-teal-500', 'bg-orange-500'][index % 4]
  }));

  const currentCourseResources = selectedCourse 
    ? courseGroups[courses.find(c => c.id === selectedCourse)?.name] || []
    : currentSemesterResources;

  const filteredResources = currentCourseResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || (resource.resourceType || resource.type) === filterType;
    return matchesSearch && matchesType;
  });

  const getFileIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'NOTE':
      case 'NOTES':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'ASSIGNMENT':
        return <FileText className="w-5 h-5 text-orange-500" />;
      case 'SOLUTION':
        return <FileText className="w-5 h-5 text-green-500" />;
      case 'BOOK':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'VIDEO':
        return <FileVideo className="w-5 h-5 text-red-500" />;
      case 'CODE':
        return <Code className="w-5 h-5 text-blue-600" />;
      case 'AUDIO':
        return <FileAudio className="w-5 h-5 text-green-600" />;
      case 'OTHER':
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Course Resources</h1>
          <p className="text-brand-gray">Access learning materials and resources for all your courses</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 font-medium text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 w-fit"
        >
          <Upload className="w-4 h-4" />
          Upload Resource
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Semesters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-6">
            <h2 className="text-lg font-bold text-brand-dark mb-4">Semesters</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedSemester(null);
                  setSelectedCourse(null);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedSemester === null
                    ? 'bg-brand-teal text-white'
                    : 'text-brand-gray hover:bg-gray-50'
                }`}
              >
                All Semesters
              </button>
              {semesters.map((semester) => (
                <button
                  key={semester}
                  onClick={() => {
                    setSelectedSemester(semester);
                    setSelectedCourse(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors group ${
                    selectedSemester === semester
                      ? 'bg-brand-teal text-white'
                      : 'text-brand-gray hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-semibold ${selectedSemester === semester ? 'text-white' : 'text-brand-dark'}`}>
                    Semester {semester}
                  </div>
                  <div className="text-xs opacity-75">{resourcesBySemester[semester]?.length || 0} resources</div>
                </button>
              ))}
            </div>
            
            {/* Courses within selected semester */}
            {selectedSemester && courses.length > 0 && (
              <div className="mt-6">
                <h3 className="text-md font-bold text-brand-dark mb-3">Courses</h3>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedCourse === course.id
                          ? 'bg-brand-teal/20 text-brand-teal'
                          : 'text-brand-gray hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium truncate">{course.code}</div>
                      <div className="text-xs opacity-75">{course.resources} resources</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Semester Overview */}
          {selectedSemester === null && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-brand-dark mb-4">Resources by Semester</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {semesters.map((semester) => (
                    <button
                      key={semester}
                      onClick={() => setSelectedSemester(semester)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-teal hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-brand-dark group-hover:text-brand-teal">
                          Semester {semester}
                        </h3>
                        <BookOpen className="w-5 h-5 text-brand-teal" />
                      </div>
                      <p className="text-sm text-brand-gray">
                        {resourcesBySemester[semester]?.length || 0} resources
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Courses Grid for selected semester */}
          {selectedSemester && selectedCourse === null && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-brand-dark">
                    Semester {selectedSemester}
                  </h2>
                  <p className="text-sm text-brand-gray mt-1">
                    {resourcesBySemester[selectedSemester]?.length || 0} resources available
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedSemester(null)}
                  className="text-brand-teal hover:text-teal-600 font-medium text-sm"
                >
                  ← Back to All Semesters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course.id)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${course.color} bg-opacity-10`}>
                        <BookOpen className={`w-6 h-6 ${course.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-teal transition-colors mb-2">{course.name}</h3>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>📚 {course.resources} resources</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resources Section */}
          {selectedCourse !== null && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-brand-dark">
                      {courses.find(c => c.id === selectedCourse)?.name}
                    </h2>
                    <p className="text-sm text-brand-gray mt-1">
                      Semester {selectedSemester}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="text-brand-teal hover:text-teal-600 font-medium text-sm"
                  >
                    ← Back to Semester {selectedSemester}
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-teal/50 outline-none text-sm"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-teal/50 outline-none text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="notes">Notes</option>
                    <option value="assignment">Assignment</option>
                    <option value="solution">Solution</option>
                    <option value="book">Book</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="flex gap-2 border border-gray-200 rounded-lg p-1 bg-gray-50">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-500'}`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-500'}`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Resources Display */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="p-4 border border-gray-100 rounded-lg hover:border-brand-teal/30 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">{getFileIcon(resource.resourceType || resource.type)}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-brand-dark group-hover:text-brand-teal transition-colors truncate">
                              {resource.title}
                            </h4>
                            <div className="flex gap-2 mt-1 text-xs text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{resource.resourceType || resource.type}</span>
                              <span>{resource.fileSize || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">by {resource.uploader?.name || 'Unknown'}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" /> {resource.downloads || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {resource.views || 0}
                        </span>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch(`http://localhost:5000/api/resources/${resource.id}/download`, {
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                            });
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = resource.fileName;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            }
                          } catch (error) {
                            console.error('Download error:', error);
                          }
                        }}
                        className="w-full py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="p-4 border border-gray-100 rounded-lg hover:border-brand-teal/30 transition-all flex items-center gap-4 group"
                    >
                      <div>{getFileIcon(resource.resourceType || resource.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-brand-dark group-hover:text-brand-teal transition-colors truncate">
                            {resource.title}
                          </h4>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">{resource.resourceType || resource.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">by {resource.uploader?.name || 'Unknown'} • {resource.fileSize || 'N/A'}</p>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" /> {resource.downloads || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {resource.views || 0}
                        </span>
                      </div>
                      <button 
                        onClick={async () => {
                          try {
                            const response = await fetch(`http://localhost:5000/api/resources/${resource.id}/download`, {
                              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                            });
                            if (response.ok) {
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = resource.fileName;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                            }
                          } catch (error) {
                            console.error('Download error:', error);
                          }
                        }}
                        className="px-3 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition-colors flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-brand-gray font-medium">No resources found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Resource</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadResource}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    value={uploadData.courseName}
                    onChange={(e) => setUploadData({ ...uploadData, courseName: e.target.value })}
                    placeholder="e.g., CSE 3297 - Software Engineering"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                  <select
                    value={uploadData.semester}
                    onChange={(e) => setUploadData({ ...uploadData, semester: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
                    required
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
                    required
                  >
                    <option value="notes">Notes</option>
                    <option value="assignment">Assignment</option>
                    <option value="solution">Solution</option>
                    <option value="book">Book</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File * (Max 10MB)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-brand-teal transition-colors">
                    <div className="space-y-1 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-brand-teal hover:text-teal-600">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="sr-only"
                            required
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, XLS, PPT, Images</p>
                      {uploadData.file && (
                        <p className="text-sm text-green-600 font-medium">
                          Selected: {uploadData.file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseResourcesPage;
