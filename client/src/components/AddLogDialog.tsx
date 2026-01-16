import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDailyLogSchema, type InsertDailyLog } from "@shared/schema";
import { useCreateLog } from "@/hooks/use-students";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2 } from "lucide-react";

interface AddLogDialogProps {
  studentId: number;
}

export function AddLogDialog({ studentId }: AddLogDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateLog();
  
  const form = useForm<Omit<InsertDailyLog, "studentId">>({
    resolver: zodResolver(insertDailyLogSchema.omit({ studentId: true })),
    defaultValues: {
      attended: true,
      lessonSummary: "",
    },
  });

  const onSubmit = (data: Omit<InsertDailyLog, "studentId">) => {
    mutate({ studentId, ...data }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
          <Plus className="w-4 h-4 mr-2" />
          Log Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold">Log Daily Progress</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-2">
          
          <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-xl border border-border/50">
            <Checkbox 
              id="attended" 
              checked={form.watch("attended") || false}
              onCheckedChange={(checked) => form.setValue("attended", checked as boolean)}
              className="w-5 h-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="attended"
                className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Student Attended Class
              </label>
              <p className="text-xs text-muted-foreground">
                Uncheck if the student was absent today.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary" className="text-sm font-semibold text-muted-foreground">Lesson Summary</Label>
            <Textarea 
              id="summary" 
              {...form.register("lessonSummary")} 
              className="min-h-[120px] rounded-xl border-border bg-muted/20 focus:bg-background resize-none"
              placeholder="What was covered today? e.g. practiced scales, reviewed homework..."
            />
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full rounded-xl h-11 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : "Save Log"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
