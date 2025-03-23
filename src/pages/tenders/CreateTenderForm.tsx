
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RequiredSpecificationsForm } from "@/components/tenders/RequiredSpecificationsForm";
import { EvaluationCriteriaForm } from "@/components/tenders/EvaluationCriteriaForm";
import type { Specification, EvaluationCriterion } from "@/types/tender";

const Step1Schema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  start_date: z.date(),
  end_date: z.date(),
  budget_min: z.coerce.number().positive(),
  budget_max: z.coerce.number().positive(),
});

interface FormProps {
  step: number;
  onNext: () => void;
  projectId?: string | null;
  nodeId?: string | null;
  nodePrice?: number | null;
  nodeName?: string | null;
  onComplete: (tenderId: string) => void;
}

export default function CreateTenderForm({ step, onNext, projectId, nodeId, nodePrice, nodeName, onComplete }: FormProps) {
  const { toast } = useToast();
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriterion[]>([]);
  const [autoShortlist, setAutoShortlist] = useState(false);
  const [shortlistThreshold, setShortlistThreshold] = useState(70);
  
  // Calculate a reasonable budget range based on the node price
  const calculateBudgetRange = () => {
    if (nodePrice) {
      // Set a reasonable range with the node price in the middle
      // For example, ±20% of the node price
      const minBudget = Math.round(nodePrice * 0.8);
      const maxBudget = Math.round(nodePrice * 1.2);
      return { minBudget, maxBudget };
    }
    
    // Default values if no node price is provided
    return { minBudget: 1000, maxBudget: 10000 };
  };
  
  const { minBudget, maxBudget } = calculateBudgetRange();

  const form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      title: "",
      description: "",
      budget_min: minBudget,
      budget_max: maxBudget,
    },
  });
  
  // Update form values when nodePrice changes
  useEffect(() => {
    if (nodePrice) {
      const { minBudget, maxBudget } = calculateBudgetRange();
      form.setValue("budget_min", minBudget);
      form.setValue("budget_max", maxBudget);
      
      // If nodeName exists, set a default title using the node name
      if (nodeName) {
        form.setValue("title", `Tender for ${nodeName}`);
      } else if (nodeId) {
        // Fallback to the component ID if name is not available
        form.setValue("title", `Tender for Component ID: ${nodeId}`);
      }
    }
  }, [nodePrice, nodeId, nodeName, form]);

  const validateStep = async () => {
    if (step === 1) {
      const result = await form.trigger();
      if (result) {
        // Additional validation for budget_min < budget_max
        const values = form.getValues();
        if (values.budget_min >= values.budget_max) {
          form.setError("budget_max", {
            message: "Maximum budget must be greater than minimum budget",
          });
          return false;
        }
        return true;
      }
      return false;
    }
    
    if (step === 2) {
      // Validate that at least one specification is added
      if (specifications.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please add at least one specification",
        });
        return false;
      }
      return true;
    }
    
    if (step === 3) {
      // Check if total weights sum up to 100
      const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
      if (totalWeight !== 100) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: `Total weight must equal 100% (current: ${totalWeight}%)`,
        });
        return false;
      }
      return true;
    }
    
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      onNext();
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    try {
      const values = form.getValues();
      
      // Create the tender
      const { data, error } = await supabase
        .from("tenders")
        .insert({
          title: values.title,
          description: values.description,
          start_date: values.start_date.toISOString(),
          end_date: values.end_date.toISOString(),
          budget_min: values.budget_min,
          budget_max: values.budget_max,
          status: "draft",
          project_id: projectId || null,
          project_type_id: nodeId || null,
          required_specifications: specifications,
          evaluation_criteria: criteria,
          shortlist_automatically: autoShortlist,
          shortlist_threshold: shortlistThreshold,
        })
        .select("id")
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tender created successfully",
      });

      // Navigate to the new tender
      if (data?.id) {
        onComplete(data.id);
      }
    } catch (error: any) {
      console.error("Error creating tender:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create tender",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {step === 1 && (
          <Form {...form}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tender Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title" {...field} />
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
                        placeholder="Provide a detailed description of the tender"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => 
                              date < new Date() || 
                              (form.getValues().start_date && date < form.getValues().start_date)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="budget_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Budget ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Budget ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {nodePrice && (
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                  <p className="text-blue-800">
                    The budget range is calculated based on the estimated price of ${nodePrice.toLocaleString()} 
                    for the selected component.
                  </p>
                </div>
              )}

              {projectId && (
                <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
                  <p className="text-blue-800">
                    This tender will be associated with project ID: {projectId}
                    {nodeName && ` and component: ${nodeName}`}
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </div>
          </Form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Required Specifications</h2>
            <p className="text-gray-600">
              Define the specifications that bidders must include in their proposals.
            </p>
            
            <RequiredSpecificationsForm 
              specifications={specifications}
              onChange={setSpecifications}
            />
            
            <div className="flex justify-end">
              <Button onClick={handleNext}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Evaluation Criteria</h2>
            <p className="text-gray-600">
              Define the criteria used to evaluate bids.
            </p>
            
            <EvaluationCriteriaForm
              criteria={criteria}
              onChange={setCriteria}
            />
            
            <div className="space-y-4 border-t pt-4 mt-6">
              <h3 className="font-medium">Shortlisting Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-shortlist"
                  checked={autoShortlist}
                  onCheckedChange={(checked) => setAutoShortlist(!!checked)}
                />
                <label
                  htmlFor="auto-shortlist"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Automatically shortlist bids above threshold
                </label>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Shortlist Threshold Score: {shortlistThreshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={shortlistThreshold}
                  onChange={(e) => setShortlistThreshold(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>50%</span>
                  <span>70%</span>
                  <span>95%</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSubmit}>Create Tender</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
