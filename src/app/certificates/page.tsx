'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, CheckCircle, X, Lock, PlayCircle, BookOpen, Clock, Sparkles, ExternalLink } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MOCK_COURSES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  level?: string;
  date: string;
  grade: string;
  score?: number;
  verificationId: string;
  skills: string[];
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<{ course: any; progress: number; level: string }[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  useEffect(() => {
    // Read completed certificates
    const storedCompleted = localStorage.getItem('aura_completed_courses');
    let completedList: Certificate[] = [];
    if (storedCompleted) {
      try {
        completedList = JSON.parse(storedCompleted);
        setCertificates(completedList);
      } catch {}
    }

    const completedIds = new Set(completedList.map((c) => c.courseId));

    // Discover in-progress enrolled courses
    const inProg: { course: any; progress: number; level: string }[] = [];
    MOCK_COURSES.forEach((course) => {
      if (completedIds.has(course.id)) return;

      const storedEnrollment = localStorage.getItem(`aura_enrollment_${course.id}`);
      const storedProg = localStorage.getItem(`aura_course_progress_${course.id}`);

      let progress = 0;
      let level = 'beginner';

      if (storedEnrollment) {
        try {
          const parsed = JSON.parse(storedEnrollment);
          progress = parsed.progress || 0;
          level = parsed.level || 'beginner';
        } catch {}
      } else if (storedProg) {
        progress = parseInt(storedProg, 10) || 0;
      }

      inProg.push({ course, progress, level });
    });

    setInProgressCourses(inProg);
  }, []);

  const handleDownloadCertificate = () => {
    toast.success('Certificate downloaded successfully!');
  };

  const studentDisplayName = user?.displayName || user?.email?.split('@')[0] || 'AURA Scholar';

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Strict Verification Standard</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Verified <span className="text-gradient">Course Credentials</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Certificates are issued strictly upon 100% completion of all syllabus chapters and interactive live lectures.
          </p>
        </div>

        {/* 1. Earned Verified Certificates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              <span>Earned Certificates ({certificates.length})</span>
            </h2>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-card p-10 rounded-3xl border border-dashed border-border text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No Verified Certificates Yet</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Complete all slides and modules in any course to automatically generate your tamper-proof, verified digital credential.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-xl hover:border-amber-500/50 transition-all group relative flex flex-col justify-between"
                >
                  <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                        <Award className="w-8 h-8" />
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[11px] font-bold rounded-full flex items-center gap-1 font-mono">
                        <CheckCircle className="w-3 h-3" /> VERIFIED
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition leading-snug">
                        {cert.courseName}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <span>Issued: {cert.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-amber-500">Grade {cert.grade}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cert.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-accent text-muted-foreground text-[10px] font-mono rounded-md border border-border"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between text-[10.5px] text-muted-foreground font-mono">
                      <span className="truncate max-w-[180px]">ID: {cert.verificationId || cert.id}</span>
                      <span className="text-primary font-bold">Inspect →</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 2. In-Progress Courses Gating */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Course Completion Progress</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Reach 100% completion in the AI Live Classroom to unlock and issue your certificate.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.map(({ course, progress, level }) => (
              <div
                key={course.id}
                className="bg-card p-6 rounded-3xl shadow-sm border border-border space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                      {level} LEVEL
                    </span>
                    <span className="text-xs font-mono font-bold text-foreground">{progress}%</span>
                  </div>

                  <h3 className="font-bold text-base text-foreground line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>

                  <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/classroom?courseId=${course.id}&level=${level}`}
                  className="w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{progress > 0 ? 'Resume in Classroom' : 'Start Course'}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Screen High-Fidelity Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-3xl space-y-4 my-8"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Canvas Box */}
              <div className="bg-slate-900 border-4 border-double border-amber-500/40 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden text-slate-100">
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-purple-500/10 to-transparent pointer-events-none" />

                <div className="space-y-1">
                  <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-bold">
                    AURA LEARN OFFICIAL CERTIFICATION
                  </h2>
                  <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                    Certificate of Mastery
                  </h1>
                </div>

                <p className="text-sm text-slate-400 italic">This is proudly awarded to</p>

                <p className="text-2xl sm:text-4xl font-extrabold text-amber-200 border-b border-amber-500/40 pb-2 inline-block px-10">
                  {studentDisplayName}
                </p>

                <p className="text-sm text-slate-300">
                  for successfully completing all curriculum modules, technical architectures, and live evaluations for
                </p>

                <p className="text-xl sm:text-2xl font-bold text-white">{selectedCert.courseName}</p>

                <div className="flex justify-center gap-12 pt-4">
                  <div>
                    <p className="font-bold text-sm text-slate-200">{selectedCert.date}</p>
                    <p className="text-[11px] text-slate-500 border-t border-slate-700 pt-1 mt-1 font-mono">Date Issued</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-amber-400">{selectedCert.grade || 'A+'}</p>
                    <p className="text-[11px] text-slate-500 border-t border-slate-700 pt-1 mt-1 font-mono">Evaluation Grade</p>
                  </div>
                </div>

                <div className="pt-6 flex justify-between items-end border-t border-slate-800">
                  <div className="text-left text-[10px] font-mono text-slate-400 space-y-0.5">
                    <p className="text-amber-400 font-bold">VERIFICATION HASH:</p>
                    <p className="text-slate-300 select-all">{selectedCert.verificationId || selectedCert.id}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg flex items-center justify-center border-2 border-amber-300 text-slate-950 font-bold">
                    <Award className="w-8 h-8 text-slate-950" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDownloadCertificate}
                  className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-xs shadow-lg hover:bg-slate-100 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Certificate
                </button>
                <button
                  onClick={() => {
                    const certUrl = `${window.location.origin}/certificates`;
                    window.open(
                      `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
                        selectedCert.courseName
                      )}&organizationName=AURA+Learn&issueYear=${new Date().getFullYear()}&certUrl=${encodeURIComponent(
                        certUrl
                      )}`,
                      '_blank'
                    );
                  }}
                  className="px-5 py-2.5 bg-[#0A66C2] text-white rounded-xl font-bold text-xs shadow-lg hover:bg-[#004182] transition flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share to LinkedIn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
