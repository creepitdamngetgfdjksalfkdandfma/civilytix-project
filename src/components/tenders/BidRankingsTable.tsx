
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, ArrowUp, ArrowDown } from "lucide-react";

interface Bid {
  id: string;
  amount: number;
  status: string;
  profiles?: {
    organization: string | null;
  } | null;
}

interface BidRankingsTableProps {
  bids: Bid[];
  scores: Record<string, number>;
  onShortlist: (bidId: string) => void;
  onRemoveShortlist: (bidId: string) => void;
}

export default function BidRankingsTable({
  bids,
  scores,
  onShortlist,
  onRemoveShortlist,
}: BidRankingsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Rank
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Organization
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Total Score
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Amount
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bids.map((bid, index) => (
                    <tr key={bid.id} className={index === 0 ? "bg-yellow-50" : ""}>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <Trophy className="h-4 w-4 text-yellow-500 mr-1" />}
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {bid.profiles?.organization || "Unknown Organization"}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {scores[bid.id].toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        ${bid.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={bid.status === 'shortlisted' ? 'default' : 'secondary'}>
                          {bid.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {bid.status === 'submitted' && (
                          <Button
                            size="sm"
                            onClick={() => onShortlist(bid.id)}
                            className="flex items-center"
                          >
                            <ArrowUp className="h-4 w-4 mr-1" />
                            Shortlist
                          </Button>
                        )}
                        {bid.status === 'shortlisted' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onRemoveShortlist(bid.id)}
                            className="flex items-center"
                          >
                            <ArrowDown className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
