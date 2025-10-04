"use client";
import { useEffect, useRef } from "react";

export default function Background(){
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext("2d");
        if(!ctx) return;

        let animationFrame = 0;
        const dpr = window.devicePixelRatio || 1;
        const resize = () => {
            canvas.width = Math.floor(window.innerWidth * dpr);
            canvas.height = Math.floor(window.innerHeight * dpr);
        };
        resize();
        window.addEventListener("resize", resize);

        const dots = Array.from({ length: 120 }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.25 * dpr,
            vy: (Math.random() - 0.5) * 0.25 * dpr,
            r: 1 + Math.random() * 1.5 * dpr,
        }));

        const loop = () => {
            animationFrame = requestAnimationFrame(loop);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "rgba(125, 125, 255, 0.35)";
            for(const d of dots){
                d.x += d.vx; d.y += d.vy;
                if(d.x < 0 || d.x > canvas.width) d.vx *= -1;
                if(d.y < 0 || d.y > canvas.height) d.vy *= -1;
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = "rgba(125, 125, 255, 0.18)";
            for(let i=0;i<dots.length;i++){
                for(let j=i+1;j<dots.length;j++){
                    const a = dots[i], b = dots[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist2 = dx*dx + dy*dy;
                    if(dist2 < (120*dpr)*(120*dpr)){
                        const alpha = 1 - dist2 / ((120*dpr)*(120*dpr));
                        ctx.globalAlpha = alpha * 0.6;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }
        };
        loop();

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 -z-10">
            <canvas ref={canvasRef} className="absolute inset-0 [mask-image:radial-gradient(70%_50%_at_50%_30%,black,transparent_80%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/25 via-transparent to-transparent" />
        </div>
    );
}


