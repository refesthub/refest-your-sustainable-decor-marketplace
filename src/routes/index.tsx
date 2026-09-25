import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Recycle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES, CITIES, LISTING_TYPES, type Listing } from "@/lib/refest";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReFest — Buy, Rent, Exchange & Donate Ganpati Decorations" },
      { name: "description", content: "Give festival decorations a second life. Community marketplace for Ganpati decor in Pune and Mumbai." },
      { property: "og:title", content: "ReFest — Give Festival Decorations a Second Life" },
      { property: "og:description", content: "Buy, sell, rent, exchange and donate Ganpati decorations in Pune and Mumbai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

const sel = "h-10 rounded-full border bg-card px-3 text-sm";

function Home() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["listings", q, type, city, cat, maxPrice],
    queryFn: async () => {
      let query = supabase.from("listings").select("*").eq("status", "approved").order("created_at", { ascending: false });
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (type) query = query.eq("listing_type", type);
      if (city) query = query.eq("city", city);
      if (cat) query = query.eq("category", cat);
      if (maxPrice) query = query.lte("price", Number(maxPrice));
      const { data, error } = await query;
      if (error) throw error;
      return data as Listing[];
    },
  });

  return (
    <div>
      <section className="relative overflow-hidden border-b bg-secondary/60">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border-2 border-primary/20" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full border-2 border-primary/15" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <p className="flex items-center gap-2 text-sm font-semibold text-primary">
            Reuse <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Rent <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Resell
          </p>
          <h1 className="mt-2 max-w-2xl text-4xl font-extrabold leading-tight text-primary md:text-5xl">
            Give festival decorations a second life
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">Ganpati decor from families in Pune and Mumbai — buy, rent, exchange or take it free.</p>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search makhar, backdrops, lights…" className="h-12 rounded-full bg-card pl-10" />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {[{ value: "", label: "All" }, ...LISTING_TYPES].map((t) => (
            <button key={t.value} onClick={() => setType(t.value)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${type === t.value ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary hover:bg-secondary"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <select className={sel} value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All cities</option>{CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={sel} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={sel} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
            <option value="">Any price</option>
            {[500, 1000, 2500, 5000, 10000].map((p) => <option key={p} value={p}>Up to ₹{p.toLocaleString("en-IN")}</option>)}
          </select>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {isLoading && Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />)}
          {data?.map((l) => <ListingCard key={l.id} l={l} />)}
        </div>
        {data && data.length === 0 && (
          <div className="mt-10 flex flex-col items-center text-center text-muted-foreground">
            <Recycle className="h-10 w-10 text-primary/50" />
            <p className="mt-2">No listings yet. Be the first to give your decor a second life!</p>
          </div>
        )}
      </div>
    </div>
  );
}
