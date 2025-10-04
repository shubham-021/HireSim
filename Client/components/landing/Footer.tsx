import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Footer(){
    return (
        <footer className={cn("border-t py-8 md:py-10") }>
            <div className={cn("mx-auto max-w-7xl px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground") }>
                <div className={cn("flex items-center gap-2") }>
                    <span className={cn("h-6 w-6 rounded-md bg-primary inline-flex items-center justify-center text-primary-foreground text-xs font-semibold") }>HI</span>
                    <span>© {new Date().getFullYear()} HireSim</span>
                </div>
                <div className={cn("flex items-center gap-6") }>
                    <Link href="/sign-in" className={cn("hover:underline") }>Sign in</Link>
                    <Link href="/sign-up" className={cn("hover:underline") }>Sign up</Link>
                </div>
            </div>
        </footer>
    );
}


