require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create departments first
  const departments = [
    { 
      name: 'Computer Science & Engineering', 
      code: 'CSE', 
      description: 'Engineering & Technology - Computer Science & Engineering' 
    },
    { 
      name: 'Fashion Design', 
      code: 'FD', 
      description: 'Design & Technology - Fashion Design' 
    },
    { 
      name: 'Apparel Manufacturing', 
      code: 'AM', 
      description: 'Design & Technology - Apparel Manufacturing' 
    },
    { 
      name: 'Interior Architecture', 
      code: 'IA', 
      description: 'Design & Technology - Interior Architecture' 
    },
    { 
      name: 'Business Administration', 
      code: 'BBA', 
      description: 'Business - BBA, MBA in Accounting, Finance, HR, Marketing' 
    },
    { 
      name: 'English', 
      code: 'ENG', 
      description: 'Humanities & Social Sciences - English' 
    },
    { 
      name: 'Graphic Design & Multimedia', 
      code: 'GDM', 
      description: 'Fine & Performing Arts - Graphic Design & Multimedia' 
    },
    { 
      name: 'Fine Arts', 
      code: 'BFA', 
      description: 'Fine & Performing Arts - BFA, MFA' 
    },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept
    });
    console.log('✅ Department created:', dept.name);
  }

  const cseDept = await prisma.department.findUnique({ where: { code: 'CSE' } });

  // Create test student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: { department: 'Computer Science & Engineering' },
    create: {
      name: 'Test Student',
      email: 'student@test.com',
      password: studentPassword,
      role: 'STUDENT',
      department: 'Computer Science & Engineering'
    }
  });
  console.log('✅ Student created:', student.email);

  // Create test faculty
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@test.com' },
    update: { department: 'Computer Science & Engineering' },
    create: {
      name: 'Test Faculty',
      email: 'faculty@test.com',
      password: facultyPassword,
      role: 'FACULTY',
      department: 'Computer Science & Engineering',
      designation: 'Professor'
    }
  });
  console.log('Faculty created:', faculty.email);

  // Create sample courses
  const courses = [
    {
      courseCode: 'CSIT1101',
      courseName: 'Structured Programming',
      departmentId: cseDept.id,
      semester: 1,
      creditHours: 3.0,
      courseType: 'theory'
    },
    {
      courseCode: 'CSIT1201',
      courseName: 'Data Structure',
      departmentId: cseDept.id,
      semester: 2,
      creditHours: 3.0,
      courseType: 'theory'
    },
    {
      courseCode: 'CSIT2101',
      courseName: 'Design and Analysis of Algorithms',
      departmentId: cseDept.id,
      semester: 3,
      creditHours: 3.0,
      courseType: 'theory'
    }
  ];

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { courseCode: courseData.courseCode },
      update: {},
      create: courseData
    });
    console.log('✅ Course created:', course.courseName);
  }

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\nTest Credentials:');
  console.log('Admin: mehrabjayeed715@gmail.com / adminmejayeed');
  console.log('Student: student@test.com / student123');
  console.log('Faculty: faculty@test.com / faculty123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
