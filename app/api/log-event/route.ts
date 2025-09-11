// app/api/log-event/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("log-event: missing SUPABASE env vars");
}

const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// dedupe window in milliseconds
const DEDUPE_MS = 15_000;
const ALLOWED_ACTIONS = new Set(["sign_in", "sign_out", "sign_up"]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { user_id = null, user_email = null, action } = body as {
      user_id?: string | null;
      user_email?: string | null;
      action?: string | null;
    };

    if (!action || typeof action !== "string" || !ALLOWED_ACTIONS.has(action)) {
      return NextResponse.json({ error: "Invalid or missing action" }, { status: 400 });
    }

    const payload = { user_id, user_email, action };
    const sinceIso = new Date(Date.now() - DEDUPE_MS).toISOString();

    // Check for recent duplicate (prefer user_id, fallback user_email)
    let duplicateFound = false;
    if (user_id) {
      const { data, error } = await supabaseServer
        .from("login_history")
        .select("id")
        .eq("user_id", user_id)
        .eq("action", action)
        .gte("created_at", sinceIso)
        .limit(1);

      if (error) {
        console.error("log-event: select error (user_id)", error);
      } else if (data && data.length > 0) {
        duplicateFound = true;
      }
    } else if (user_email) {
      const { data, error } = await supabaseServer
        .from("login_history")
        .select("id")
        .eq("user_email", user_email)
        .eq("action", action)
        .gte("created_at", sinceIso)
        .limit(1);

      if (error) {
        console.error("log-event: select error (user_email)", error);
      } else if (data && data.length > 0) {
        duplicateFound = true;
      }
    }

    if (duplicateFound) {
      return NextResponse.json({ success: true, skipped: true }, { status: 200 });
    }

    // Insert and return inserted id for observability
    const { data: insertData, error: insertError } = await supabaseServer
      .from("login_history")
      .insert([payload])
      .select("id")
      .limit(1);

    if (insertError) {
      console.error("log-event: insert error", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const insertedId = Array.isArray(insertData) && insertData.length > 0 ? insertData[0].id ?? null : null;
    return NextResponse.json({ success: true, skipped: false, id: insertedId }, { status: 201 });
  } catch (err: any) {
    console.error("log-event: unhandled error", err);
    return NextResponse.json({ error: err?.message || "internal" }, { status: 500 });
  }
}
