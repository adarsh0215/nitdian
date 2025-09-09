import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

// Service-role client (server only) — bypasses RLS safely.
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

type Body = {
  action: "sign_in" | "sign_out";
  user_id: string;
  user_email?: string | null;
  at?: string; // optional ISO timestamp
};

export async function POST(req: Request) {
  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 }); }

  const { action, user_id, user_email, at } = body ?? {};
  if (action !== "sign_in" && action !== "sign_out")
    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  if (!user_id || typeof user_id !== "string")
    return NextResponse.json({ ok: false, error: "user_id required" }, { status: 400 });

  const created_at = at ? new Date(at).toISOString() : new Date().toISOString();

  const { error } = await admin.from("login_history").insert({
    user_id,
    user_email: user_email ?? null,
    action,
    created_at,
  });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
