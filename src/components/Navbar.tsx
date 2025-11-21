import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  const user = session?.data?.user;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            DassReal
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link to="/nft-studio">
                  <Button variant="ghost">NFT Studio</Button>
                </Link>
                <Link to="/material-science">
                  <Button variant="ghost">Material Science</Button>
                </Link>
                <Link to="/innovation-hub">
                  <Button variant="ghost">Innovation Hub</Button>
                </Link>
                <Link to="/community-groups">
                  <Button variant="ghost">Groups</Button>
                </Link>
                <Link to="/workshops">
                  <Button variant="ghost">Workshops</Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/chat" className="cursor-pointer">
                        AI Chat
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/billing" className="cursor-pointer">
                        Billing
                      </Link>
                    </DropdownMenuItem>
                    {session.data.user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
