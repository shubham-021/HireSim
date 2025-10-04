"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle(){
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if(!mounted) return null;
    const isDark = theme === "dark";
    return (
        <button
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground shadow hover:bg-accent"
        >
            {isDark ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 1 1-9.39-9.39 1 1 0 0 0-.14-1.05A1 1 0 0 0 9 2a10 10 0 1 0 13 13 1 1 0 0 0-.36-2Z"/></svg>
            ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6.76 4.84 5.34 3.42 3.91 4.84l1.42 1.42 1.43-1.42Zm10.45 14.32 1.41 1.42 1.42-1.42-1.41-1.41-1.42 1.41ZM12 4a1 1 0 0 0 1-1V1h-2v2a1 1 0 0 0 1 1Zm0 16a1 1 0 0 0-1 1v2h2v-2a1 1 0 0 0-1-1Zm8-8a1 1 0 0 0 1 1h2v-2h-2a1 1 0 0 0-1 1ZM3 13a1 1 0 0 0 1-1 1 1 0 0 0-1-1H1v2h2Zm14.24-8.16 1.42-1.42L17.24.99l-1.41 1.41 1.41 1.44ZM6.76 19.16l-1.42 1.42 1.43 1.42 1.41-1.41-1.42-1.43ZM12 6a6 6 0 1 0 .001 12.001A6 6 0 0 0 12 6Z"/></svg>
            )}
        </button>
    );
}


