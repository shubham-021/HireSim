"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function Hero(){
    return (
        <section className={cn("relative pt-18 md:pt-24 pb-10 md:pb-14") }>
            <div className={cn("absolute inset-0 -z-10") } />
            <div className={cn("mx-auto max-w-7xl px-4 md:px-6") }>
                <div className={cn("grid md:grid-cols-2 items-center", "gap-8 md:gap-12") }>
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl md:text-5xl font-semibold tracking-tight"
                        >
                            Ace your next interview with AI‑powered mock sessions
                        </motion.h1>
                        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-prose">
                            Practice real‑time interviews, get instant feedback, and refine your answers with structured guidance.
                        </p>
                        <div className={cn("mt-6 flex flex-wrap items-center gap-3") }>
                            <motion.a
                                href="/upload/resume"
                                whileTap={{ scale: 0.98 }}
                                className={cn("inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow hover:opacity-90 text-sm font-medium", "px-4 py-2")}
                            >
                                Upload resume
                            </motion.a>
                            <Link href="/sign-up" className={cn("text-sm hover:underline") }>
                                Create an account
                            </Link>
                        </div>
                        <div className={cn("mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground") }>
                            <div>Real‑time voice</div>
                            <div>Actionable feedback</div>
                            <div>No setup needed</div>
                        </div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className={cn("relative") }
                    >
                        <div className={cn("rounded-xl border bg-card text-card-foreground shadow p-4") }>
                            <div className={cn("aspect-video rounded-md bg-gradient-to-br from-primary/20 to-purple-500/10") } />
                            <div className={cn("mt-4 grid grid-cols-3 gap-3 text-xs text-muted-foreground") }>
                                <div className={cn("rounded-md border p-3") }>Resume insights</div>
                                <div className={cn("rounded-md border p-3") }>Live Q&A</div>
                                <div className={cn("rounded-md border p-3") }>Score & tips</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}


