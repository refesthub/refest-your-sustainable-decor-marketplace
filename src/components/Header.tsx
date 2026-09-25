import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import logo from "@/assets/refest-logo.jpeg.asset.json";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/refest";

export function Header() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo.url} alt="ReFest logo" className="h-11 w-11 rounded-full object-cover" />
          <span className="font-display text-2xl font-bold text-primary">ReFest</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 text-sm font-semibold">
          {user ? (
            <>
              <Link to="/my-listings" className="hidden px-2 text-primary sm:inline">My listings</Link>
              {isAdmin && <Link to="/admin" className="px-2 text-primary">Admin</Link>}
              <Button variant="ghost" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/", replace: true }); }}>Sign out</Button>
            </>
          ) : (
            <Link to="/auth" className="px-2 text-primary">Sign in</Link>
          )}
          <Button asChild size="sm" className="rounded-full">
            <Link to="/post"><Plus className="h-4 w-4" /> Post</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
