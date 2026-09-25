import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { priceLabel, type Listing } from "@/lib/refest";

export const Route = createFileRoute("/_authenticated/my-listings")({
  head: () => ({
    meta: [
      { title: "My listings — ReFest" },
      { name: "description", content: "Manage your ReFest listings and see their approval status." },
      { property: "og:title", content: "My listings — ReFest" },
      { property: "og:description", content: "Your ReFest listings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Mine,
});

const badge: Record<string, string> = { pending: "bg-accent/40", approved: "bg-primary text-primary-foreground", rejected: "bg-destructive text-destructive-foreground" };

function Mine() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["mine", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Listing[];
    },
  });
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-bold text-primary">My listings</h1>
      <div className="mt-4 space-y-3">
        {data?.length === 0 && <p className="text-muted-foreground">Nothing yet. <Link to="/post" className="text-primary underline">Post your first listing</Link></p>}
        {data?.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">{l.photos[0] && <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />}</div>
            <Link to="/listing/$id" params={{ id: l.id }} className="min-w-0 flex-1">
              <div className="truncate font-semibold">{l.title}</div>
              <div className="text-sm text-muted-foreground">{priceLabel(l)} · {l.city}</div>
            </Link>
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold capitalize ${badge[l.status]}`}>{l.status}</span>
            <Button variant="ghost" size="sm" onClick={async () => { await supabase.from("listings").delete().eq("id", l.id); qc.invalidateQueries({ queryKey: ["mine"] }); }}>Delete</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
