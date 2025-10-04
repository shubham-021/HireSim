"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Navbar(){
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const isLanding = pathname === "/";
    return (
        <header className={cn("fixed top-0 left-0 right-0 z-50") }>
            <div className={cn("mx-auto max-w-7xl px-3 md:px-4") }>
                <div className={cn(
                    "mt-2 md:mt-3 h-10 md:h-12",
                    "rounded-full border bg-card text-card-foreground",
                    "shadow-lg shadow-primary/10",
                    "flex items-center justify-between gap-2 md:gap-3 px-2.5 md:px-3"
                )}>
                    <Link href="/" className={cn("flex items-center gap-2 min-w-0") }>
                        <span className={cn("inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold", "h-5 w-5 md:h-6 md:w-6 text-[10px]")}>HI</span>
                        <span className={cn("font-semibold truncate", "text-xs md:text-sm")}>HireSim</span>
                    </Link>
                    <nav className={cn("hidden md:flex items-center text-sm", "gap-5 lg:gap-7") }>
                        <Link href="#features" className={cn("hover:text-primary")}>Features</Link>
                        <Link href="#pricing" className={cn("hover:text-primary")}>Pricing</Link>
                        <Link href="#testimonials" className={cn("hover:text-primary")}>Testimonials</Link>
                        <SignedOut>
                            <Link href="/sign-in" className={cn("hover:text-primary")}>Sign in</Link>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard" className={cn("hover:text-primary")}>Dashboard</Link>
                        </SignedIn>
                    </nav>
                    <div className={cn("relative flex items-center", "gap-1.5 md:gap-2.5") }>
                        <ThemeToggle/>
                        <SignedIn>
                            <Link href="/dashboard" className={cn("inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-xs md:text-sm font-medium hover:opacity-90", "px-2.5 py-1 md:px-3 md:py-1.5") }>
                                Dashboard
                            </Link>
                            {!isLanding && (
                                <div className={cn("relative") }>
                                    <button
                                        aria-label="Open settings"
                                        onClick={() => setOpen((v) => !v)}
                                        className={cn("inline-flex h-7 w-7 items-center justify-center rounded-md border hover:bg-accent") }
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm2 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg>
                                    </button>
                                    {open && (
                                        <div className={cn("absolute right-0 mt-2 w-52 rounded-md border bg-card text-card-foreground shadow p-2 z-50") }>
                                            <div className={cn("px-2 py-1 text-xs text-muted-foreground") }>Settings</div>
                                            <div className={cn("px-2 py-2 flex items-center justify-between") }>
                                                <span className={cn("text-sm") }>Theme</span>
                                                <ThemeToggle/>
                                            </div>
                                            <Link href="/dashboard" onClick={() => setOpen(false)} className={cn("block rounded-md px-2 py-2 text-sm hover:bg-accent") }>Profile</Link>
                                            <SignOutButton>
                                                <button className={cn("w-full rounded-md px-2 py-2 text-left text-sm hover:bg-accent") }>Sign out</button>
                                            </SignOutButton>
                                        </div>
                                    )}
                                </div>
                            )}
                        </SignedIn>
                        <SignedOut>
                            <motion.a
                                href="/sign-in"
                                whileTap={{ scale: 0.98 }}
                                className={cn("inline-flex items-center justify-center rounded-md border text-xs md:text-sm font-medium hover:bg-accent", "px-2.5 py-1 md:px-3 md:py-1.5")}
                            >
                                Sign in
                            </motion.a>
                            <motion.a
                                href="/upload/resume"
                                whileTap={{ scale: 0.98 }}
                                className={cn("hidden md:inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow hover:opacity-90 text-xs md:text-sm font-medium", "px-2.5 py-1 md:px-3 md:py-1.5")}
                            >
                                Get started
                            </motion.a>
                        </SignedOut>
                    </div>
                </div>
            </div>
        </header>
    );
}


