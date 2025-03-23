
import { formatDistance } from "date-fns";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TenderStatus } from "@/types/tender";

interface WonTender {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string;
  current_status: TenderStatus;
}

interface WonProjectsListProps {
  wonTenders: WonTender[];
}

export function WonProjectsList({ wonTenders }: WonProjectsListProps) {
  const navigate = useNavigate();

  const formatDeadline = (date: string) => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {wonTenders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No won projects yet
          </CardContent>
        </Card>
      ) : (
        wonTenders.map((tender) => (
          <Card key={tender.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{tender.title}</h4>
                    <Badge variant="outline">{tender.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Project completion: {tender.current_status?.completion_percentage ?? 0}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Last updated: {tender.current_status?.last_updated ? formatDeadline(tender.current_status.last_updated) : 'Not updated yet'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/tenders/${tender.id}`)}
                >
                  View Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
