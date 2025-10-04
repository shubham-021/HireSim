import { cn } from "@/lib/utils";

const quotes = [
    { name: "Aarav Shah", role: "SWE @ Fintech", text: "HireSim felt like the real thing. The feedback helped me jump 10 points in a week." },
    { name: "Nisha Verma", role: "Frontend @ SaaS", text: "Loved the resume-aware questions. Way better than generic prep." },
    { name: "Rahul Iyer", role: "Fullstack @ Startup", text: "The instant tips are gold. I finally learned to structure my answers." },
];

export default function Testimonials(){
    return (
        <section id="testimonials" className={cn("py-12 md:py-16 border-t") }>
            <div className={cn("mx-auto max-w-7xl px-4 md:px-6") }>
                <h2 className={cn("text-2xl md:text-3xl font-semibold tracking-tight") }>What candidates say</h2>
                <div className={cn("mt-8 grid grid-cols-1 md:grid-cols-3 gap-6") }>
                    {quotes.map((q) => (
                        <figure key={q.name} className={cn("rounded-2xl border bg-card text-card-foreground p-6") }>
                            <blockquote className={cn("text-sm text-muted-foreground") }>{q.text}</blockquote>
                            <figcaption className={cn("mt-4") }>
                                <div className={cn("font-medium") }>{q.name}</div>
                                <div className={cn("text-xs text-muted-foreground") }>{q.role}</div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}


