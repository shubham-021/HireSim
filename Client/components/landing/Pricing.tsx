import { cn } from "@/lib/utils";

const tiers = [
    {
        name: "Starter",
        price: "$0",
        period: "/mo",
        features: ["2 mock interviews", "Basic feedback", "Email support"],
        cta: "Get started",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$12",
        period: "/mo",
        features: ["Unlimited interviews", "Resume‑aware questions", "Advanced insights"],
        cta: "Go Pro",
        highlighted: true,
    },
    {
        name: "Team",
        price: "$29",
        period: "/mo",
        features: ["Seats for 5", "Shared history", "Priority support"],
        cta: "Contact sales",
        highlighted: false,
    },
];

export default function Pricing(){
    return (
        <section id="pricing" className={cn("py-12 md:py-16 border-t") }>
            <div className={cn("mx-auto max-w-7xl px-4 md:px-6") }>
                <h2 className={cn("text-2xl md:text-3xl font-semibold tracking-tight") }>Simple pricing</h2>
                <p className={cn("mt-1 text-sm text-muted-foreground") }>Start free, upgrade anytime.</p>
                <div className={cn("mt-8 grid grid-cols-1 md:grid-cols-3 gap-6") }>
                    {tiers.map((t) => (
                        <div key={t.name} className={cn("rounded-2xl border bg-card text-card-foreground p-6", t.highlighted && "ring-2 ring-primary") }>
                            <div className={cn("flex items-end gap-2") }>
                                <div className={cn("text-xl font-semibold") }>{t.name}</div>
                            </div>
                            <div className={cn("mt-2 flex items-baseline gap-1") }>
                                <div className={cn("text-3xl font-semibold") }>{t.price}</div>
                                <div className={cn("text-sm text-muted-foreground") }>{t.period}</div>
                            </div>
                            <ul className={cn("mt-4 text-sm space-y-2") }>
                                {t.features.map((f) => (
                                    <li key={f} className={cn("flex items-center gap-2") }>
                                        <span className={cn("h-1.5 w-1.5 rounded-full bg-primary") } />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <a href="/sign-up" className={cn("mt-6 inline-flex items-center justify-center rounded-md text-sm font-medium", t.highlighted ? "bg-primary text-primary-foreground hover:opacity-90" : "border hover:bg-accent", "px-4 py-2") }>
                                {t.cta}
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


