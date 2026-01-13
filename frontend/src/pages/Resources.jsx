import React, { useState } from 'react';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { Upload, Search, Filter, X, FileText } from 'lucide-react';

const Resources = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    courseName: '',
    type: 'NOTE',
    file: null
  });

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
          type: 'NOTE',
          file: null
        });
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      alert('Error uploading resource: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
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
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={20} />
              Filters
            </button>
          </div>

          <div className="text-center py-12 text-gray-500">
            <p>No resources yet. Upload your first resource to get started!</p>
          </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type *</label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal"
                    required
                  >
                    <option value="NOTE">Notes</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="SOLUTION">Solution</option>
                    <option value="BOOK">Book</option>
                    <option value="OTHER">Other</option>
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
    </DashboardLayout>
  );
};

export default Resources;
