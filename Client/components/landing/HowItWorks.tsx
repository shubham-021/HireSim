import { cn } from "@/lib/utils";

export default function HowItWorks(){
    const steps = [
        { step: 1, title: "Upload your resume", desc: "We analyze your experience and goals." },
        { step: 2, title: "Start a mock interview", desc: "Answer questions via real‑time audio." },
        { step: 3, title: "Get feedback & iterate", desc: "Review scores, insights, and suggested improvements." },
    ];
    return (
        <section id="how" className={cn("py-12 md:py-16 border-t") }>
            <div className={cn("mx-auto max-w-7xl px-4 md:px-6") }>
                <h2 className={cn("text-2xl md:text-3xl font-semibold tracking-tight") }>How it works</h2>
                <ol className={cn("mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6") }>
                    {steps.map((s) => (
                        <li key={s.step} className={cn("rounded-xl border bg-card p-6") }>
                            <div className={cn("text-xs text-muted-foreground") }>Step {s.step}</div>
                            <h3 className={cn("mt-1 font-medium") }>{s.title}</h3>
                            <p className={cn("mt-2 text-sm text-muted-foreground") }>{s.desc}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}


