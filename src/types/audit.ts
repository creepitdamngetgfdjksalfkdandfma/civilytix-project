
import { Database } from "@/integrations/supabase/types";

export type InfrastructureAudit = Database["public"]["Tables"]["infrastructure_audits"]["Row"] & {
  tender?: {
    title: string;
  };
};

export type MaintenanceMessage = Database["public"]["Tables"]["maintenance_messages"]["Row"];

export type TestResultStatus = Database["public"]["Enums"]["test_result_status"];
