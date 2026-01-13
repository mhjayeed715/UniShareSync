require('dotenv').config();
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const adminEmail = 'mehrabjayeed715@gmail.com';
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('Role:', existingAdmin.role);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('adminmejayeed', 12);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Jayed',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('ID:', admin.id);
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('\nYou can now log in with:');
    console.log('Email: mehrabjayeed715@gmail.com');
    console.log('Password: adminmejayeed');
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
