"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function CTA(){
    return (
        <section className={cn("py-12 md:py-16") }>
            <div className={cn("mx-auto max-w-7xl px-4 md:px-6") }>
                <div className={cn("rounded-2xl border bg-gradient-to-br from-primary/10 to-purple-500/10 p-8 md:p-10 text-center") }>
                    <h3 className={cn("text-2xl md:text-3xl font-semibold") }>Ready to practice smarter?</h3>
                    <p className={cn("mt-2 text-muted-foreground") }>Upload your resume and start a mock interview in minutes.</p>
                    <motion.a
                        href="/upload/resume"
                        whileTap={{ scale: 0.98 }}
                        className={cn("mt-6 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow hover:opacity-90 text-sm font-medium", "px-4 py-2")}
                    >
                        Start now
                    </motion.a>
                </div>
            </div>
        </section>
    );
}


