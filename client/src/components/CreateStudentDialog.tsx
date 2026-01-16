import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent } from "@shared/schema";
import { useCreateStudent } from "@/hooks/use-students";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

export function CreateStudentDialog() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateStudent();
  
  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      currentLesson: "",
      status: "Active",
      feesPaid: false,
    },
  });

  const onSubmit = (data: InsertStudent) => {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25 transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none shadow-2xl rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground">Full Name</Label>
            <Input 
              id="name" 
              {...form.register("name")} 
              className="rounded-xl border-border bg-muted/20 focus:bg-background transition-colors"
              placeholder="e.g. Alice Smith"
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson" className="text-sm font-semibold text-muted-foreground">Current Lesson</Label>
            <Input 
              id="lesson" 
              {...form.register("currentLesson")} 
              className="rounded-xl border-border bg-muted/20 focus:bg-background transition-colors"
              placeholder="e.g. Chapter 3: Basics"
            />
             {form.formState.errors.currentLesson && (
              <p className="text-destructive text-xs">{form.formState.errors.currentLesson.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold text-muted-foreground">Status</Label>
            <Select 
              onValueChange={(val) => form.setValue("status", val)} 
              defaultValue={form.getValues("status")}
            >
              <SelectTrigger className="w-full rounded-xl border-border bg-muted/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Probation">Probation</SelectItem>
                <SelectItem value="Graduated">Graduated</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full rounded-xl h-11 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : "Create Student"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
