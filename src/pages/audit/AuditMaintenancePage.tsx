import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { InfrastructureAudit } from "@/types/audit";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { FileText, Plus, Wrench, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";

const AuditMaintenancePage = () => {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isGovernmentUser = userRole === 'government';

  const { data: audits, isLoading, error } = useQuery({
    queryKey: ["infrastructure-audits"],
    queryFn: async () => {
      console.log("Fetching infrastructure audits");
      const { data, error } = await supabase
        .from("infrastructure_audits")
        .select(`
          *,
          tender:tender_id(title)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching audits:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch audit reports",
        });
        return [];
      }

      console.log("Successfully fetched audits:", data);
      return data as InfrastructureAudit[];
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      passed: "default",
      failed: "destructive",
      pending: "secondary",
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8">
          <div className="inline-block animate-spin">
            <Clock className="h-6 w-6" />
          </div>
          <p className="mt-2">Loading audit reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center p-8 text-red-500">
          <p>Failed to load audit reports. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Infrastructure Audits</h1>
          <p className="text-muted-foreground">
            Manage infrastructure audits and maintenance schedules
          </p>
        </div>
        
        {isGovernmentUser && (
          <Button asChild>
            <Link to="/audit/new">
              <Plus className="h-4 w-4 mr-2" />
              New Audit
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Type</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Test Date</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Maintenance Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits?.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="font-medium">{audit.test_type}</TableCell>
                <TableCell>{audit.tender?.title || "N/A"}</TableCell>
                <TableCell>
                  {audit.test_date ? format(new Date(audit.test_date), "MMM d, yyyy") : "N/A"}
                </TableCell>
                <TableCell>{getStatusBadge(audit.result)}</TableCell>
                <TableCell>
                  {!audit.maintenance_needed ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      No Maintenance Needed
                    </Badge>
                  ) : audit.maintenance_scheduled_date ? (
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className="flex items-center gap-1 text-amber-700 bg-amber-50 border-amber-200">
                        <Clock className="h-3.5 w-3.5" />
                        Scheduled
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(audit.maintenance_scheduled_date), "MMM d, yyyy")}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5" />
                      Required
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/audit/${audit.id}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Details
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!audits || audits.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No audit reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AuditMaintenancePage;
