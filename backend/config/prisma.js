require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Handle connection errors gracefully
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => {
    console.error('Failed to connect to database:', err.message);
  });

// Reconnect on connection loss
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
