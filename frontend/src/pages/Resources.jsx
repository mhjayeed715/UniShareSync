import React, { useState, useEffect } from 'react';
import { Upload, Search, X, FileText, Download, Eye, Calendar, User, BookOpen, Link, ExternalLink } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Resources = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    courseName: '',
    semester: 8,
    type: 'notes',
    fileUrl: '',
    fileName: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedSemester, selectedType]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/resources`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setResources(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.courseName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSemester !== 'all') {
      filtered = filtered.filter(resource => resource.semester === parseInt(selectedSemester));
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.resourceType === selectedType);
    }

    setFilteredResources(filtered);
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    
    if (!uploadData.fileUrl) {
      alert('Please provide a file link (Google Drive, OneDrive, etc.)');
      return;
    }

    try {
      new URL(uploadData.fileUrl);
    } catch {
      alert('Please provide a valid URL');
      return;
    }

    try {
      setUploading(true);
      const response = await fetch(`${API_URL}/api/resources/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: uploadData.title,
          description: uploadData.description,
          courseName: uploadData.courseName,
          semester: uploadData.semester,
          type: uploadData.type,
          fileUrl: uploadData.fileUrl,
          fileName: uploadData.fileName || uploadData.title
        })
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
          fileUrl: '',
          fileName: ''
        });
        fetchResources();
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      alert('Error uploading resource: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (resourceId, fileName) => {
    try {
      const response = await fetch(`${API_URL}/api/resources/${resourceId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.redirectUrl) {
        // External link — open in new tab
        window.open(data.redirectUrl, '_blank');
      } else if (response.ok) {
        // Legacy file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file');
    }
  };

  const handleView = async (resourceId) => {
    try {
      const response = await fetch(`${API_URL}/api/resources/${resourceId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.filePath) {
          if (data.data.filePath.startsWith('http')) {
            window.open(data.data.filePath, '_blank');
          } else {
            window.open(`${API_URL}${data.data.filePath}`, '_blank');
          }
        }
      }
    } catch (error) {
      console.error('View error:', error);
      alert('Failed to view file');
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'notes': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'assignment': return <FileText className="w-5 h-5 text-green-500" />;
      case 'solution': return <FileText className="w-5 h-5 text-purple-500" />;
      case 'book': return <BookOpen className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-brand-blue">Course Resources</h2>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-brand-teal text-white px-4 py-2 rounded-lg hover:bg-teal-600"
          >
            <Upload size={20} />
            Upload Resource
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search resources by title, description, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal"
              />
            </div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal"
            >
              <option value="all">All Semesters</option>
              {[1,2,3,4,5,6,7,8,9,10].map((sem) => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal"
            >
              <option value="all">All Types</option>
              <option value="notes">Notes</option>
              <option value="assignment">Assignment</option>
              <option value="solution">Solution</option>
              <option value="book">Book</option>
              <option value="other">Other</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-teal border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No resources found</p>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.resourceType)}
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Semester {resource.semester || 8}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">
                      {resource.resourceType}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{resource.title}</h3>
                  
                  {resource.courseName && (
                    <p className="text-sm text-brand-teal font-medium mb-2">{resource.courseName}</p>
                  )}
                  
                  {resource.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <User className="w-3 h-3" />
                    <span>{resource.uploader?.name}</span>
                    <Calendar className="w-3 h-3 ml-2" />
                    <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(resource.id, resource.fileName)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-brand-teal text-white rounded text-sm hover:bg-teal-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Resource
                    </button>
                    <button
                      onClick={() => handleView(resource.id)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Link * (Google Drive, OneDrive, etc.)</label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="url"
                        value={uploadData.fileUrl}
                        onChange={(e) => setUploadData({ ...uploadData, fileUrl: e.target.value })}
                        placeholder="https://drive.google.com/file/d/..."
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
                        required
                      />
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700 font-medium mb-1">How to share:</p>
                      <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
                        <li>Upload your file to Google Drive or OneDrive</li>
                        <li>Right-click → Share → "Anyone with the link"</li>
                        <li>Copy the link and paste it above</li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Name (optional)</label>
                  <input
                    type="text"
                    value={uploadData.fileName}
                    onChange={(e) => setUploadData({ ...uploadData, fileName: e.target.value })}
                    placeholder="e.g., Chapter1-Notes.pdf"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
                  />
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

export default Resources;