// Parse CSV text to array of objects
export const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n').map(l => l.replace(/\r/g, ''));
  const result = [];
  let currentDay = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());
    
    // Check if this is a day header
    if (values[1] && ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(values[1])) {
      currentDay = values[1];
      i += 2; // Skip time slot row and header row
      continue;
    }
    
    // Skip empty or invalid rows
    if (!values[0] || !currentDay) continue;
    
    const section = values[0];
    if (!section.match(/^\d+[A-Z]$/)) continue;
    
    result.push({
      Section: section,
      Day: currentDay,
      ...values.reduce((obj, val, idx) => {
        obj[`col${idx}`] = val;
        return obj;
      }, {})
    });
  }
  
  return result;
};

// Create course code to name mapping from course offer CSV
export const createCourseMapping = (courseOfferData) => {
  const mapping = {};
  courseOfferData.forEach(row => {
    if (row['Course Code'] && row['Course Title']) {
      mapping[row['Course Code']] = row['Course Title'];
    }
  });
  return mapping;
};

// Extract semester and group from section (e.g., "1A" -> {semester: 1, group: "A"})
const parseSectionCode = (section) => {
  const match = section.match(/^(\d+)([A-Z])$/);
  if (match) {
    return { semester: parseInt(match[1]), group: match[2] };
  }
  return null;
};

// Transform routine data to semester-wise structure
export const transformRoutineData = (routineData, courseMapping) => {
  const semesterData = {};
  const timeSlots = [
    '8.30 AM - 9.50 AM',
    '10.00 AM - 11.20 AM',
    '11.30 AM - 12.50 PM',
    '1.00 PM - 2.30 PM',
    '2.30 PM - 3.50 PM',
    '4.00 PM - 5.20 PM'
  ];
  
  routineData.forEach(row => {
    const section = row.Section;
    const day = row.Day;
    if (!section || !day) return;
    
    const parsed = parseSectionCode(section);
    if (!parsed) return;
    
    const { semester, group } = parsed;
    const semesterKey = `Semester ${semester}`;
    
    if (!semesterData[semesterKey]) {
      semesterData[semesterKey] = {};
    }
    
    if (!semesterData[semesterKey][group]) {
      semesterData[semesterKey][group] = [];
    }
    
    // Process each time slot (columns: 1=Course, 2=Faculty, 3=Room, 4=Course, 5=Faculty, 6=Room...)
    for (let i = 0; i < 6; i++) {
      const courseIdx = 1 + (i * 3);
      const facultyIdx = 2 + (i * 3);
      const roomIdx = 3 + (i * 3);
      
      const courseCode = row[`col${courseIdx}`];
      if (courseCode && courseCode !== '') {
        const courseName = courseMapping[courseCode] || courseCode;
        const faculty = row[`col${facultyIdx}`] || '';
        const room = row[`col${roomIdx}`] || '';
        
        semesterData[semesterKey][group].push({
          day,
          timeSlot: timeSlots[i],
          courseCode,
          courseName,
          faculty,
          room,
          section: `${semester}${group}`
        });
      }
    }
  });
  
  return semesterData;
};

// Main function to process routine
export const processRoutine = (routineCSV, courseOfferCSV) => {
  const routineData = parseCSV(routineCSV);
  const courseOfferData = parseCSV(courseOfferCSV);
  const courseMapping = createCourseMapping(courseOfferData);
  const transformedData = transformRoutineData(routineData, courseMapping);
  
  return transformedData;
};
