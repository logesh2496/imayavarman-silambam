import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/student.service";
import { dailyLogService } from "@/services/dailyLog.service";
import { achievementService } from "@/services/achievement.service";
import { type InsertStudent, type InsertDailyLog, type InsertAchievement, type DailyLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useStudents(search?: string) {
  return useQuery({
    queryKey: ["students", search],
    queryFn: async () => {
      const students = await studentService.getStudents();
      if (search) {
        return students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      }
      return students;
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: async () => {
      if (!id) return null;
      return await studentService.getStudent(id);
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertStudent) => {
      return await studentService.createStudent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "Success", description: "Student added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InsertStudent>) => {
      await studentService.updateStudent(id, updates);
      return { id, ...updates };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", data.id] });
      toast({ title: "Updated", description: "Student details updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await studentService.deleteStudent(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast({ title: "Deleted", description: "Student removed from system" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });
}

// === ACHIEVEMENTS ===

export function useStudentAchievements(studentId: string) {
  return useQuery({
    queryKey: ["achievements", studentId],
    queryFn: async () => {
      return await achievementService.getAchievements(studentId);
    },
    enabled: !!studentId,
  });
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ studentId, ...data }: { studentId: string } & InsertAchievement) => {
      return await achievementService.createAchievement({ studentId, ...data });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["achievements", variables.studentId] });
      toast({ title: "Achievement Added", description: "New achievement recorded" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });
}

export function useStudentLogs(studentId: string) {
  return useQuery({
    queryKey: ["dailyLogs", studentId],
    queryFn: async () => {
      return await dailyLogService.getDailyLogs(studentId);
    },
    enabled: !!studentId,
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ studentId, ...data }: { studentId: string } & Omit<InsertDailyLog, "studentId">) => {
      return await dailyLogService.createDailyLog({ ...data, studentId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dailyLogs", variables.studentId] });
      toast({ title: "Log Added", description: "Daily progress recorded" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });
}

export function useDailyLogsByDate(date: Date) {
  return useQuery({
    queryKey: ["dailyLogs", "date", date.toISOString().split('T')[0]],
    queryFn: async () => {
      return await dailyLogService.getDailyLogsByDate(date);
    },
    enabled: !!date,
  });
}

export function useDailyLogsRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: ["dailyLogs", "range", startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
    queryFn: async () => {
      return await dailyLogService.getDailyLogsRange(startDate, endDate);
    },
    enabled: !!startDate && !!endDate,
  });
}

// ... existing code ...

export function useDeleteLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await dailyLogService.deleteDailyLog(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyLogs"] });
      // toast({ title: "Deleted", description: "Log removed" });
    },
    onError: (error) => {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    },
  });
}

export function useBulkCreateLogs() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (logs: InsertDailyLog[]) => {
      return await Promise.all(logs.map(log => dailyLogService.createDailyLog(log)));
    },
    onMutate: async (newLogs) => {
      // We assume all logs are for the same date (which is true for markAllPresent)
      if (newLogs.length === 0) return;
      
      const date = newLogs[0].date instanceof Date ? newLogs[0].date : new Date(newLogs[0].date);
      const dateKey = date.toISOString().split('T')[0];
      const queryKey = ["dailyLogs", "date", dateKey];

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousLogs = queryClient.getQueryData<DailyLog[]>(queryKey);

      // Optimistically update to the new value
      if (previousLogs) {
        const optimisticLogs: DailyLog[] = newLogs.map((log, index) => ({
          ...log,
          // Generate a temp ID that won't collide
          id: `temp-id-${Date.now()}-${index}`,
          date: log.date instanceof Date ? log.date : new Date(log.date)
        }));

        queryClient.setQueryData<DailyLog[]>(queryKey, (old) => {
          return [...(old || []), ...optimisticLogs];
        });
      }

      return { previousLogs, queryKey };
    },
    onError: (err, newLogs, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(context.queryKey, context.previousLogs);
      }
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyLogs"] });
    },
    onSuccess: (data) => {
      toast({ title: "Attendance Updated", description: `Marked ${data.length} students present` });
    },
  });
}
