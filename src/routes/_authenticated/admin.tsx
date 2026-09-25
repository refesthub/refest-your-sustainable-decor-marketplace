import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { priceLabel, useAuth, type Listing } from "@/lib/refest";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin review — ReFest" },
      { name: "description", content: "Approve or reject new ReFest listings." },
      { property: "og:title", content: "Admin review — ReFest" },
      { property: "og:description", content: "ReFest moderation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { isAdmin, ready } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["pending"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("status", "pending").order("created_at");
      if (error) throw error;
      return data as Listing[];
    },
  });
  if (!ready) return null;
  if (!isAdmin) return <p className="p-10 text-center">Admins only.</p>;
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("listings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Listing ${status}`);
    qc.invalidateQueries();
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-3xl font-bold text-primary">Pending approval</h1>
      <div className="mt-4 space-y-3">
        {data?.length === 0 && <p className="text-muted-foreground">All caught up!</p>}
        {data?.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-muted">{l.photos[0] && <img src={l.photos[0]} alt="" className="h-full w-full object-cover" />}</div>
            <Link to="/listing/$id" params={{ id: l.id }} className="min-w-0 flex-1">
              <div className="truncate font-semibold">{l.title}</div>
              <div className="text-sm text-muted-foreground capitalize">{l.listing_type} · {priceLabel(l)} · {l.area}, {l.city}</div>
            </Link>
            <Button size="sm" className="rounded-full" onClick={() => setStatus(l.id, "approved")}>Approve</Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(l.id, "rejected")}>Reject</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
