const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addRememberMeField() {
  try {
    // Add the column if it doesn't exist
    await prisma.$executeRaw`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "lastLoginSkipOtp" TIMESTAMP;
    `;
    
    console.log('Successfully added lastLoginSkipOtp field to users table');
  } catch (error) {
    console.error('Error adding field:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addRememberMeField();