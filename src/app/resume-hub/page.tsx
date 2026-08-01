'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ResumeHub } from '@/components/resume/ResumeHub';

export default function ResumeHubPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <ResumeHub />
      </div>
      <Footer />
    </main>
  );
}