-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_courseId_fkey";

-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "courseName" TEXT,
ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
