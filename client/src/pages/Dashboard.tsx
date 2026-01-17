import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { Layout } from "@/components/Layout";
import { StudentDialog } from "@/components/StudentDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, User, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const { data: allStudents, isLoading, error } = useStudents(search);

  const classes = ["Class 1", "Class 2", "Class 3", "Class 4"];
  
  const students = selectedClass 
    ? allStudents?.filter(s => s.classId === selectedClass)
    : allStudents;

  return (
    <Layout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Imaiyavarman Silambam</h1>
          <p className="text-slate-500 mt-2 text-base md:text-lg">Student management and attendance tracking.</p>
        </div>
        
        <StudentDialog
          trigger={
            <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Add Student
            </Button>
          }
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-8 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input 
            className="pl-12 h-14 rounded-2xl border-slate-200 bg-white shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 text-lg" 
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedClass === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedClass(null)}
            className="rounded-full px-4"
          >
            All Classes
          </Button>
          {classes.map((c) => (
            <Button
              key={c}
              variant={selectedClass === c ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedClass(c)}
              className="rounded-full px-4"
            >
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Area */}
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
      ) : (
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
                          {student.status}
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
      )}
    </Layout>
  );
}
