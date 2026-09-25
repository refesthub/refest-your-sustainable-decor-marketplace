import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/refest-logo.jpeg.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ReFest" },
      { name: "description", content: "Sign in to ReFest to post and manage your festival decoration listings." },
      { property: "og:title", content: "Sign in — ReFest" },
      { property: "og:description", content: "Join the ReFest community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const res = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    if (mode === "up" && !res.data.session) return toast.success("Check your email to confirm your account.");
    nav({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-10 text-center">
      <img src={logo.url} alt="ReFest logo" className="mx-auto h-40 w-40 rounded-full" />
      <h1 className="mt-4 text-2xl font-bold text-primary">{mode === "in" ? "Welcome back" : "Join ReFest"}</h1>
      <Button variant="outline" className="mt-6 w-full rounded-full" onClick={async () => {
        const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
        if (r.error) toast.error(String(r.error.message ?? r.error));
      }}>Continue with Google</Button>
      <div className="my-4 text-xs text-muted-foreground">or</div>
      <form onSubmit={submit} className="space-y-3 text-left">
        <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-full" />
        <Input type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-full" />
        <Button disabled={busy} className="w-full rounded-full">{mode === "in" ? "Sign in" : "Create account"}</Button>
      </form>
      <button className="mt-4 text-sm text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
      </button>
    </div>
  );
}
