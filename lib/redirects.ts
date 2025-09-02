export function safeRedirect(to?: string | null, fallback: string = "/dashboard") {
  if (!to) return fallback;
  try {
    const url = new URL(to, "http://localhost"); // base to validate
    const path = url.pathname + (url.search || "");
    // prevent open redirects
    if (!path.startsWith("/")) return fallback;
    const banned = ["/auth/callback", "/login", "/signup"];
    return banned.includes(path) ? fallback : path;
  } catch {
    return fallback;
  }
}
