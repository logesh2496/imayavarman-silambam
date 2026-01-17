
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const students = await storage.getStudents();
  if (students.length === 0) {
    await storage.createStudent({
      name: "Alice Johnson",
      currentLesson: "Chapter 3: Loops",
      status: "Active",
      feesPaid: true,
    });
    await storage.createStudent({
      name: "Bob Smith",
      currentLesson: "Chapter 1: Basics",
      status: "Probation",
      feesPaid: false,
    });
    await storage.createStudent({
      name: "Charlie Brown",
      currentLesson: "Chapter 5: Arrays",
      status: "Active",
      feesPaid: true,
    });
    console.log("Database seeded!");
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await seedDatabase();
  
  app.get(api.students.list.path, async (req, res) => {
    const students = await storage.getStudents();
    const search = req.query.search as string;
    if (search) {
      const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      return res.json(filtered);
    }
    res.json(students);
  });

  app.post(api.students.create.path, async (req, res) => {
    try {
      const input = api.students.create.input.parse(req.body);
      const student = await storage.createStudent(input);
      res.status(201).json(student);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.students.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const student = await storage.getStudent(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  });

  app.patch(api.students.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const input = api.students.update.input.parse(req.body);
      const student = await storage.updateStudent(id, input);
      res.json(student);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.delete(api.students.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    await storage.deleteStudent(id);
    res.status(204).send();
  });

  app.get(api.students.getLogs.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    
    const logs = await storage.getDailyLogs(id);
    res.json(logs);
  });

  app.post(api.students.createLog.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const input = api.students.createLog.input.parse(req.body);
      const log = await storage.createDailyLog({ ...input, studentId: id });
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/students/:id/achievements", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const achievements = await storage.getAchievements(id);
    res.json(achievements);
  });

  app.post("/api/students/:id/achievements", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    try {
      const input = req.body;
      const achievement = await storage.createAchievement({ ...input, studentId: id });
      res.status(201).json(achievement);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
