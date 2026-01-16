import { useState } from "react";
import { useStudents } from "@/hooks/use-students";
import { StudentCard } from "@/components/StudentCard";
import { CreateStudentDialog } from "@/components/CreateStudentDialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Users } from "lucide-react";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: students, isLoading, error } = useStudents(search);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Decorative background element */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2 tracking-tight">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground flex items-center">
              Manage your students and track their progress
            </p>
          </div>
          <CreateStudentDialog />
        </div>

        {/* Filters & Search */}
        <div className="relative mb-10 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 rounded-xl border-border shadow-sm bg-white/80 backdrop-blur-sm focus:bg-white transition-all text-base"
          />
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p>Loading students...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20">
            <p className="text-destructive font-semibold">Failed to load students</p>
          </div>
        ) : students?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/60 rounded-3xl bg-white/50">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold font-display text-foreground">No students found</h3>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
              Get started by adding your first student to the system.
            </p>
            <div className="mt-6">
              <CreateStudentDialog />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students?.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
