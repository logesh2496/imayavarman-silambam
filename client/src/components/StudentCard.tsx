import { Link } from "wouter";
import { type Student } from "@shared/schema";
import { CheckCircle2, AlertCircle, GraduationCap, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentCardProps {
  student: Student;
}

const statusColors = {
  Active: "bg-green-100 text-green-700 border-green-200",
  Probation: "bg-orange-100 text-orange-700 border-orange-200",
  Graduated: "bg-blue-100 text-blue-700 border-blue-200",
  Paused: "bg-gray-100 text-gray-700 border-gray-200",
};

export function StudentCard({ student }: StudentCardProps) {
  const statusColor = statusColors[student.status as keyof typeof statusColors] || statusColors.Active;

  return (
    <Link href={`/students/${student.id}`} className="group block">
      <div className="
        bg-card h-full rounded-2xl p-6 border border-border/50
        shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-1
        transition-all duration-300 ease-out flex flex-col justify-between
      ">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className={cn("px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider", statusColor)}>
              {student.status}
            </div>
            {student.feesPaid ? (
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Fees Paid
              </span>
            ) : (
              <span className="flex items-center text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100">
                <AlertCircle className="w-3 h-3 mr-1" />
                Fees Due
              </span>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
              {student.name}
            </h3>
            <div className="flex items-center mt-2 text-muted-foreground text-sm overflow-hidden">
              <BookOpen className="w-4 h-4 mr-1.5 opacity-70 flex-shrink-0" />
              <span className="truncate">{student.currentLesson}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/50 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
          View Profile <ChevronRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Link>
  );
}
