
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import { format } from "date-fns";

interface TenderAnnouncementsProps {
  tenderId: string;
  isGovernmentUser: boolean;
}

const TenderAnnouncements = ({ tenderId, isGovernmentUser }: TenderAnnouncementsProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements", tenderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("tender_id", tenderId)
        .order("publish_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("announcements").insert({
        tender_id: tenderId,
        title,
        content,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Announcement has been published",
      });

      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish announcement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isGovernmentUser && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Announcement Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Announcement Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Publish Announcement
                </>
              )}
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {announcements?.map((announcement) => (
            <Card key={announcement.id}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{announcement.content}</p>
                <p className="text-xs text-muted-foreground">
                  Published {format(new Date(announcement.publish_at), "PPp")}
                </p>
              </CardContent>
            </Card>
          ))}
          
          {(!announcements || announcements.length === 0) && (
            <p className="text-center text-muted-foreground">No announcements yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TenderAnnouncements;
