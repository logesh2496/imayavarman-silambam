import { useState, useMemo } from "react";
import { useStudents, useDailyLogsByDate, useCreateLog, useDeleteLog, useBulkCreateLogs } from "@/hooks/use-students";
import { Layout } from "@/components/Layout";
import { StudentDialog } from "@/components/StudentDialog";
import { AttendanceHistoryDialog } from "@/components/AttendanceHistoryDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, User, CheckCircle2, AlertCircle, LayoutGrid, List, Check, X, CalendarDays, Users } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("attendance");

  // Keep date stable for the query
  const today = useMemo(() => new Date(), []);
  
  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Dashboard</h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8 w-full md:w-auto h-12 p-1 bg-slate-100 rounded-xl justify-start">
          <TabsTrigger value="attendance" className="flex-1 md:flex-none h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <CalendarDays className="w-4 h-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="students" className="flex-1 md:flex-none h-10 px-6 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="w-4 h-4 mr-2" />
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-0 space-y-6">
          <AttendanceView date={today} />
        </TabsContent>

        <TabsContent value="students" className="mt-0">
          <StudentsView />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function AttendanceView({ date }: { date: Date }) {
  const { data: students, isLoading: isLoadingStudents } = useStudents();
  const { data: logs, isLoading: isLoadingLogs } = useDailyLogsByDate(date);
  const createLog = useCreateLog();
  const bulkCreateLogs = useBulkCreateLogs();
  const deleteLog = useDeleteLog();

  const [filterClass, setFilterClass] = useState<string | null>(null);

  const attendanceMap = useMemo(() => {
    const map: Record<string, string> = {}; // studentId -> logId
    logs?.forEach(l => {
      map[l.studentId] = l.id;
    });
    return map;
  }, [logs]);

  const classes = ["Class 1", "Class 2", "Class 3", "Class 4"];
  
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!filterClass) return students;
    return students.filter(s => s.classId === filterClass);
  }, [students, filterClass]);

  const presentCount = filteredStudents.filter(s => !!attendanceMap[s.id]).length;
  const totalCount = filteredStudents.length;

  const handleToggle = (studentId: string) => {
    const logId = attendanceMap[studentId];
    if (logId) {
      deleteLog.mutate(logId);
    } else {
      createLog.mutate({ studentId, attended: true, date: date });
    }
  };

  const markAllPresent = () => {
    const absent = filteredStudents.filter(s => !attendanceMap[s.id]);
    
    if (absent.length === 0) return;

    const newLogs = absent.map(s => ({
      studentId: s.id,
      attended: true,
      date: date
    }));

    bulkCreateLogs.mutate(newLogs);
  };

  if (isLoadingStudents || isLoadingLogs) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2 bg-slate-100 py-1 rounded-lg">
            <Button 
              variant={filterClass === null ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setFilterClass(null)}
              className={filterClass === null ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}
            >
              All
            </Button>
            {classes.map(c => (
              <Button
                key={c}
                variant={filterClass === c ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilterClass(c)}
                className={filterClass === c ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}
              >
                {c}
              </Button>
            ))}
            <div className="w-px h-6 bg-slate-200 my-auto mx-1" />
            <AttendanceHistoryDialog />
          </div>

        <div className="flex items-center gap-4 w-full">
           <div className="text-sm font-medium text-slate-500">
            <span className="text-slate-900 font-bold">Today</span>
            <span className="mx-2 text-slate-300">•</span>
            {presentCount} / {totalCount} Present
          </div>
           
           <Button onClick={markAllPresent} disabled={presentCount === totalCount} className="bg-green-600 hover:bg-green-700 text-white ml-auto">
             <CheckCircle2 className="w-4 h-4 mr-2" />
             Mark All Present
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => {
          const isPresent = !!attendanceMap[student.id];
          return (
            <motion.div layout key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div 
                className={`
                  relative flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer select-none
                  ${isPresent 
                    ? 'bg-green-50 border-green-500 shadow-sm' 
                    : 'bg-white border-slate-100 hover:border-slate-300'
                  }
                `}
                onClick={() => handleToggle(student.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    ${isPresent ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-500'}
                  `}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className={`font-bold ${isPresent ? 'text-green-900' : 'text-slate-900'}`}>{student.name}</h3>
                    <p className="text-xs text-slate-500">{student.classId}</p>
                  </div>
                </div>

                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${isPresent ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-300'}
                `}>
                  <Check className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StudentsView() {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [view, setView] = useState<"card" | "list">("card");
  const { data: allStudents, isLoading, error } = useStudents(search);

  const classes = ["Class 1", "Class 2", "Class 3", "Class 4"];
  
  const students = selectedClass 
    ? allStudents?.filter(s => s.classId === selectedClass)
    : allStudents;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6"> 
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 text-lg" 
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
             <Tabs value={view} onValueChange={(v) => setView(v as "card" | "list")} className="w-auto">
              <TabsList className="h-12 bg-slate-100/50 p-1 rounded-xl">
                <TabsTrigger value="card" className="rounded-lg h-10 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="list" className="rounded-lg h-10 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <List className="w-4 h-4 mr-2" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <StudentDialog
              trigger={
                <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Student
                </Button>
              }
            />
          </div>
        </div>
      </div>

       <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <Button 
            variant={selectedClass === null ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setSelectedClass(null)}
            className={selectedClass === null ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}
          >
            All
          </Button>
          {classes.map(c => (
            <Button
              key={c}
              variant={selectedClass === c ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedClass(c)}
              className={selectedClass === c ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-900"}
            >
              {c}
            </Button>
          ))}
        </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
          <p>Failed to load students. Please try again.</p>
        </div>
      ) : students?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">No students found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or add a new student.</p>
        </div>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students?.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/students/${student.id}`} className="block group">
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden group-hover:-translate-y-1">
                  
                  {/* Status Indicator Stripe */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    student.status === 'Active' ? 'bg-green-500' : 
                    student.status === 'Probation' ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />
                  
                  <div className="pl-3">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wider text-xs">
                          {student.classId} • {student.status}
                        </p>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        student.feesPaid 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {student.feesPaid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PAID
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" />
                            UNPAID
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1">Current Lesson</p>
                      <p className="text-sm font-medium text-slate-700 truncate">{student.currentLesson}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-900">Name</TableHead>
                <TableHead className="font-bold text-slate-900">Class</TableHead>
                <TableHead className="font-bold text-slate-900">Current Lesson</TableHead>
                <TableHead className="font-bold text-slate-900">Fees</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students?.map((student) => (
                <TableRow key={student.id} className="group cursor-pointer hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    <Link href={`/students/${student.id}`} className="block text-slate-900 hover:text-primary group-hover:font-semibold transition-all">
                      {student.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-600">{student.classId}</TableCell>
                  <TableCell className="text-slate-600 text-sm max-w-[200px] truncate">{student.currentLesson}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      student.feesPaid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {student.feesPaid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {student.feesPaid ? 'PAID' : 'UNPAID'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
