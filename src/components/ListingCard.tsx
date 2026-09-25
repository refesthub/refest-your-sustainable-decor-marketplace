import { Link } from "@tanstack/react-router";
import { MapPin, Leaf } from "lucide-react";
import { priceLabel, type Listing } from "@/lib/refest";

export function ListingCard({ l }: { l: Listing }) {
  return (
    <Link to="/listing/$id" params={{ id: l.id }} className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-muted">
        {l.photos[0] ? (
          <img src={l.photos[0]} alt={l.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/40"><Leaf className="h-10 w-10" /></div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold capitalize text-accent-foreground">{l.listing_type}</span>
      </div>
      <div className="p-3">
        <div className="font-display text-lg font-bold text-primary">{priceLabel(l)}</div>
        <div className="line-clamp-1 font-semibold">{l.title}</div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{[l.area, l.city].filter(Boolean).join(", ")}</div>
      </div>
    </Link>
  );
}
