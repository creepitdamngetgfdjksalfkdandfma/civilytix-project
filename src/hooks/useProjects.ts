
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/auth";
import { Project } from "@/types/project";

export const useProjects = () => {
  const { userRole, loading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();

  const {
    data: projects,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        console.log("Fetching projects with role:", userRole);
        
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, description, department, status, budget_allocated, created_at, start_date, end_date')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase fetch error:", error);
          throw new Error(error.message);
        }

        console.log("Projects fetched successfully:", data);
        return data as Project[] || [];
      } catch (err) {
        console.error("Error fetching projects:", err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
    // Only fetch if user is authenticated and not loading
    enabled: !!user && !authLoading && !roleLoading,
  });

  return {
    projects,
    isLoading,
    error,
    refetch,
    authLoading,
    roleLoading,
    userRole,
    user
  };
};
