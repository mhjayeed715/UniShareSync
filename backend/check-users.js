require('dotenv').config();
const prisma = require('./config/prisma');

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true }
  });
  console.log('Users in database:');
  console.log(JSON.stringify(users, null, 2));
  await prisma.$disconnect();
}

checkUsers();
