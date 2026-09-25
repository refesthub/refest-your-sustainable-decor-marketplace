import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const LISTING_TYPES = [
  { value: "sell", label: "Sell" },
  { value: "rent", label: "Rent" },
  { value: "exchange", label: "Exchange" },
  { value: "donate", label: "Donate" },
] as const;
export const CITIES = ["Pune", "Mumbai"] as const;
export const CATEGORIES = [
  "Makhar / Mandap", "Backdrops", "Lighting", "Artificial Flowers", "Thermocol-free Decor",
  "Eco-friendly Murti", "Pooja Items", "Fabric & Drapes", "Other",
];
export const CONDITIONS = ["Like New", "Good", "Used"];

export type Listing = {
  id: string; user_id: string; title: string; description: string; category: string;
  listing_type: string; price: number | null; city: string; area: string; condition: string;
  photos: string[]; whatsapp: string | null; telegram: string | null; status: string; created_at: string;
};

export function priceLabel(l: Pick<Listing, "listing_type" | "price">) {
  if (l.listing_type === "donate") return "Free";
  if (l.listing_type === "exchange") return "Exchange";
  if (l.price == null) return "Ask";
  return `₹${Number(l.price).toLocaleString("en-IN")}${l.listing_type === "rent" ? " / day" : ""}`;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const load = async (u: User | null) => {
      setUser(u);
      if (u) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id).eq("role", "admin");
        setIsAdmin(!!data?.length);
      } else setIsAdmin(false);
      setReady(true);
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { load(s?.user ?? null); });
    supabase.auth.getSession().then(({ data }) => load(data.session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, isAdmin, ready };
}
