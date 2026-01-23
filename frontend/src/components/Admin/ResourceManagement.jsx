import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Download, Trash2, Filter, Upload, FileText, X } from 'lucide-react';
import api from '../../api';
import { parseCSV } from '../../utils/routineParser';
import courseOfferCSV from '../../assets/Proposed Course Offer Winter 2026 - CSE.csv?raw';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedResources, setSelectedResources] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [semesterCourses, setSemesterCourses] = useState({});
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    semester: '',
    courseName: '',
    type: 'NOTE',
    file: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadCoursesFromCSV();
    fetchResources();
  }, [currentPage, statusFilter, searchTerm, selectedSemester]);

  const loadCoursesFromCSV = () => {
    const lines = courseOfferCSV.trim().split('\n').map(l => l.replace(/\r/g, ''));
    const semesterMap = { '8': [] }; // Default semester for old data
    const allCourses = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const semester = values[1];
      const courseCode = values[2];
      const courseTitle = values[3];

      if (semester && courseCode && courseTitle && !courseTitle.includes('Total')) {
        const semKey = semester.replace(/st|nd|rd|th/g, '').trim();
        if (!semesterMap[semKey]) semesterMap[semKey] = [];
        
        const courseInfo = { code: courseCode, title: courseTitle, semester: semKey };
        const exists = semesterMap[semKey].find(c => c.code === courseCode);
        if (!exists) {
          semesterMap[semKey].push(courseInfo);
          allCourses.push(courseInfo);
        }
      }
    }

    console.log('Loaded semesters:', Object.keys(semesterMap));
    setSemesterCourses(semesterMap);
    setCourses(allCourses);
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/admin/manage/resources?page=${currentPage}&status=${statusFilter}&search=${searchTerm}`);
      setResources(response.data);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseSemester = (courseName) => {
    if (!courseName) return '8'; // Default to semester 8 for old data
    const course = courses.find(c => courseName.includes(c.code));
    return course?.semester || '8';
  };

  const filteredResources = selectedSemester === 'all' 
    ? resources 
    : resources.filter(r => getCourseSemester(r.courseName || r.course?.courseCode) === selectedSemester);

  const handleApprove = async (id) => {
    try {
      await api.put(`/api/admin/manage/resources/${id}/approve`);
      fetchResources();
    } catch (error) {
      alert('Error approving resource: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/api/admin/manage/resources/${id}`);
      fetchResources();
    } catch (error) {
      alert('Error deleting resource: ' + error.message);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedResources.length === 0) {
      alert('Please select resources first');
      return;
    }
    if (!confirm(`Are you sure you want to ${action} selected resources?`)) return;
    
    try {
      await api.post('/api/admin/manage/resources/bulk-action', {
        resourceIds: selectedResources,
        action
      });
      setSelectedResources([]);
      fetchResources();
    } catch (error) {
      alert('Error performing bulk action: ' + error.message);
    }
  };

  const toggleSelectResource = (id) => {
    setSelectedResources(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedResources.length === resources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(resources.map(r => r.id));
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
      formData.append('semester', uploadData.semester);
      formData.append('courseName', uploadData.courseName);
      formData.append('type', uploadData.type);

      console.log('Uploading with data:', {
        title: uploadData.title,
        courseName: uploadData.courseName,
        type: uploadData.type,
        fileName: uploadData.file.name
      });

      const response = await fetch('http://localhost:5000/api/resources/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.success) {
        alert('Resource uploaded successfully and pending approval');
        setShowUploadModal(false);
        resetUploadForm();
        fetchResources();
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading resource: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadData({
      title: '',
      description: '',
      semester: '',
      courseName: '',
      type: 'NOTE',
      file: null
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-600 mt-1">Review and approve uploaded resources</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            Upload Resource
          </button>
          {selectedResources.length > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('approve')}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Selected ({selectedResources.length})
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Semesters</option>
            {Object.keys(semesterCourses).sort((a, b) => parseInt(a) - parseInt(b)).map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Resources</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedResources.length === resources.length && resources.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No resources found</td>
                </tr>
              ) : (
                filteredResources.map(resource => (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedResources.includes(resource.id)}
                        onChange={() => toggleSelectResource(resource.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{resource.title}</div>
                      {resource.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{resource.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {resource.course 
                        ? `${resource.course.courseCode} - ${resource.course.courseName}` 
                        : resource.courseName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {resource.uploader?.name || 'Unknown'}
                      <div className="text-xs text-gray-500">{resource.uploader?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        resource.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {resource.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!resource.isApproved && (
                          <button
                            onClick={() => handleApprove(resource.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(resource.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Upload Resource</h2>
              <button
                onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUploadResource}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Semester *</label>
                    <select
                      value={uploadData.semester}
                      onChange={(e) => setUploadData({ ...uploadData, semester: e.target.value, courseName: '' })}
                      className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select</option>
                      {Object.keys(semesterCourses).sort((a, b) => parseInt(a) - parseInt(b)).map(sem => (
                        <option key={sem} value={sem}>Sem {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      value={uploadData.type}
                      onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="NOTE">Notes</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="SOLUTION">Solution</option>
                      <option value="BOOK">Book</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    value={uploadData.courseName}
                    onChange={(e) => setUploadData({ ...uploadData, courseName: e.target.value })}
                    placeholder="e.g., CSE 3107 - Software Engineering"
                    className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    list="courseList"
                    required
                  />
                  <datalist id="courseList">
                    {uploadData.semester && semesterCourses[uploadData.semester]?.map(course => (
                      <option key={course.code} value={`${course.code} - ${course.title}`} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">File * (Max 10MB)</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full text-sm border rounded-lg p-2 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    required
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.jpg,.jpeg,.png,.gif"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
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

export default ResourceManagement;
