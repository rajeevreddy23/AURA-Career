'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Play, ArrowRight, Star, Users, BookOpen, GraduationCap } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background z-[1]" />
      <div className="absolute inset-0 bg-grid-dark opacity-30 z-[1]" />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/15 rounded-full blur-[80px] animate-pulse-soft" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <Badge variant="primary" size="md" className="animate-bounce-gentle">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                AI-Powered Learning Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Your Personal{' '}
                <span className="text-gradient">AI University</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                Learn any subject with an intelligent AI professor that teaches
                step by step, like a real human instructor. Interactive whiteboard,
                live classroom voice lessons, and personalized AI chat support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/auth/register">
                <Button variant="primary" size="xl" className="group text-base">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/classroom">
                <Button variant="outline" size="xl" className="text-base gap-2">
                  <Play className="h-5 w-5" />
                  Join Live Classroom
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 sm:gap-10 pt-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted" />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">4.9</span>
                  <span className="text-muted-foreground">(12K+)</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="text-foreground font-semibold">50K+</span> Students
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-foreground font-semibold">500+</span> Courses
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-foreground font-semibold">10K+</span> Certificates
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right - AI Teacher Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/10">
              <div className="aspect-[4/3] relative">
                {/* Whiteboard Preview */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                  {/* Board content simulation */}
                  <div className="p-8 space-y-4">
                    <div className="h-2 w-24 bg-primary/60 rounded" />
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-foreground/10 rounded" />
                      <div className="h-2 w-3/4 bg-foreground/10 rounded" />
                      <div className="h-2 w-5/6 bg-foreground/10 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <div className="h-8 w-full rounded bg-primary/10" />
                        <div className="h-8 w-full rounded bg-primary/10" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-8 w-full rounded bg-purple-500/10" />
                        <div className="h-8 w-full rounded bg-purple-500/10" />
                      </div>
                    </div>
                    <div className="h-20 w-full rounded bg-cyan-500/5 border border-cyan-500/10" />
                  </div>
                </div>

                {/* AI Assistant Floating */}
                <Link href="/ai-teacher" title="Meet the AI Teacher" className="absolute bottom-4 right-4 group/ai">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/30 animate-float group-hover/ai:scale-110 transition-transform">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </Link>

                {/* Play button overlay */}
                <Link href="/classroom?course=1" className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity cursor-pointer group">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                    <span className="text-sm font-semibold text-white bg-black/50 rounded-full px-4 py-1.5 backdrop-blur-sm">
                      Watch a live AI lesson →
                    </span>
                  </div>
                </Link>
              </div>

              {/* Bottom info bar */}
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    AI
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Teacher Live</p>
                    <p className="text-xs text-muted-foreground">Python Programming • Intermediate</p>
                  </div>
                </div>
                <Badge variant="success" dot>Live</Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
