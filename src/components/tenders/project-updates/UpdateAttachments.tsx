
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface UpdateAttachmentsProps {
  attachments: string[];
}

export function UpdateAttachments({ attachments }: UpdateAttachmentsProps) {
  const { toast } = useToast();

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download started",
        description: `Downloading ${fileName}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download the file. Please try again.",
      });
    }
  };

  if (!attachments || attachments.length === 0) return null;

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Attachments</h3>
        <div className="grid gap-2">
          {attachments.map((url, index) => {
            const fileName = url.split('/').pop() || `file-${index + 1}`;
            const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
            
            // Determine document type icon or class based on extension
            let fileTypeClass = "bg-gray-100";
            if (['pdf'].includes(fileExt)) fileTypeClass = "bg-red-50";
            if (['doc', 'docx'].includes(fileExt)) fileTypeClass = "bg-blue-50";
            if (['xls', 'xlsx'].includes(fileExt)) fileTypeClass = "bg-green-50";
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) fileTypeClass = "bg-purple-50";
            
            return (
              <div key={index} className={`flex items-center justify-between p-3 rounded-md ${fileTypeClass}`}>
                <div className="flex items-center space-x-3 truncate">
                  <span className="text-sm font-medium truncate">{fileName}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(url, fileName)}
                  className="ml-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
