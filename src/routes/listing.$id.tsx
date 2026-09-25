import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { MapPin, MessageCircle, Send, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { priceLabel, type Listing } from "@/lib/refest";

export const Route = createFileRoute("/listing/$id")({
  head: () => ({
    meta: [
      { title: "Listing — ReFest" },
      { name: "description", content: "Festival decoration listing on ReFest." },
      { property: "og:title", content: "Listing — ReFest" },
      { property: "og:description", content: "Festival decoration listing on ReFest." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const [idx, setIdx] = useState(0);
  const { data: l, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Listing | null;
    },
  });
  if (isLoading) return <div className="mx-auto max-w-4xl p-6"><div className="aspect-video animate-pulse rounded-2xl bg-muted" /></div>;
  if (!l) return <div className="p-10 text-center">Listing not found. <Link to="/" className="text-primary underline">Back home</Link></div>;
  const msg = encodeURIComponent(`Hi! I'm interested in your ReFest listing: ${l.title}`);
  const wa = l.whatsapp?.replace(/\D/g, "");
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 md:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
          {l.photos[idx] ? <img src={l.photos[idx]} alt={l.title} className="h-full w-full object-cover" /> :
            <div className="flex h-full items-center justify-center text-primary/40"><Leaf className="h-12 w-12" /></div>}
        </div>
        {l.photos.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {l.photos.map((p, i) => <button key={p} onClick={() => setIdx(i)}><img src={p} alt="" className={`h-16 w-16 rounded-lg object-cover ${i === idx ? "ring-2 ring-primary" : ""}`} /></button>)}
          </div>
        )}
      </div>
      <div>
        {l.status !== "approved" && <div className="mb-3 rounded-xl bg-accent/30 p-2 text-sm font-semibold">Status: {l.status} — only you and admins can see this.</div>}
        <span className="rounded-full bg-accent px-3 py-0.5 text-xs font-bold capitalize">{l.listing_type}</span>
        <h1 className="mt-2 text-3xl font-bold text-primary">{l.title}</h1>
        <div className="font-display text-2xl font-bold">{priceLabel(l)}</div>
        <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{[l.area, l.city].filter(Boolean).join(", ")}</div>
        <div className="mt-3 flex gap-2 text-xs">
          <span className="rounded-full border px-2 py-0.5">{l.category}</span>
          <span className="rounded-full border px-2 py-0.5">{l.condition}</span>
        </div>
        <p className="mt-4 whitespace-pre-line">{l.description}</p>
        <div className="mt-6 flex flex-col gap-2">
          {wa && <Button asChild size="lg" className="rounded-full"><a href={`https://wa.me/${wa.length === 10 ? "91" + wa : wa}?text=${msg}`} target="_blank" rel="noreferrer"><MessageCircle /> Chat on WhatsApp</a></Button>}
          {l.telegram && <Button asChild size="lg" variant="outline" className="rounded-full"><a href={`https://t.me/${l.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer"><Send /> Message on Telegram</a></Button>}
        </div>
      </div>
    </div>
  );
}
