require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test connection on startup
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Failed to connect to database:', err.message);
  });

module.exports = prisma;
