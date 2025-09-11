"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // mounted guard to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-9 w-9"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Avoid rendering lucide SVG on the server — use a neutral span placeholder */}
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5" aria-hidden />
        ) : (
          <Moon className="h-5 w-5" aria-hidden />
        )
      ) : (
        // plain span is deterministic and won't differ between server/client
        <span className="inline-block h-5 w-5" aria-hidden />
      )}

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
