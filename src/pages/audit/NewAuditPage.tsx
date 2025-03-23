
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { TestResultStatus } from "@/types/audit";
import { Project } from "@/types/project";
import { X, Upload } from "lucide-react";

const auditFormSchema = z.object({
  test_type: z.string().min(1, "Test type is required"),
  test_description: z.string().min(1, "Test description is required"),
  test_date: z.string().min(1, "Test date is required"),
  project_id: z.string().min(1, "Project is required"),
  result: z.enum(["passed", "failed", "pending"] as const).default("pending"),
  maintenance_needed: z.boolean().default(false),
  maintenance_description: z.string().optional(),
});

type AuditFormValues = z.infer<typeof auditFormSchema>;

const NewAuditPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Fetch projects
  const { data: projects } = useQuery({
    queryKey: ["projects-for-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, status")
        .eq("status", "active");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch projects",
        });
        return [];
      }
      return data as Project[];
    },
  });

  // Fetch tenders for selected project
  const { data: tenders } = useQuery({
    queryKey: ["tenders-for-project", selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      const { data, error } = await supabase
        .from("tenders")
        .select("id, title")
        .eq("project_id", selectedProjectId)
        .eq("status", "awarded");

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch tenders for this project",
        });
        return [];
      }
      return data;
    },
    enabled: !!selectedProjectId,
  });

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      maintenance_needed: false,
      result: "pending",
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: AuditFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get the tender_id based on the project
      let tender_id = null;
      if (tenders && tenders.length > 0) {
        // Use the first awarded tender for this project
        tender_id = tenders[0].id;
      }

      // Upload files to storage
      const attachments: string[] = [];
      
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `audit-attachments/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('audit-documents')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: `Failed to upload file: ${file.name}`,
          });
          continue; // Skip this file and continue with others
        }
        
        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('audit-documents')
          .getPublicUrl(filePath);
          
        attachments.push(publicUrl);
      }

      const { error } = await supabase.from("infrastructure_audits").insert({
        test_type: values.test_type,
        test_description: values.test_description,
        test_date: values.test_date,
        tender_id: tender_id,
        result: values.result as TestResultStatus,
        maintenance_needed: values.maintenance_needed,
        maintenance_description: values.maintenance_description,
        created_by: user.id,
        attachments: attachments, // Add the attachments URLs
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Audit report created successfully",
      });

      navigate("/audit");
    } catch (error) {
      console.error("Error creating audit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create audit report",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Audit Report</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedProjectId(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the project to be audited
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProjectId && tenders?.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
                Warning: This project has no awarded tenders. The audit will be created but not linked to any tender.
              </div>
            )}

            <FormField
              control={form.control}
              name="test_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Structural Integrity Test" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the type of test being conducted
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="test_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the test conducted..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information about the test methodology and scope
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="test_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Test Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="result"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select test result" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maintenance_needed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Maintenance Required</FormLabel>
                    <FormDescription>
                      Check if maintenance work is needed based on the test results
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("maintenance_needed") && (
              <FormField
                control={form.control}
                name="maintenance_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maintenance Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the required maintenance work..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide details about the maintenance work needed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* File Upload Section */}
            <div className="space-y-2">
              <FormLabel>Attachments</FormLabel>
              <div className="border border-input rounded-md p-4">
                <label 
                  htmlFor="file-upload" 
                  className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Click to upload documents
                    </span>
                    <span className="text-xs text-gray-400">
                      PDF, Word, Excel, JPG, PNG
                    </span>
                  </div>
                  <Input 
                    id="file-upload"
                    type="file" 
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </label>

                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Selected Files:</p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                        >
                          <span className="text-sm truncate max-w-[80%]">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleFileRemove(index)}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <FormDescription>
                Upload relevant documents, photos, or test results
              </FormDescription>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Audit Report"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/audit")}
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

export default NewAuditPage;
