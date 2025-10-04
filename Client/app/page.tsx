import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { cn } from "@/lib/utils";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";

export default function Home(){
    return (
        <div className={cn("min-h-dvh flex flex-col") }>
            <Navbar/>
            <main className={cn("flex-1", "pt-14 md:pt-16") }>
                <Hero/>
                <Features/>
                <HowItWorks/>
                <Pricing/>
                <Testimonials/>
                <CTA/>
            </main>
            <Footer/>
        </div>
    );
}