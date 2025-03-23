
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { ProjectUpdate, ProjectMetrics } from "@/types/project";
import { format } from "date-fns";
import { UpdateHeader } from "./project-updates/UpdateHeader";
import { UpdateMetrics } from "./project-updates/UpdateMetrics";
import { UpdateAttachments } from "./project-updates/UpdateAttachments";

interface ProjectUpdatesListProps {
  tenderId: string;
}

export default function ProjectUpdatesList({ tenderId }: ProjectUpdatesListProps) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from('project_updates')
      .select(`
        id,
        tender_id,
        created_by,
        created_at,
        update_type,
        title,
        description,
        metrics,
        attachments,
        status,
        is_published,
        profiles:created_by (
          organization
        )
      `)
      .eq('tender_id', tenderId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const typedUpdates: ProjectUpdate[] = data.map(update => ({
        ...update,
        metrics: update.metrics as ProjectMetrics,
        attachments: Array.isArray(update.attachments) 
          ? update.attachments.map(attachment => 
              typeof attachment === 'string' ? attachment : String(attachment)
            )
          : []
      }));
      setUpdates(typedUpdates);
    } else {
      console.error('Error fetching updates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project updates",
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUpdates();

    const channel = supabase
      .channel(`tender-${tenderId}-updates`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_updates',
          filter: `tender_id=eq.${tenderId}`
        },
        () => {
          fetchUpdates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenderId]);

  const handleDelete = async (updateId: string) => {
    const { error } = await supabase
      .from('project_updates')
      .delete()
      .eq('id', updateId);

    if (error) {
      console.error('Error deleting update:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project update",
      });
    } else {
      toast({
        title: "Success",
        description: "Project update deleted successfully",
      });
      fetchUpdates();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (updates.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No updates yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <Card key={update.id}>
          <UpdateHeader
            title={update.title}
            updateType={update.update_type}
            onDelete={() => handleDelete(update.id)}
          />
          <CardContent className="space-y-4">
            {update.description && (
              <p className="text-sm text-muted-foreground">{update.description}</p>
            )}
            
            <UpdateMetrics metrics={update.metrics} />
            <UpdateAttachments attachments={update.attachments} />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>By {update.profiles?.organization || 'Unknown'}</span>
              <span>{format(new Date(update.created_at), 'PPp')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
