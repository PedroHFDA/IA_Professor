"use client";

import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "ia-professor-theme";
const themes: { value: Theme; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (savedTheme && themes.some((item) => item.value === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = theme === "dark" || (theme === "system" && prefersDark);

    root.classList.remove("light", "dark");
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", shouldUseDark);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-1 rounded-xl border bg-card/80 p-1 shadow-sm">
      {themes.map((item) => (
        <Button
          key={item.value}
          type="button"
          size="sm"
          variant={theme === item.value ? "default" : "ghost"}
          onClick={() => setTheme(item.value)}
          className="h-8 px-2.5"
          aria-label={`Usar tema ${item.label}`}
        >
          <item.icon className="size-3.5" />
          <span className="hidden sm:inline">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}
