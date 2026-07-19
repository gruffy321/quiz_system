import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    const student = await prisma.student.create({ data: {} });
    console.log("Student created:", student);
    
    const session = await prisma.session.create({
      data: {
        studentId: student.id,
        moduleId: "test",
        domain: "test",
      }
    });
    console.log("Session created:", session);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
