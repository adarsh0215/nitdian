// app/api/log-event/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEDUPE_MS = 15_000;
const ALLOWED_ACTIONS = new Set(["sign_in", "sign_out", "sign_up"]);

function getEnvVar(name: string | undefined): string | null {
  return name && name.length ? name : null;
}

export async function POST(req: Request) {
  const SUPABASE_URL = getEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const SUPABASE_SERVICE_ROLE_KEY = getEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("log-event: missing SUPABASE env vars");
    return NextResponse.json({ error: "Server misconfigured: missing supabase key" }, { status: 500 });
  }

  const supabaseServer = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

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
        console.error("log-event: select error (user_id)", error?.message ?? error);
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
        console.error("log-event: select error (user_email)", error?.message ?? error);
      } else if (data && data.length > 0) {
        duplicateFound = true;
      }
    }

    if (duplicateFound) {
      return NextResponse.json({ success: true, skipped: true }, { status: 200 });
    }

    // Define a type for the inserted row
    type InsertedRow = { id: number };

    const { data: insertData, error: insertError } = await supabaseServer
      .from("login_history")
      .insert([payload])
      .select("id")
      .limit(1);

    if (insertError) {
      console.error("log-event: insert error", insertError?.message ?? insertError);
      return NextResponse.json({ error: String(insertError?.message ?? "insert failed") }, { status: 500 });
    }

    const insertedId =
      Array.isArray(insertData) && insertData.length > 0
        ? (insertData[0] as InsertedRow).id
        : null;

    return NextResponse.json({ success: true, skipped: false, id: insertedId }, { status: 201 });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("log-event: unhandled error", errMsg);
    return NextResponse.json({ error: errMsg || "internal" }, { status: 500 });
  }
}
