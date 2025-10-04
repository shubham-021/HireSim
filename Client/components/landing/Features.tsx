import { cn } from "@/lib/utils";

export default function Features(){
    const items = [
        { title: "Voice interview simulation", desc: "Practice conversationally with real‑time audio, just like a real interview." },
        { title: "Instant, actionable feedback", desc: "Receive structured scoring, highlights, and improvement tips after each session." },
        { title: "Resume‑aware questions", desc: "Questions adapt based on your uploaded resume and target role." },
    ];
    return (
        <section id="features" className={cn("py-12 md:py-16") }>
            <div className={cn("mx-auto max-w-7xl px-4 md:px-6") }>
                <h2 className={cn("text-2xl md:text-3xl font-semibold tracking-tight") }>Everything you need to practice effectively</h2>
                <div className={cn("mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6") }>
                    {items.map((f) => (
                        <div key={f.title} className={cn("rounded-xl border bg-card p-6") }>
                            <h3 className={cn("font-medium") }>{f.title}</h3>
                            <p className={cn("mt-2 text-sm text-muted-foreground") }>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


