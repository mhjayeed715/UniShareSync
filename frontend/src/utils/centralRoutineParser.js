// Extract faculty routines from central routine CSV
export const extractFacultyRoutinesFromCentral = (csvText) => {
  const lines = csvText.trim().split('\n').map(l => l.replace(/\r/g, ''));
  const facultyRoutines = {};
  
  let currentDay = '';
  let timeSlots = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());
    
    // Check if this is a day header
    if (values[1] && ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].includes(values[1])) {
      currentDay = values[1];
      i++; // Skip to time slot row
      const timeRow = lines[i].split(',').map(v => v.trim());
      timeSlots = [];
      for (let j = 1; j < timeRow.length; j += 3) {
        if (timeRow[j]) timeSlots.push(timeRow[j]);
      }
      i++; // Skip header row
      continue;
    }
    
    // Skip empty rows or non-section rows
    if (!values[0] || !values[0].match(/^\d+[A-Z]$/)) continue;
    
    const section = values[0];
    
    // Process each time slot
    for (let slotIdx = 0; slotIdx < timeSlots.length; slotIdx++) {
      const baseIdx = 1 + (slotIdx * 3);
      const course = values[baseIdx];
      const faculty = values[baseIdx + 1];
      const room = values[baseIdx + 2];
      
      if (faculty && course) {
        if (!facultyRoutines[faculty]) {
          facultyRoutines[faculty] = [];
        }
        
        facultyRoutines[faculty].push({
          day: currentDay,
          time: timeSlots[slotIdx],
          course: course,
          section: section,
          room: room || 'N/A'
        });
      }
    }
  }
  
  return facultyRoutines;
};

// Get all faculty initials from central routine
export const getAllFacultyFromCentral = (csvText) => {
  const routines = extractFacultyRoutinesFromCentral(csvText);
  return Object.keys(routines).sort();
};

// Get routine for specific faculty from central routine
export const getFacultyRoutineFromCentral = (csvText, facultyInitial) => {
  const allRoutines = extractFacultyRoutinesFromCentral(csvText);
  return allRoutines[facultyInitial] || [];
};
