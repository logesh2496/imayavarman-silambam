import { format } from "date-fns";
import { type DailyLog } from "@shared/schema";
import { CheckCircle, XCircle } from "lucide-react";

interface DailyLogListProps {
  logs: DailyLog[];
}

export function DailyLogList({ logs }: DailyLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
        <p className="text-muted-foreground font-medium">No progress logged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div 
          key={log.id} 
          className="bg-white rounded-xl border border-border/50 p-4 flex items-start gap-4 transition-all hover:shadow-md"
        >
          <div className="mt-1">
            {log.attended ? (
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <XCircle className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex justify-between items-baseline">
              <h4 className="font-semibold text-foreground">
                {log.attended ? "Attended Lesson" : "Missed Lesson"}
              </h4>
              <span className="text-xs font-medium text-muted-foreground">
                {format(new Date(log.date || new Date()), "PPP")}
              </span>
            </div>
            {log.lessonSummary && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {log.lessonSummary}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
