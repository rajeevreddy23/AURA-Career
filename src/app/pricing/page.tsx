'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="primary" size="md" className="mb-4">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                AURA Learn
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                All Features Are <span className="text-gradient">Free</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                AURA Learn provides all AI-powered features completely free. Start learning today.
              </p>
              <Button variant="primary" size="lg" onClick={() => router.push('/auth/register')}>
                Get Started Free
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
