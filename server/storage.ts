
import { students, dailyLogs, type Student, type InsertStudent, type DailyLog, type InsertDailyLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getStudents(): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  getDailyLogs(studentId: number): Promise<DailyLog[]>;
  createDailyLog(log: InsertDailyLog): Promise<DailyLog>;
}

export class DatabaseStorage implements IStorage {
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(students.name);
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async updateStudent(id: number, update: Partial<InsertStudent>): Promise<Student> {
    const [student] = await db.update(students).set(update).where(eq(students.id, id)).returning();
    return student;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getDailyLogs(studentId: number): Promise<DailyLog[]> {
    return await db.select().from(dailyLogs).where(eq(dailyLogs.studentId, studentId)).orderBy(desc(dailyLogs.date));
  }

  async createDailyLog(insertLog: InsertDailyLog): Promise<DailyLog> {
    const [log] = await db.insert(dailyLogs).values(insertLog).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
