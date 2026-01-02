import React, { useState } from 'react';
import {
  BookOpen, Download, Upload, Search, Filter, Star, Eye, MessageSquare,
  FileText, FileVideo, FileAudio, Code, Grid, List, ChevronDown
} from 'lucide-react';

const CourseResourcesPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const courses = [
    {
      id: 1,
      code: 'CSE 3297',
      name: 'Software Engineering',
      instructor: 'Ekhfa Hossain',
      students: 45,
      resources: 12,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      code: 'CSE 3170',
      name: 'Database Management Systems',
      instructor: 'Md. Akram Hossain',
      students: 38,
      resources: 8,
      color: 'bg-purple-500'
    },
    {
      id: 3,
      code: 'CSE 3313',
      name: 'Web Programming',
      instructor: 'Tahsin Alam',
      students: 52,
      resources: 15,
      color: 'bg-teal-500'
    },
    {
      id: 4,
      code: 'CSE 3211',
      name: 'Artificial Intelligence',
      instructor: 'Abdur Rab Dhruba',
      students: 41,
      resources: 10,
      color: 'bg-orange-500'
    },
  ];

  const resources = {
    1: [
      { id: 1, name: 'Design Patterns Guide', type: 'PDF', size: '2.4 MB', downloads: 234, views: 456, starred: true, uploadedBy: 'Md Akram Hossain' },
      { id: 2, name: 'Agile Methodology Lecture', type: 'Video', size: '145 MB', downloads: 189, views: 342, starred: false, uploadedBy: 'Ekhfa Hossain' },
      { id: 3, name: 'UML Diagrams Tutorial', type: 'PDF', size: '1.8 MB', downloads: 156, views: 298, starred: true, uploadedBy: 'Admin' },
      { id: 4, name: 'SDLC Implementation', type: 'Code', size: '512 KB', downloads: 98, views: 201, starred: false, uploadedBy: 'Tahsin Alam' },
    ],
    2: [
      { id: 5, name: 'SQL Query Optimization', type: 'PDF', size: '3.2 MB', downloads: 312, views: 567, starred: true, uploadedBy: 'Admin' },
      { id: 6, name: 'Database Normalization', type: 'Video', size: '218 MB', downloads: 267, views: 445, starred: false, uploadedBy: 'Md Akram Hossain' },
      { id: 7, name: 'MongoDB Tutorial', type: 'Code', size: '1.2 MB', downloads: 143, views: 234, starred: true, uploadedBy: 'Tech Team' },
    ],
    3: [
      { id: 8, name: 'React Hooks Guide', type: 'PDF', size: '2.1 MB', downloads: 478, views: 892, starred: true, uploadedBy: 'Ekhfa Hossain' },
      { id: 9, name: 'REST API Design', type: 'Video', size: '167 MB', downloads: 234, views: 456, starred: false, uploadedBy: 'Admin' },
      { id: 10, name: 'Frontend Project Template', type: 'Code', size: '4.5 MB', downloads: 312, views: 534, starred: true, uploadedBy: 'Md Akram Hossain' },
    ],
    4: [
      { id: 11, name: 'Machine Learning Basics', type: 'PDF', size: '5.8 MB', downloads: 267, views: 512, starred: true, uploadedBy: 'Admin' },
      { id: 12, name: 'Neural Networks Explained', type: 'Video', size: '287 MB', downloads: 189, views: 378, starred: false, uploadedBy: 'Tahsin Alam' },
    ],
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'Video':
        return <FileVideo className="w-5 h-5 text-purple-500" />;
      case 'Code':
        return <Code className="w-5 h-5 text-blue-500" />;
      case 'Audio':
        return <FileAudio className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const currentCourseResources = selectedCourse 
    ? resources[selectedCourse] 
    : [];

  const filteredResources = currentCourseResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || resource.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Course Resources</h1>
          <p className="text-brand-gray">Access learning materials and resources for all your courses</p>
        </div>
        <button className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 font-medium text-sm shadow-sm hover:shadow transition-all flex items-center gap-2 w-fit">
          <Upload className="w-4 h-4" />
          Upload Resource
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Courses Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-6">
            <h2 className="text-lg font-bold text-brand-dark mb-4">Courses</h2>
            <div className="space-y-3">
              <button
                onClick={() => setSelectedCourse(null)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                  selectedCourse === null
                    ? 'bg-brand-teal text-white'
                    : 'text-brand-gray hover:bg-gray-50'
                }`}
              >
                All Courses
              </button>
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors group ${
                    selectedCourse === course.id
                      ? 'bg-brand-teal text-white'
                      : 'text-brand-gray hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-sm font-semibold ${selectedCourse === course.id ? 'text-white' : 'text-brand-dark'}`}>
                    {course.code}
                  </div>
                  <div className="text-xs opacity-75">{course.resources} resources</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Courses Grid */}
          {selectedCourse === null && (
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
                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">{course.code}</span>
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark group-hover:text-brand-teal transition-colors mb-2">{course.name}</h3>
                  <p className="text-sm text-brand-gray mb-4">{course.instructor}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>👥 {course.students} students</span>
                    <span>📚 {course.resources} resources</span>
                  </div>
                </button>
              ))}
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
                      {courses.find(c => c.id === selectedCourse)?.instructor}
                    </p>
                  </div>
                  <button className="text-brand-teal hover:text-teal-600 font-medium text-sm">
                    View Course
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
                    <option value="PDF">PDF</option>
                    <option value="Video">Video</option>
                    <option value="Code">Code</option>
                    <option value="Audio">Audio</option>
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
                          <div className="mt-1">{getFileIcon(resource.type)}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-brand-dark group-hover:text-brand-teal transition-colors truncate">
                              {resource.name}
                            </h4>
                            <div className="flex gap-2 mt-1 text-xs text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded">{resource.type}</span>
                              <span>{resource.size}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          className={`p-1.5 rounded-lg transition-colors ${
                            resource.starred
                              ? 'bg-yellow-50 text-yellow-500'
                              : 'bg-gray-50 text-gray-400 hover:text-yellow-500'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">by {resource.uploadedBy}</p>
                      <div className="flex gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" /> {resource.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {resource.views}
                        </span>
                      </div>
                      <button className="w-full py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition-colors flex items-center justify-center gap-2">
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
                      <div>{getFileIcon(resource.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-brand-dark group-hover:text-brand-teal transition-colors truncate">
                            {resource.name}
                          </h4>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">{resource.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">by {resource.uploadedBy} • {resource.size}</p>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-500 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" /> {resource.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {resource.views}
                        </span>
                      </div>
                      <button className={`p-2 rounded-lg transition-colors ${
                        resource.starred
                          ? 'bg-yellow-50 text-yellow-500'
                          : 'bg-gray-50 text-gray-400 hover:text-yellow-500'
                      }`}>
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                      <button className="px-3 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-600 text-sm font-medium transition-colors flex items-center gap-1">
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
    </div>
  );
};

export default CourseResourcesPage;
