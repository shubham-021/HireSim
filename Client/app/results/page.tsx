"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { reviewStore } from "@/store/store"

const sample = {
    score: 78,
    remarks: "Strong communication and problem-solving. Improve on system design depth.",
    highlights: ["Clear articulation", "Good examples", "Structured answers"],
    improvements: ["Dive deeper into trade-offs", "Practice follow-up questioning"],
    questions: [
        { q: "Explain event loops in JS", a: "...", feedback: "Good overview; add microtask detail." },
        { q: "Design a URL shortener", a: "...", feedback: "Missing data partitioning details." },
        { q: "Concurrency vs parallelism", a: "...", feedback: "Strong." }
    ]
};

export default function Results(){
    const reviewData = reviewStore(state => state);
    console.log("Review Data:", reviewData);
    return (
        <div className={cn("min-h-dvh flex flex-col") }>
            <main className={cn("flex-1 pt-16") }>
                <section className={cn("border-b bg-gradient-to-b from-primary/10 to-transparent") }>
                    <div className={cn("mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10") }>
                        <h1 className={cn("text-2xl md:text-3xl font-semibold tracking-tight") }>Interview results</h1>
                        <p className={cn("mt-1 text-sm text-muted-foreground max-w-2xl") }>Your score, remarks and per‑question review.</p>
                    </div>
                </section>
                <div className={cn("mx-auto max-w-6xl px-4 md:px-6 py-8 grid lg:grid-cols-3 gap-6") }>
                    <div className={cn("lg:col-span-1 rounded-2xl border bg-card text-card-foreground shadow p-6") }>
                        <div className={cn("text-sm text-muted-foreground") }>Overall score</div>
                        <div className={cn("mt-4 flex items-end gap-4") }>
                            <div className={cn("relative h-24 w-24") }>
                                <svg viewBox="0 0 36 36" className={cn("h-24 w-24 -rotate-90") }>
                                    <path d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4"/>
                                    <path d="M18 2a16 16 0 1 1 0 32" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray={`${sample.score},100`} />
                                </svg>
                                <div className={cn("absolute inset-0 grid place-items-center text-xl font-semibold") }>{sample.score}</div>
                            </div>
                        </div>
                        <div className={cn("mt-4 text-sm") }>{sample.remarks}</div>
                        <div className={cn("mt-6 grid grid-cols-2 gap-3 text-sm") }>
                            <div className={cn("rounded-md border p-3") }>
                                <div className={cn("text-xs text-muted-foreground") }>Highlights</div>
                                <ul className={cn("mt-2 list-disc pl-4 space-y-1") }>
                                    {sample.highlights.map((h) => <li key={h}>{h}</li>)}
                                </ul>
                            </div>
                            <div className={cn("rounded-md border p-3") }>
                                <div className={cn("text-xs text-muted-foreground") }>Improvements</div>
                                <ul className={cn("mt-2 list-disc pl-4 space-y-1") }>
                                    {sample.improvements.map((h) => <li key={h}>{h}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className={cn("lg:col-span-2 rounded-2xl border bg-card text-card-foreground shadow p-6") }>
                        <h1 className={cn("text-xl md:text-2xl font-semibold") }>Interview review</h1>
                        <div className={cn("mt-4 divide-y") }>
                            {sample.questions.map((qa, idx) => (
                                <div key={idx} className={cn("py-4") }>
                                    <div className={cn("text-sm text-muted-foreground") }>Question</div>
                                    <div className={cn("font-medium") }>{qa.q}</div>
                                    <div className={cn("mt-2 text-sm text-muted-foreground") }>Your answer</div>
                                    <div className={cn("") }>{qa.a}</div>
                                    <div className={cn("mt-2 text-sm text-muted-foreground") }>Feedback</div>
                                    <div>{qa.feedback}</div>
                                </div>
                            ))}
                        </div>
                        <div className={cn("mt-6 flex items-center gap-3") }>
                            <Link href="/history" className={cn("inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90", "px-4 py-2") }>
                                View history
                            </Link>
                            <Link href="/" className={cn("inline-flex items-center justify-center rounded-md border text-sm font-medium hover:bg-accent", "px-4 py-2") }>
                                Back to home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


