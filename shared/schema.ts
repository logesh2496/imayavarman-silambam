
import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  currentLesson: text("current_lesson").notNull(),
  status: text("status").notNull(), // e.g. 'Active', 'Probation', 'Graduated'
  feesPaid: boolean("fees_paid").default(false),
  classId: text("class_id").notNull().default("Class 1"),
});

export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  date: timestamp("date").defaultNow(),
  attended: boolean("attended").default(true),
  lessonSummary: text("lesson_summary"),
});

// Schemas
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({ id: true });

// Types
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
