import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES, CITIES, CONDITIONS, LISTING_TYPES } from "@/lib/refest";

export const Route = createFileRoute("/_authenticated/post")({
  head: () => ({
    meta: [
      { title: "Post a listing — ReFest" },
      { name: "description", content: "List your festival decorations to sell, rent, exchange or donate." },
      { property: "og:title", content: "Post a listing — ReFest" },
      { property: "og:description", content: "Give your decorations a second life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PostPage,
});

const sel = "h-10 w-full rounded-xl border bg-card px-3 text-sm";

function PostPage() {
  const { user } = Route.useRouteContext();
  const nav = useNavigate();
  const [type, setType] = useState("sell");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!f.get("whatsapp") && !f.get("telegram")) { toast.error("Add a WhatsApp number or Telegram username."); return; }
    setBusy(true);
    try {
      const photos: string[] = [];
      for (const file of files.slice(0, 6)) {
        const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.]/g, "")}`;
        const up = await supabase.storage.from("listing-photos").upload(path, file);
        if (up.error) throw up.error;
        const { data, error } = await supabase.storage.from("listing-photos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
        if (error) throw error;
        photos.push(data.signedUrl);
      }
      const price = f.get("price") ? Number(f.get("price")) : null;
      const { error } = await supabase.from("listings").insert({
        user_id: user.id, title: String(f.get("title")), description: String(f.get("description") ?? ""),
        category: String(f.get("category")), listing_type: type, price: type === "donate" || type === "exchange" ? null : price,
        city: String(f.get("city")), area: String(f.get("area") ?? ""), condition: String(f.get("condition")),
        whatsapp: String(f.get("whatsapp") || "") || null, telegram: String(f.get("telegram") || "") || null, photos,
      });
      if (error) throw error;
      toast.success("Submitted! Your listing will appear once an admin approves it.");
      nav({ to: "/my-listings" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <h1 className="text-3xl font-bold text-primary">Post a listing</h1>
      <p className="text-sm text-muted-foreground">Listings are reviewed by our team before going live.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {LISTING_TYPES.map((t) => (
            <button type="button" key={t.value} onClick={() => setType(t.value)}
              className={`rounded-xl border py-2 text-sm font-semibold ${type === t.value ? "border-primary bg-primary text-primary-foreground" : "bg-card text-primary"}`}>{t.label}</button>
          ))}
        </div>
        <Input name="title" required placeholder="Title, e.g. Eco-friendly makhar, 4 ft" />
        <Textarea name="description" placeholder="Describe size, material, what's included…" rows={4} />
        <div className="grid grid-cols-2 gap-3">
          <select name="category" className={sel} required>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <select name="condition" className={sel}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select>
          <select name="city" className={sel}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
          <Input name="area" placeholder="Area, e.g. Kothrud" />
        </div>
        {(type === "sell" || type === "rent") && <Input name="price" type="number" min={0} placeholder={type === "rent" ? "Rent per day (₹)" : "Price (₹)"} />}
        <div className="grid grid-cols-2 gap-3">
          <Input name="whatsapp" placeholder="WhatsApp number" />
          <Input name="telegram" placeholder="Telegram @username" />
        </div>
        <div>
          <label className="text-sm font-semibold">Photos (up to 6)</label>
          <Input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        </div>
        <Button disabled={busy} size="lg" className="w-full rounded-full">{busy ? "Submitting…" : "Submit for approval"}</Button>
      </form>
    </div>
  );
}
