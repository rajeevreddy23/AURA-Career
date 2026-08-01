'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sparkles, Brain, Briefcase, Code2, Infinity } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI Teacher', desc: 'Personalized AI professor that adapts to your style' },
  { icon: Code2, title: 'Coding Lab', desc: 'Interactive coding environment with AI guidance' },
  { icon: Briefcase, title: 'Resume Hub', desc: 'AI-powered resume analysis and builder' },
  { icon: Infinity, title: 'Unlimited Access', desc: 'All courses and features, completely free' },
];

export const PricingSection: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <Badge variant="primary" size="md" className="mb-4">100% Free</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need,{' '}
            <span className="text-gradient">Completely Free</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No subscriptions, no hidden fees. All AI features are available to everyone.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover className="h-full border-primary/20">
                <CardContent className="text-center py-8 space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/auth/register">
            <Button variant="primary" size="lg">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Learning Free
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
