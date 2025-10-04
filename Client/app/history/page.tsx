"use client";
import { cn } from "@/lib/utils";

const mock = [
    { id: "INT-001", date: "2025-08-25", role: "Frontend Dev", score: 72, remarks: "Good JS, improve CSS architecture" },
    { id: "INT-002", date: "2025-09-01", role: "Fullstack", score: 80, remarks: "Solid; expand testing depth" },
    { id: "INT-003", date: "2025-09-10", role: "Frontend Dev", score: 76, remarks: "Great UX discussion" },
    { id: "INT-004", date: "2025-09-14", role: "Frontend Dev", score: 83, remarks: "Improved system design" },
];

export default function History(){
    const maxScore = 100;
    const points = mock.map((m, i) => {
        const x = (i/(mock.length-1)) * 100;
        const y = 100 - (m.score/maxScore) * 100;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className={cn("min-h-dvh flex flex-col") }>
            <main className={cn("flex-1 pt-16") }>
                <section className={cn("border-b bg-gradient-to-b from-primary/10 to-transparent") }>
                    <div className={cn("mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10") }>
                        <h1 className={cn("text-2xl md:text-3xl font-semibold tracking-tight") }>Interview history</h1>
                        <p className={cn("mt-1 text-sm text-muted-foreground max-w-2xl") }>Track your progress over time.</p>
                    </div>
                </section>
                <div className={cn("mx-auto max-w-6xl px-4 md:px-6 py-8 grid lg:grid-cols-3 gap-6") }>
                    <div className={cn("lg:col-span-2 rounded-2xl border bg-card text-card-foreground shadow p-6") }>
                        <h1 className={cn("text-xl md:text-2xl font-semibold") }>Progress</h1>
                        <div className={cn("mt-4 rounded-lg border p-4 bg-muted/30") }>
                            <svg viewBox="0 0 100 100" className={cn("w-full h-44 md:h-64") } preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                                    </linearGradient>
                                </defs>
                                <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" points={points} />
                                <polygon fill="url(#g)" stroke="none" points={`0,100 ${points} 100,100`} />
                            </svg>
                        </div>
                    </div>
                    <div className={cn("lg:col-span-1 rounded-2xl border bg-card text-card-foreground shadow p-6") }>
                        <h2 className={cn("font-medium") }>Past interviews</h2>
                        <div className={cn("mt-3 space-y-3 text-sm") }>
                            {mock.map((m) => (
                                <div key={m.id} className={cn("rounded-md border p-4 hover:bg-accent/50 transition-colors") }>
                                    <div className={cn("flex items-center justify-between") }>
                                        <div className={cn("font-medium") }>{m.role}</div>
                                        <div className={cn("text-xs text-muted-foreground") }>{m.date}</div>
                                    </div>
                                    <div className={cn("mt-1 flex items-center justify-between") }>
                                        <div className={cn("text-xs text-muted-foreground") }>{m.id}</div>
                                        <div className={cn("font-medium") }>{m.score}</div>
                                    </div>
                                    <div className={cn("mt-1 text-xs text-muted-foreground") }>{m.remarks}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


