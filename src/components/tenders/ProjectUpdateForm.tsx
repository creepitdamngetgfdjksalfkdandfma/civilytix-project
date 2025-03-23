
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectUpdateType } from "@/types/project";
import { ProjectUpdateFormFields } from "./forms/ProjectUpdateFormFields";
import { useProjectBudget } from "./hooks/useProjectBudget";

interface ProjectUpdateFormProps {
  tenderId: string;
  onUpdateSubmitted: () => void;
  currentBudget?: number;
}

export default function ProjectUpdateForm({
  tenderId,
  onUpdateSubmitted,
  currentBudget
}: ProjectUpdateFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [updateType, setUpdateType] = useState<ProjectUpdateType>("progress");
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [economicImpact, setEconomicImpact] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const { totalBudgetUtilized, maxBudget, isLoading, error } = useProjectBudget(tenderId);

  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      setSelectedFiles([...selectedFiles, ...Array.from(files)]);
    }
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const newTotalBudget = totalBudgetUtilized + budgetUsed;
      if (newTotalBudget > maxBudget) {
        toast({
          variant: "destructive",
          title: "Budget Exceeded",
          description: `Total budget utilized (${newTotalBudget}) would exceed the maximum tender budget (${maxBudget}).`,
        });
        return;
      }

      // Upload files first
      const attachments: string[] = [];
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${tenderId}/${crypto.randomUUID()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project-updates')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('project-updates')
          .getPublicUrl(filePath);

        attachments.push(publicUrl);
      }

      const { error: updateError } = await supabase
        .from('project_updates')
        .insert({
          tender_id: tenderId,
          created_by: userData.user.id,
          update_type: updateType,
          title,
          description,
          metrics: {
            completion_percentage: completionPercentage,
            budget_used: budgetUsed,
            total_budget: maxBudget,
            economic_impact: economicImpact
          },
          attachments,
          is_published: true
        });

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Project update submitted successfully",
      });
      
      onUpdateSubmitted();
      
      // Reset form
      setTitle("");
      setDescription("");
      setCompletionPercentage(0);
      setBudgetUsed(0);
      setEconomicImpact('medium');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error submitting update:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit update. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Failed to load budget information. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Project Update</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ProjectUpdateFormFields
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            updateType={updateType}
            setUpdateType={setUpdateType}
            completionPercentage={completionPercentage}
            setCompletionPercentage={setCompletionPercentage}
            budgetUsed={budgetUsed}
            setBudgetUsed={setBudgetUsed}
            totalBudgetUtilized={totalBudgetUtilized}
            maxBudget={maxBudget}
            economicImpact={economicImpact}
            setEconomicImpact={setEconomicImpact}
            selectedFiles={selectedFiles}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Submitting..." : "Submit Update"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
