import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UpdateAttachments } from "@/components/tenders/project-updates/UpdateAttachments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, CheckCircle, XCircle, AlertCircle, Clock, Upload, Wrench } from "lucide-react";
import { InfrastructureAudit } from "@/types/audit";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";

const AuditDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isGovernmentUser = userRole === 'government';
  
  const [audit, setAudit] = useState<InfrastructureAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [maintenanceFiles, setMaintenanceFiles] = useState<File[]>([]);
  const [openCompletionDialog, setOpenCompletionDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  const maintenanceForm = useForm({
    defaultValues: {
      completionNotes: "",
    }
  });

  const scheduleFormSchema = z.object({
    maintenanceDate: z.date({
      required_error: "Please select a date for maintenance",
    }),
    maintenanceTime: z.string().min(1, "Please select a time for maintenance"),
  });

  const scheduleForm = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      maintenanceDate: new Date(),
      maintenanceTime: "10:00",
    },
  });

  useEffect(() => {
    fetchAudit();
  }, [id, toast]);

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("infrastructure_audits")
        .select(`
          *,
          tender:tender_id (
            title
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setAudit(data);
      console.log("Loaded audit data:", data);
    } catch (error) {
      console.error("Error fetching audit:", error);
      toast({
        variant: "destructive",
        title: "Failed to load audit",
        description: "Could not fetch the audit details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const handleMaintenanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      setMaintenanceFiles(fileList);
    }
  };

  const uploadMaintenanceFiles = async (): Promise<string[]> => {
    if (maintenanceFiles.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    setFileUploading(true);
    
    try {
      for (const file of maintenanceFiles) {
        const filePath = `maintenance/${id}/${Date.now()}-${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('audit-documents')
          .upload(filePath, file);
          
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('audit-documents')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(urlData.publicUrl);
      }
      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading maintenance files:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Could not upload maintenance documentation files.",
      });
      return [];
    } finally {
      setFileUploading(false);
    }
  };

  const handleMaintenanceCompleted = async (values: { completionNotes: string }) => {
    try {
      setIsCompleting(true);
      
      // Upload any maintenance files
      const uploadedUrls = await uploadMaintenanceFiles();
      
      // Get the current attachments
      let currentAttachments = [];
      if (audit?.attachments && Array.isArray(audit.attachments)) {
        currentAttachments = [...audit.attachments];
      }
      
      // Combine with new maintenance documentation
      const updatedAttachments = [...currentAttachments, ...uploadedUrls];
      
      // Update the audit record
      const { error } = await supabase
        .from("infrastructure_audits")
        .update({
          maintenance_description: values.completionNotes 
            ? `${audit?.maintenance_description || ''}\n\nCompletion Notes: ${values.completionNotes}`
            : audit?.maintenance_description,
          attachments: updatedAttachments,
          maintenance_needed: false, // Mark maintenance as no longer needed
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Maintenance completed",
        description: "Maintenance has been marked as completed.",
      });

      // Refresh audit data
      fetchAudit();
      setOpenCompletionDialog(false);
      setMaintenanceFiles([]);
      maintenanceForm.reset();
    } catch (error) {
      console.error("Error completing maintenance:", error);
      toast({
        variant: "destructive",
        title: "Failed to complete maintenance",
        description: "Could not mark maintenance as completed. Please try again.",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleScheduleMaintenance = async (values: z.infer<typeof scheduleFormSchema>) => {
    try {
      setIsScheduling(true);
      
      // Create a Date object combining the selected date and time
      const [hours, minutes] = values.maintenanceTime.split(':').map(Number);
      const scheduledDate = new Date(values.maintenanceDate);
      scheduledDate.setHours(hours, minutes, 0, 0);
      
      // Update the audit record with the scheduled maintenance date
      const { error } = await supabase
        .from("infrastructure_audits")
        .update({
          maintenance_scheduled_date: scheduledDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Maintenance scheduled",
        description: `Maintenance has been scheduled for ${format(scheduledDate, "PPP")} at ${format(scheduledDate, "h:mm a")}.`,
      });

      // Refresh audit data
      fetchAudit();
      setOpenScheduleDialog(false);
      scheduleForm.reset();
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
      toast({
        variant: "destructive",
        title: "Failed to schedule maintenance",
        description: "Could not schedule maintenance. Please try again.",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const hasAttachments = (): boolean => {
    return (
      !!audit?.attachments && 
      Array.isArray(audit.attachments) && 
      audit.attachments.length > 0
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Skeleton className="h-10 w-24 mr-4" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Audit not found</h1>
          <p className="mb-6">The audit you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate("/audit")}>Return to Audits</Button>
        </div>
      </div>
    );
  }

  const isMaintenanceCompleted = !audit.maintenance_needed && audit.maintenance_description?.includes("Completion Notes");
  const hasScheduledMaintenance = !!audit.maintenance_scheduled_date;
  const scheduledDate = hasScheduledMaintenance ? new Date(audit.maintenance_scheduled_date) : null;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            className="mr-4"
            onClick={() => navigate("/audit")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{audit.test_type}</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Audit Details</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {audit.test_date ? format(new Date(audit.test_date), "PPP") : "No date provided"}
                </p>
              </div>
              <div>{getStatusBadge(audit.result)}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {audit.tender && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Related Tender</h3>
                  <p>{audit.tender.title}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Test Description</h3>
                <p className="whitespace-pre-line">{audit.test_description}</p>
              </div>

              <Separator />

              {audit.maintenance_needed && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-red-500 mb-1">Maintenance Required</h3>
                    {audit.maintenance_description ? (
                      <p className="whitespace-pre-line">{audit.maintenance_description}</p>
                    ) : (
                      <p className="text-muted-foreground italic">No maintenance description provided</p>
                    )}
                  </div>
                  
                  {hasScheduledMaintenance && (
                    <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
                      <h3 className="text-sm font-medium text-amber-800 flex items-center mb-2">
                        <Clock className="h-4 w-4 mr-1" /> Scheduled Maintenance
                      </h3>
                      <div className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="bg-white rounded-md shadow-sm border">
                          <CalendarComponent
                            mode="single"
                            selected={scheduledDate}
                            disabled={true}
                            className="rounded-md"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-amber-700 font-medium mb-1">
                            {format(scheduledDate!, "PPPP")}
                          </p>
                          <p className="text-amber-700">
                            {format(scheduledDate!, "h:mm a")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isMaintenanceCompleted && (
                    <div className="p-4 bg-green-50 rounded-md border border-green-200">
                      <h3 className="text-sm font-medium text-green-800 flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 mr-1" /> Maintenance Completed
                      </h3>
                    </div>
                  )}
                  
                  {isGovernmentUser && (
                    <div className="flex flex-wrap gap-3">
                      {!hasScheduledMaintenance && !isMaintenanceCompleted && (
                        <Dialog open={openScheduleDialog} onOpenChange={setOpenScheduleDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Wrench className="h-4 w-4 mr-2" />
                              Schedule Maintenance
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Schedule Maintenance</DialogTitle>
                              <DialogDescription>
                                Select a date and time for the maintenance to be performed.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...scheduleForm}>
                              <form onSubmit={scheduleForm.handleSubmit(handleScheduleMaintenance)} className="space-y-4 py-4">
                                <FormField
                                  control={scheduleForm.control}
                                  name="maintenanceDate"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                      <FormLabel>Date</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button
                                              variant={"outline"}
                                              className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                              )}
                                            >
                                              {field.value ? (
                                                format(field.value, "PPP")
                                              ) : (
                                                <span>Pick a date</span>
                                              )}
                                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                          </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <CalendarComponent
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => {
                                              const today = new Date();
                                              today.setHours(0, 0, 0, 0);
                                              return date < today;
                                            }}
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={scheduleForm.control}
                                  name="maintenanceTime"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Time</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="time"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <DialogFooter>
                                  <Button type="submit" disabled={isScheduling}>
                                    {isScheduling ? "Scheduling..." : "Schedule Maintenance"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      )}
                      
                      {!isMaintenanceCompleted && (
                        <Dialog open={openCompletionDialog} onOpenChange={setOpenCompletionDialog}>
                          <DialogTrigger asChild>
                            <Button variant="default" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Maintenance Complete
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Complete Maintenance</DialogTitle>
                              <DialogDescription>
                                Mark this maintenance task as completed and provide any completion notes and documentation.
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...maintenanceForm}>
                              <form onSubmit={maintenanceForm.handleSubmit(handleMaintenanceCompleted)} className="space-y-4 py-4">
                                <FormField
                                  control={maintenanceForm.control}
                                  name="completionNotes"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Completion Notes</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Describe what was done to resolve the issue"
                                          {...field}
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                
                                <div className="space-y-2">
                                  <FormLabel>Maintenance Documentation</FormLabel>
                                  <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Input
                                      id="maintenanceFiles"
                                      type="file"
                                      multiple
                                      onChange={handleMaintenanceFileChange}
                                    />
                                  </div>
                                  {maintenanceFiles.length > 0 && (
                                    <ul className="text-sm text-muted-foreground">
                                      {maintenanceFiles.map((file, index) => (
                                        <li key={index} className="flex items-center">
                                          <Upload className="h-3 w-3 mr-1" /> {file.name}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                
                                <DialogFooter>
                                  <Button type="submit" disabled={isCompleting || fileUploading}>
                                    {isCompleting || fileUploading ? "Processing..." : "Complete Maintenance"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                  
                  {!isGovernmentUser && audit.maintenance_needed && !isMaintenanceCompleted && (
                    <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                      <p className="text-blue-800 text-sm">
                        Maintenance management is restricted to government users.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {hasAttachments() && (
                <UpdateAttachments attachments={audit.attachments as string[]} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditDetailPage;
