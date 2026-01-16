import { useRoute } from "wouter";
import { useStudent, useStudentLogs, useCreateLog, useDeleteStudent } from "@/hooks/use-students";
import { Layout } from "@/components/Layout";
import { StudentDialog } from "@/components/StudentDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  History,
  Trash2,
  Edit,
  Loader2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertDailyLogSchema } from "@shared/schema";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function StudentDetail() {
  const [, params] = useRoute("/students/:id");
  const id = Number(params?.id);
  const [, setLocation] = useLocation();

  const { data: student, isLoading: loadingStudent } = useStudent(id);
  const { data: logs, isLoading: loadingLogs } = useStudentLogs(id);
  const deleteMutation = useDeleteStudent();
  const createLogMutation = useCreateLog();

  const [editOpen, setEditOpen] = useState(false);

  // Log Form
  const logForm = useForm({
    resolver: zodResolver(insertDailyLogSchema.omit({ studentId: true })),
    defaultValues: {
      lessonSummary: "",
      attended: true,
      date: new Date(), // This will be coerced to date by the schema if set up, but backend expects timestamp
    }
  });

  const onSubmitLog = async (data: any) => {
    // Ensure date is properly formatted if needed, or pass Date object if schema handles it
    await createLogMutation.mutateAsync({
      studentId: id,
      lessonSummary: data.lessonSummary,
      attended: data.attended,
      // Pass date if your schema requires it, otherwise backend defaults to now()
    });
    logForm.reset({ lessonSummary: "", attended: true });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
    setLocation("/");
  };

  if (loadingStudent) {
    return (
      <Layout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Student not found</h2>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">Return to Dashboard</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-xl shadow-slate-200/50 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-4xl font-display font-bold text-slate-900">{student.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                student.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {student.status}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Current Lesson</p>
                  <p className="font-semibold truncate">{student.currentLesson}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <div className={student.feesPaid ? "text-green-500" : "text-red-500"}>
                    {student.feesPaid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Fee Status</p>
                  <p className={`font-semibold ${student.feesPaid ? "text-green-600" : "text-red-600"}`}>
                    {student.feesPaid ? "Paid for Month" : "Payment Pending"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => setEditOpen(true)} className="h-11 px-5 border-slate-200 hover:bg-slate-50 hover:text-primary">
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="h-11 px-5 text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {student.name} and all their lesson history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <StudentDialog 
        student={student} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Log Form */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              Log Today's Lesson
            </h3>

            <form onSubmit={logForm.handleSubmit(onSubmitLog)} className="space-y-4">
              <div className="flex items-center space-x-2 border p-3 rounded-xl bg-slate-50 border-slate-100">
                <Checkbox 
                  id="attended" 
                  checked={logForm.watch("attended")}
                  onCheckedChange={(checked) => logForm.setValue("attended", checked as boolean)}
                />
                <Label htmlFor="attended" className="font-medium cursor-pointer">Student Attended</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Lesson Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="What was covered today? Any homework assigned?"
                  className="min-h-[120px] rounded-xl border-slate-200 focus:border-primary focus:ring-primary/10 resize-none"
                  {...logForm.register("lessonSummary")}
                />
                {logForm.formState.errors.lessonSummary && (
                  <p className="text-xs text-red-500">{logForm.formState.errors.lessonSummary.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={createLogMutation.isPending}
                className="w-full h-11 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                {createLogMutation.isPending ? "Saving..." : "Save Log Entry"}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Col: History */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-5 h-5 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900">Lesson History</h3>
          </div>

          <div className="space-y-4">
            {loadingLogs ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)
            ) : logs?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <p>No lesson logs recorded yet.</p>
              </div>
            ) : (
              logs?.sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()).map((log) => (
                <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4 transition-all hover:shadow-md">
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {log.date ? format(new Date(log.date), "MMM") : "-"}
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {log.date ? format(new Date(log.date), "d") : "-"}
                    </div>
                  </div>
                  
                  <div className="flex-1 border-l border-slate-100 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        log.attended ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                      }`}>
                        {log.attended ? "ATTENDED" : "MISSED"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {log.date ? format(new Date(log.date), "yyyy") : ""}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-2 leading-relaxed text-sm">
                      {log.lessonSummary || "No summary recorded."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
