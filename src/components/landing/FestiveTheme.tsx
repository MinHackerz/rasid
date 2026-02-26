'use client';

import React, { useEffect, useState, useRef } from 'react';

interface FestiveThemeProps {
    themeName: string | null;
    themeEmojis: string | null;  // comma-separated emojis
    themeColors: string | null;  // JSON array of hex colors
    themeIntensity: string;      // "subtle" | "medium" | "festive"
}

/**
 * Renders floating emoji particles + optional color glow overlays
 * on the homepage based on admin-configured occasion theme.
 */
export default function FestiveTheme({ themeName, themeEmojis, themeColors, themeIntensity }: FestiveThemeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

    const emojis = themeEmojis?.split(',').map(e => e.trim()).filter(Boolean) || [];
    let colors: string[] = [];
    try {
        colors = themeColors ? JSON.parse(themeColors) : [];
    } catch { }

    const particleCount = themeIntensity === 'subtle' ? 15 : themeIntensity === 'festive' ? 45 : 28;
    const glowOpacity = themeIntensity === 'subtle' ? 0.08 : themeIntensity === 'festive' ? 0.25 : 0.15;

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ w: window.innerWidth, h: window.innerHeight });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || emojis.length === 0 || dimensions.w === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = dimensions.w;
        canvas.height = dimensions.h;

        interface Particle {
            x: number;
            y: number;
            emoji: string;
            size: number;
            speed: number;
            wobbleAmt: number;
            wobbleSpeed: number;
            rotation: number;
            rotSpeed: number;
            opacity: number;
            phase: number;
            depth: number;
        }

        const particles: Particle[] = Array.from({ length: particleCount }, () => {
            const depth = Math.random(); // 0 = back, 1 = front
            return {
                x: Math.random() * dimensions.w,
                y: dimensions.h + 50 + Math.random() * dimensions.h, // start below screen
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                size: (12 + Math.random() * 20) * (depth + 0.5), // larger if in front
                speed: (0.4 + Math.random() * 1.5) * (depth + 0.5), // faster if in front
                wobbleAmt: 15 + Math.random() * 40,
                wobbleSpeed: 0.005 + Math.random() * 0.015,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.015,
                opacity: 0.3 + depth * 0.6, // more opaque if in front
                phase: Math.random() * Math.PI * 2,
                depth,
            };
        });

        let animId: number;
        let t = 0;

        function draw() {
            ctx!.clearRect(0, 0, dimensions.w, dimensions.h);
            t += 1;

            for (const p of particles) {
                // Float upwards
                p.y -= p.speed;
                p.rotation += p.rotSpeed;
                const wobbleX = Math.sin(t * p.wobbleSpeed + p.phase) * p.wobbleAmt;

                // Reset particle to bottom when it floats off the top
                if (p.y < -50) {
                    p.y = dimensions.h + 50;
                    p.x = Math.random() * dimensions.w;
                }

                ctx!.save();
                ctx!.globalAlpha = p.opacity;
                ctx!.translate(p.x + wobbleX, p.y);
                ctx!.rotate(p.rotation);

                // Add soft shadow for depth
                ctx!.shadowColor = 'rgba(0, 0, 0, 0.15)';
                ctx!.shadowBlur = 8;
                ctx!.shadowOffsetX = 0;
                ctx!.shadowOffsetY = 4;

                ctx!.font = `${p.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
                ctx!.textAlign = 'center';
                ctx!.textBaseline = 'middle';
                ctx!.fillText(p.emoji, 0, 0);
                ctx!.restore();
            }

            animId = requestAnimationFrame(draw);
        }

        draw();

        return () => cancelAnimationFrame(animId);
    }, [dimensions, emojis.join(','), particleCount]);

    if (emojis.length === 0 && colors.length === 0) return null;

    return (
        <>
            {/* Ambient Background Glow */}
            {colors.length > 0 && (
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-1000 mix-blend-screen opacity-70">
                    {colors.slice(0, 3).map((color, i) => {
                        const positions = [
                            { top: '-15%', left: '-5%' },
                            { bottom: '-15%', right: '-5%' },
                            { top: '25%', left: '40%' },
                        ];
                        const pos = positions[i] || positions[0];
                        return (
                            <div
                                key={i}
                                className="absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-0"
                                style={{
                                    ...pos,
                                    backgroundColor: color,
                                    opacity: glowOpacity,
                                    animation: `festive-glow ${8 + i * 2}s ease-in-out infinite alternate`,
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Floating emoji particles */}
            {emojis.length > 0 && (
                <canvas
                    ref={canvasRef}
                    className="fixed inset-0 z-[1] pointer-events-none"
                    style={{ width: '100%', height: '100%' }}
                />
            )}

            <style jsx>{`
                @keyframes festive-float {
                    0% { transform: translate(-50%, 0px); }
                    100% { transform: translate(-50%, -12px); }
                }
                @keyframes festive-glow {
                    0% { transform: scale(0.8) translate(0, 0); opacity: ${glowOpacity * 0.7}; }
                    50% { transform: scale(1.1) translate(20px, -20px); opacity: ${glowOpacity}; }
                    100% { transform: scale(0.9) translate(-20px, 20px); opacity: ${glowOpacity * 0.8}; }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </>
    );
}
