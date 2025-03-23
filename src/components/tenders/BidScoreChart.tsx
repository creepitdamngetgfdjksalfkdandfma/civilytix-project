
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts';

interface BidScoreChartProps {
  bids: Array<{
    name: string;
    score: number;
    status: string;
  }>;
  shortlistThreshold: number;
  shortlistAutomatically: boolean;
}

export default function BidScoreChart({
  bids,
  shortlistThreshold,
  shortlistAutomatically,
}: BidScoreChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-gradient-primary">Bid Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bids} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <ReferenceLine 
                y={shortlistThreshold} 
                stroke="#8B5CF6"
                strokeDasharray="3 3" 
                label={{ 
                  value: "Shortlist Threshold",
                  fill: "#8B5CF6",
                  fontSize: 12
                }} 
              />
              <Bar dataKey="score" fill="#4F46E5">
                {bids.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.status === 'shortlisted' ? '#8B5CF6' : '#3B82F6'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-muted-foreground bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
          {shortlistAutomatically ? (
            <p>Bids scoring above {shortlistThreshold} will be automatically shortlisted after evaluation.</p>
          ) : (
            <p>Shortlist threshold set at {shortlistThreshold}, but automatic shortlisting is disabled.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
