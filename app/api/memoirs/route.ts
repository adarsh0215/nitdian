import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Call the async factory and await the Supabase client
    const supabase = await supabaseServer();

    // Now supabase is a real client, so .from works
    const { data, error } = await supabase
      .from("memoirs")
      .select(
        "id, created_at, email, name, batch, branch, role_company, message, show_on_main_page, priority_seq, date_approved"
      )
      .eq("active", true)
      .not("date_approved", "is", null)
      .order("priority_seq", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.log("Fetched memoirs:", data);
    return NextResponse.json({ memoirs: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
