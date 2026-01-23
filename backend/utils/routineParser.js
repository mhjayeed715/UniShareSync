const fs = require('fs');
const path = require('path');

// Extract course codes and semester info from central routine CSV
const extractCourseData = (csvText) => {
  const lines = csvText.trim().split('\n').map(l => l.replace(/\r/g, ''));
  const courses = new Set();
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());
    
    // Skip empty rows or header rows
    if (!values[0] || !values[0].match(/^\d+[A-Z]$/)) continue;
    
    // Process each course in the row
    for (let j = 1; j < values.length; j += 3) {
      const course = values[j];
      if (course && course.match(/^[A-Z]{3}\s*\d{4}/)) {
        courses.add(course);
      }
    }
  }
  
  return Array.from(courses);
};

// Determine semester from course code
const getSemesterFromCourse = (courseCode) => {
  const match = courseCode.match(/(\d{4})/);
  if (!match) return 'Other';
  
  const courseNumber = parseInt(match[1]);
  const year = Math.floor((courseNumber - 1000) / 1000) + 1;
  const semester = Math.floor(((courseNumber % 1000) - 100) / 100) + 1;
  
  if (year >= 1 && year <= 4 && semester >= 1 && semester <= 2) {
    return `${year}-${semester}`;
  }
  
  return 'Other';
};

// Get all courses organized by semester
const getCoursesBySemester = () => {
  try {
    const csvPath = path.join(__dirname, '../../frontend/src/assets/8A - Central Routine.csv');
    const csvText = fs.readFileSync(csvPath, 'utf8');
    const courses = extractCourseData(csvText);
    
    const semesterGroups = {};
    
    courses.forEach(course => {
      const semester = getSemesterFromCourse(course);
      if (!semesterGroups[semester]) {
        semesterGroups[semester] = [];
      }
      semesterGroups[semester].push(course);
    });
    
    return semesterGroups;
  } catch (error) {
    console.error('Error reading routine CSV:', error);
    return {};
  }
};

// Check if a course name matches any course code
const matchCourseCode = (courseName, courseCode) => {
  if (!courseName || !courseCode) return false;
  
  // Extract course code from course name (e.g., "CSE 3297 - Software Engineering" -> "CSE 3297")
  const nameMatch = courseName.match(/([A-Z]{3}\s*\d{4})/);
  if (nameMatch) {
    const extractedCode = nameMatch[1].replace(/\s+/g, ' ');
    const normalizedCourseCode = courseCode.replace(/\s+/g, ' ');
    return extractedCode === normalizedCourseCode;
  }
  
  return false;
};

module.exports = {
  extractCourseData,
  getSemesterFromCourse,
  getCoursesBySemester,
  matchCourseCode
};