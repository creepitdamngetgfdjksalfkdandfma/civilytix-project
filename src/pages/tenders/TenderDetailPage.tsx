
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useTenderDetails } from "@/hooks/useTenderDetails";
import { TenderContent } from "@/components/tenders/TenderContent";

const TenderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole, loading: userRoleLoading } = useUserRole();
  const { tender, isLoading: tenderLoading, error } = useTenderDetails(id);

  useEffect(() => {
    if (!id) {
      console.log("No tender ID found, redirecting to browse page");
      navigate("/tenders/browse");
    }
  }, [id, navigate]);

  // Show loading state
  if (userRoleLoading || tenderLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    console.error("Error loading tender:", error);
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Tender</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Handle case when tender is not found
  if (!tender && !tenderLoading) {
    console.log("Tender not found, redirecting to browse page");
    navigate("/tenders/browse");
    return null;
  }

  // Only render content when we have both tender and userRole
  if (!tender || !id) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <TenderContent tender={tender} tenderId={id} userRole={userRole} />;
};

export default TenderDetailPage;
