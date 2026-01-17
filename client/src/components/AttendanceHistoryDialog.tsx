import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, ChevronLeft, ChevronRight, Loader2, Check, X } from "lucide-react";
import { useStudents, useDailyLogsRange } from "@/hooks/use-students";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, subMonths, addMonths, isAfter, startOfDay } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DailyLog } from "@shared/schema";

export function AttendanceHistoryDialog() {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: students, isLoading: isLoadingStudents } = useStudents();
  
  const monthStart = startOfMonth(currentMonth);
  // If current month is the actual current month, end at today. Otherwise end of month.
  const today = startOfDay(new Date());
  
  // Actually, requirement says "past dates(monthly) as columns. we can just show the currrent month dates always start from 1st to present date."
  // And "previous month button as option".
  // So for past months, it should be the whole month. For current month, up to today (or end of month, but today makes sense for "history").
  // But usually history grids show the whole month structure.
  // "show the currrent month dates always start from 1st to present date" implies dynamic end date for current month.
  
  let monthEnd = endOfMonth(currentMonth);
  if (isSameDay(monthStart, startOfMonth(today)) && isAfter(monthEnd, today)) {
     monthEnd = today;
  }

  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: logs, isLoading: isLoadingLogs } = useDailyLogsRange(monthStart, monthEnd);

  const handlePreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  
  const isCurrentMonth = isSameDay(startOfMonth(currentMonth), startOfMonth(today));

  // Structure data for fast lookup
  // Map<studentId, Set<dateString>>
  const attendanceMap = useMemo(() => {
     const map = new Map<string, Set<string>>();
     logs?.forEach(log => {
        if (!map.has(log.studentId)) {
           map.set(log.studentId, new Set());
        }
        map.get(log.studentId)?.add(format(new Date(log.date), 'yyyy-MM-dd'));
     });
     return map;
  }, [logs]);

  // Group students by class
  const studentsByClass = useMemo(() => {
    if (!students) return {};
    const grouped: Record<string, typeof students> = {};
    students.forEach(s => {
      if (!grouped[s.classId]) {
        grouped[s.classId] = [];
      }
      grouped[s.classId].push(s);
    });
    return grouped;
  }, [students]);

  const sortedClasses = Object.keys(studentsByClass).sort();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0" title="View History">
          <History className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b gap-4">
           <DialogTitle className="text-xl sm:text-2xl font-bold">Attendance History</DialogTitle>
           <div className="flex items-center gap-2 self-end sm:self-auto">
             <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
               <ChevronLeft className="w-4 h-4" />
             </Button>
             <span className="font-semibold w-24 sm:w-40 text-center text-sm sm:text-base">
               {format(currentMonth, "MMM yyyy")}
             </span>
             <Button 
               variant="outline" 
               size="icon" 
               onClick={handleNextMonth} 
               disabled={isCurrentMonth}
             >
               <ChevronRight className="w-4 h-4" />
             </Button>
           </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          {(isLoadingStudents || isLoadingLogs) ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
             <ScrollArea className="h-full w-full">
               <div className="min-w-max p-2 md:p-6">
                 <table className="w-full caption-bottom text-sm border-collapse">
                   <TableHeader>
                     <TableRow>
                       <TableHead className="w-[120px] md:w-[200px] sticky left-0 top-0 bg-white z-30 font-bold text-slate-900 shadow-[1px_0_0_0_#e2e8f0]">Student</TableHead>
                       {days.map(day => (
                         <TableHead key={day.toISOString()} className="text-center min-w-[3rem] p-1 font-medium text-slate-600">
                           <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] uppercase text-slate-400">{format(day, 'EEE')}</span>
                              <span className="text-sm font-bold text-slate-900">{format(day, 'd')}</span>
                           </div>
                         </TableHead>
                       ))}
                       <TableHead className="text-center font-bold text-slate-900 bg-slate-50">Total</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {sortedClasses.map(className => (
                        <>
                          <TableRow key={className} className="bg-slate-100 hover:bg-slate-100">
                            <TableCell colSpan={days.length + 2} className="font-bold text-slate-700 py-2 sticky left-0 top-[3.5rem] z-25 bg-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                              {className}
                            </TableCell>
                          </TableRow>
                          {studentsByClass[className].map(student => {
                             // Calculate stats
                             const presentDays = days.filter(d => 
                               attendanceMap.get(student.id)?.has(format(d, 'yyyy-MM-dd'))
                             ).length;
                             const totalDays = days.length;
                             const percentage = Math.round((presentDays / totalDays) * 100);

                             return (
                               <TableRow key={student.id} className="group hover:bg-slate-50">
                                 <TableCell className="font-medium sticky left-0 bg-white group-hover:bg-slate-50 z-20 shadow-[1px_0_0_0_#e2e8f0] max-w-[120px] md:max-w-[200px] truncate" title={student.name}>
                                   {student.name}
                                 </TableCell>
                                 {days.map(day => {
                                   const isPresent = attendanceMap.get(student.id)?.has(format(day, 'yyyy-MM-dd'));
                                   return (
                                     <TableCell key={day.toISOString()} className="p-0 text-center border-l border-slate-100">
                                       <div className="flex items-center justify-center h-full w-full py-2">
                                          {isPresent ? (
                                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                              <Check className="w-3.5 h-3.5" />
                                            </div>
                                          ) : (
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                          )}
                                       </div>
                                     </TableCell>
                                   );
                                 })}
                                 <TableCell className="text-center font-bold text-slate-700 bg-slate-50/50">
                                   {presentDays} <span className="text-xs text-slate-400 font-normal">/ {totalDays}</span>
                                 </TableCell>
                               </TableRow>
                             );
                          })}
                        </>
                     ))}
                   </TableBody>
                 </table>
               </div>
               <ScrollBar orientation="horizontal" />
             </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
