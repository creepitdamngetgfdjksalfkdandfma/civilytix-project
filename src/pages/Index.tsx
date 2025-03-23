import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import GovernmentDashboard from "./dashboard/GovernmentDashboard";
import BidderDashboard from "./dashboard/BidderDashboard";
import PublicDashboard from "./dashboard/PublicDashboard";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useEffect, useState } from "react";

const Index = () => {
  const { user, userRole, isLoading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkingRole, setCheckingRole] = useState(false);

  console.log("Index page - Current user role:", userRole, "User:", user ? "Logged in" : "Not logged in");
  
  // If we have a user but no role, try to fetch the role
  useEffect(() => {
    if (user && !userRole && !checkingRole && !isLoading) {
      setCheckingRole(true);
      console.log("Index: User is authenticated but no role found, checking auth");
      checkAuth().finally(() => {
        setCheckingRole(false);
      });
    }
  }, [user, userRole, isLoading, checkAuth]);

  if (isLoading || checkingRole) {

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated but has no role, show a message
  if (user && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Account Setup Incomplete</h2>
          <p className="mb-4">Your account exists but doesn't have a role assigned. Please sign out and create a new account with a specific role.</p>
          <Button 
            onClick={() => navigate("/auth")} 
            variant="outline" 
            className="mr-2"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="container mx-auto px-6 py-24">
            <div className="flex flex-col items-center text-center space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Welcome to Civilytix
              </h1>
              <p className="text-xl md:text-2xl max-w-2xl text-gray-100">
                Transforming government tenders with transparency, efficiency, and trust
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 hover:text-purple-700"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Civilytix?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature Cards */}
              <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 text-black transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-400">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Government Officials</h3>
                  <p className="text-gray-600 mb-4">
                    Streamline tender management, evaluate bids efficiently, and ensure transparent project execution
                  </p>
                  <Button 
                    onClick={() => navigate("/auth?role=government")}
                    variant="outline"
                    className="w-full"
                  >
                    Join as Government
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 text-black transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-400">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Bidders</h3>
                  <p className="text-gray-600 mb-4">
                    Access opportunities, submit bids seamlessly, and track your application status in real-time
                  </p>
                  <Button 
                    onClick={() => navigate("/auth?role=bidder")}
                    variant="outline"
                    className="w-full"
                  >
                    Join as Bidder
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-xl shadow-lg bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 text-black transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-400">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Public</h3>
                  <p className="text-gray-600 mb-4">
                    Monitor project progress, ensure transparency, and stay informed about government initiatives
                  </p>
                  <Button 
                    onClick={() => navigate("/auth?role=public")}
                    variant="outline"
                    className="w-full"
                  >
                    Join as Public
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add a debugging toast to show current role
  if (user && userRole) {
    console.log(`Rendering dashboard for role: ${userRole}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {userRole === "government" && <GovernmentDashboard />}
        {userRole === "bidder" && <BidderDashboard />}
        {userRole === "public" && <PublicDashboard />}
        {!userRole && (
          <div className="p-6 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-800">
            <h2 className="text-xl font-semibold mb-2">Role Not Found</h2>
            <p className="mb-4">Your account doesn't have a role assigned. Please sign out and log in again with a specific role.</p>
            <Button 
              onClick={() => navigate("/auth")} 
              variant="outline" 
              className="mr-2"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
