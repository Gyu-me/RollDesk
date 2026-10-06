"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const themes = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme = "system", setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const currentTheme = themes.includes(theme as (typeof themes)[number])
    ? (theme as (typeof themes)[number])
    : "system";
  const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
  const Icon =
    currentTheme === "light" ? Sun : currentTheme === "dark" ? Moon : Monitor;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={
        mounted
          ? `현재 ${currentTheme} 테마. ${nextTheme} 테마로 변경`
          : "테마 변경"
      }
    >
      <Icon aria-hidden="true" className="size-4" />
    </Button>
  );
}
