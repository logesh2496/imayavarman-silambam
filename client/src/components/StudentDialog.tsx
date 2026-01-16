import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreateStudent, useUpdateStudent } from "@/hooks/use-students";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent, type Student } from "@shared/schema";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { z } from "zod";

type FormData = InsertStudent;

interface Props {
  student?: Student; // If provided, we are in Edit mode
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StudentDialog({ student, trigger, open: controlledOpen, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const isEditing = !!student;

  const form = useForm<FormData>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      currentLesson: "",
      status: "Active",
      feesPaid: false,
    },
  });

  // Reset form when opening or switching students
  useEffect(() => {
    if (isOpen) {
      if (student) {
        form.reset({
          name: student.name,
          currentLesson: student.currentLesson,
          status: student.status,
          feesPaid: student.feesPaid ?? false,
        });
      } else {
        form.reset({
          name: "",
          currentLesson: "",
          status: "Active",
          feesPaid: false,
        });
      }
    }
  }, [isOpen, student, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && student) {
        await updateMutation.mutateAsync({ id: student.id, ...data });
      } else {
        await createMutation.mutateAsync(data);
      }
      setOpen(false);
    } catch (error) {
      // Error handling is done in hooks via toast
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] rounded-xl border-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-slate-900">
            {isEditing ? "Edit Student" : "Add New Student"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-600 font-medium">Full Name</Label>
            <Input
              id="name"
              placeholder="e.g. Alice Johnson"
              className="h-12 rounded-lg border-slate-200 focus:border-primary focus:ring-primary/20"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentLesson" className="text-slate-600 font-medium">Current Lesson</Label>
            <Input
              id="currentLesson"
              placeholder="e.g. Piano Basics - Chapter 3"
              className="h-12 rounded-lg border-slate-200 focus:border-primary focus:ring-primary/20"
              {...form.register("currentLesson")}
            />
            {form.formState.errors.currentLesson && (
              <p className="text-xs text-red-500">{form.formState.errors.currentLesson.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-slate-600 font-medium">Status</Label>
              <Select 
                onValueChange={(val) => form.setValue("status", val)} 
                defaultValue={student?.status || "Active"}
              >
                <SelectTrigger className="h-12 rounded-lg border-slate-200">
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
            
            <div className="space-y-2">
              <Label className="text-slate-600 font-medium">Fees Status</Label>
              <div 
                className={`h-12 flex items-center px-4 rounded-lg border cursor-pointer transition-colors ${
                  form.watch("feesPaid") 
                    ? "bg-green-50 border-green-200 text-green-700" 
                    : "bg-amber-50 border-amber-200 text-amber-700"
                }`}
                onClick={() => form.setValue("feesPaid", !form.watch("feesPaid"))}
              >
                <span className="text-sm font-semibold">
                  {form.watch("feesPaid") ? "Paid" : "Unpaid"}
                </span>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-12 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {isPending ? "Saving..." : (isEditing ? "Update Student" : "Create Student")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
