
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProjectTreeSelector } from "@/components/projects/ProjectTreeSelector";
import { ProjectTreeSelection } from "@/types/projectTree";
import TomTomMap from "./TomTomMap";

const projectFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  budget_allocated: z.number().min(0, "Budget must be a positive number"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  project_type_id: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

// Define the type based on the Supabase table structure
type ProjectInsert = {
  title: string;
  description?: string;
  department: string;
  budget_allocated: number;
  start_date: string;
  end_date: string;
  status: 'active';
  created_by: string;
  project_type_id?: string;
};

const NewProjectPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectSelection, setProjectSelection] = useState<ProjectTreeSelection | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      budget_allocated: 0,
      start_date: "",
      end_date: "",
      project_type_id: "",
    },
  });

  // Handle selection from the project tree
  const handleProjectSelection = (selection: ProjectTreeSelection) => {
    setProjectSelection(selection);
    
    // Update the budget field with the selected price
    form.setValue("budget_allocated", selection.totalPrice);
    
    // Update the project_type_id field with the selected node ID
    form.setValue("project_type_id", selection.nodeId);
  };

  const onSubmit = async (values: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const projectData: ProjectInsert = {
        title: values.title,
        description: values.description || null,
        department: values.department,
        budget_allocated: values.budget_allocated,
        start_date: values.start_date,
        end_date: values.end_date,
        status: 'active',
        created_by: user.id,
        project_type_id: values.project_type_id,
      };

      const { error } = await supabase
        .from("projects")
        .insert(projectData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create project",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Project</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of the project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <TomTomMap />

            {/* Project Type Selector with Budget Prediction */}
            <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
              <h2 className="font-semibold">Project Type & Budget Prediction</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Select a project type to get a budget prediction, or search for a specific project component.
              </p>
              
              <ProjectTreeSelector onSelect={handleProjectSelection} />
              
              <FormField
                control={form.control}
                name="project_type_id"
                render={() => (
                  <FormItem className="hidden">
                    {/* Hidden field to store the selected node ID */}
                    <FormControl>
                      <Input type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="budget_allocated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Allocated</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter budget amount"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  {projectSelection && (
                    <FormDescription>
                      Suggested budget from selected project type: ${projectSelection.totalPrice.toLocaleString()}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/projects")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProjectPage;
