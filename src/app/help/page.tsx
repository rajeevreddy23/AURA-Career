'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Search,
  MessageCircle,
  BookOpen,
  User,
  Shield,
  Code2,
  Download,
  FileText,
  Headphones,
  ChevronRight,
  Sparkles,
  Bot,
} from 'lucide-react';

const helpCategories = [
  { icon: BookOpen, label: 'Getting Started', desc: 'Learn the basics of AURA Learn', color: 'bg-blue-500/10 text-blue-500' },
  { icon: User, label: 'Account & Profile', desc: 'Manage your account settings', color: 'bg-green-500/10 text-green-500' },
  { icon: Bot, label: 'AI Features', desc: 'AI teaching and assistance', color: 'bg-purple-500/10 text-purple-500' },
  { icon: Shield, label: 'Privacy & Security', desc: 'Keep your data safe', color: 'bg-red-500/10 text-red-500' },
  { icon: Code2, label: 'Coding Lab', desc: 'Coding environment help', color: 'bg-cyan-500/10 text-cyan-500' },
  { icon: Download, label: 'Downloads & Offline', desc: 'Access content offline', color: 'bg-orange-500/10 text-orange-500' },
  { icon: FileText, label: 'Certificates', desc: 'Certificate information', color: 'bg-yellow-500/10 text-yellow-500' },
  { icon: Headphones, label: 'Contact Support', desc: 'Get help from our team', color: 'bg-pink-500/10 text-pink-500' },
];

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Settings > Account > Password Reset, or use the "Forgot Password" link on the login page.' },
  { q: 'Can I download courses for offline?', a: 'Yes! You can download lessons for offline viewing from the course page.' },
  { q: 'How are certificates verified?', a: 'Each certificate has a unique verification ID that employers can validate on our verification page.' },
  { q: 'How does the AI teacher work?', a: 'Our AI teacher uses advanced language models to deliver personalized lessons, answer questions, and adapt to your learning style.' },
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="bg-gradient-to-b from-primary/5 to-background border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge variant="primary" size="md" className="mb-4">
                <Headphones className="h-3.5 w-3.5 mr-1" />
                Help Center
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                How Can We <span className="text-gradient">Help</span> You?
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Search our knowledge base or browse categories below
              </p>
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-card text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
          {/* AI Assistant CTA */}
          <Card variant="elevated" className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5">
            <CardContent className="flex flex-col sm:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shrink-0">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold mb-1">Ask Our AI Assistant</h3>
                <p className="text-sm text-muted-foreground">Get instant answers to your questions 24/7</p>
              </div>
              <Button variant="primary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>

          {/* Categories */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {helpCategories.map((cat, i) => (
              <motion.div key={cat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card hover className="h-full">
                  <CardContent className="text-center space-y-3 py-6">
                    <div className={`h-12 w-12 rounded-xl ${cat.color} flex items-center justify-center mx-auto`}>
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground">{cat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setSelectedFaq(selectedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors"
                  >
                    <span className="font-medium">{faq.q}</span>
                    <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${selectedFaq === i ? 'rotate-90' : ''}`} />
                  </button>
                  {selectedFaq === i && (
                    <div className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
