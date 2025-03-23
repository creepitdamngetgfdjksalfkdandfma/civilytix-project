
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Home, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import Logo from "../assets/civilytix-logo.png";

const Header = () => {
  const { user, userRole, signOut, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/auth") {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-blue-300 to-cyan-200 text-blue-900 py-6 text-center shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <Home className="h-5 w-5" />
            <img src={Logo} alt="Civilytix Logo" className="h-8 w-auto" />
            Civilytix
          </Link>
          <nav className="flex items-center gap-4">
            {!isLoading && user ? (
              <>
                <Link to="/">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                
                <Link to="/projects">
                  <Button variant="ghost">Projects</Button>
                </Link>

                {userRole === "government" && (
                  <>
                    <Link to="/tenders/new">
                      <Button variant="ghost">Create Tender</Button>
                    </Link>
                    <Link to="/tenders/browse">
                      <Button variant="ghost">Manage Tenders</Button>
                    </Link>
                    <Link to="/audit">
                      <Button variant="ghost">
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Audits
                      </Button>
                    </Link>
                  </>
                )}

                {userRole === "bidder" && (
                  <Link to="/tenders/browse">
                    <Button variant="ghost">Browse Tenders</Button>
                  </Link>
                )}

                <Button variant="ghost" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              location.pathname !== "/auth" && !isLoading && (
                <Link to="/auth">
                  <Button>Login</Button>
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
