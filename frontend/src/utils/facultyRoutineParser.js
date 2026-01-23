// Parse faculty routine CSV
export const parseFacultyRoutine = (csvText) => {
  const lines = csvText.trim().split('\n').map(l => l.replace(/\r/g, ''));
  const facultyRoutines = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(v => v.replace(/"/g, '').trim());

    const facultyInitial = cleanValues[0]?.replace(/=IFERROR\(__xludf\.DUMMYFUNCTION\(.+?\),/g, '').replace(/\)/g, '').trim();
    const day = cleanValues[1];
    const time = cleanValues[2];
    let course = cleanValues[3]?.replace(/=IFERROR\(__xludf\.DUMMYFUNCTION\(.+?\),/g, '').replace(/\)/g, '').trim();
    const section = cleanValues[4];
    const room = cleanValues[6]?.replace(/\)/g, '').trim();

    if (!facultyInitial || !day || !time) continue;

    if (!facultyRoutines[facultyInitial]) {
      facultyRoutines[facultyInitial] = [];
    }

    facultyRoutines[facultyInitial].push({
      day,
      time,
      course: course || 'N/A',
      section: section || 'N/A',
      room: room || 'N/A'
    });
  }

  return facultyRoutines;
};

// Get routine for specific faculty
export const getFacultyRoutine = (csvText, facultyInitial) => {
  const allRoutines = parseFacultyRoutine(csvText);
  return allRoutines[facultyInitial] || [];
};

// Get all faculty initials
export const getAllFacultyInitials = (csvText) => {
  const allRoutines = parseFacultyRoutine(csvText);
  return Object.keys(allRoutines).sort();
};
