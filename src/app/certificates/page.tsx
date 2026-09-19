'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Download, Share2, CheckCircle, X, Lock,
  PlayCircle, BookOpen, Clock, Sparkles, ExternalLink,
  Edit3, Check, Copy, Printer, ShieldCheck, QrCode, FileText
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MOCK_COURSES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  level?: string;
  date: string;
  grade: string;
  score?: number;
  verificationId: string;
  skills: string[];
  studentName?: string;
}

const DEFAULT_DEMO_CERTS: Certificate[] = [
  {
    id: 'cert-fs-001',
    courseId: '3',
    courseName: 'Full-Stack Software Engineering Mastery',
    level: 'Advanced',
    date: 'August 28, 2026',
    grade: 'A+ (Honors)',
    score: 98,
    verificationId: 'AURA-CERT-FS-89241B7C',
    skills: ['React 19', 'Next.js App Router', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
  },
  {
    id: 'cert-ai-002',
    courseId: '2',
    courseName: 'Deep Learning & Transformer Architectures',
    level: 'Advanced',
    date: 'August 15, 2026',
    grade: 'A+ (Distinction)',
    score: 99,
    verificationId: 'AURA-CERT-DL-4190FA62',
    skills: ['PyTorch', 'Self-Attention', 'Backpropagation', 'LoRA Fine-Tuning', 'Neural Networks'],
  },
];

export default function CertificatesPage() {
  const { user } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<{ course: any; progress: number; level: string }[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Customizable Student Name on Certificate
  const initialName = user?.displayName || user?.email?.split('@')[0] || 'Rajeev Reddy';
  const [studentName, setStudentName] = useState<string>(initialName);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(initialName);

  useEffect(() => {
    // Read completed certificates from local storage
    const storedCompleted = localStorage.getItem('aura_completed_courses');
    let completedList: Certificate[] = [];
    if (storedCompleted) {
      try {
        completedList = JSON.parse(storedCompleted);
      } catch {}
    }

    if (completedList.length === 0) {
      completedList = DEFAULT_DEMO_CERTS;
    }
    setCertificates(completedList);

    const completedIds = new Set(completedList.map((c) => c.courseId));

    // Discover in-progress enrolled courses
    const inProg: { course: any; progress: number; level: string }[] = [];
    MOCK_COURSES.forEach((course) => {
      if (completedIds.has(course.id)) return;

      const storedEnrollment = localStorage.getItem(`aura_enrollment_${course.id}`);
      const storedProg = localStorage.getItem(`aura_course_progress_${course.id}`);

      let progress = 0;
      let level = 'intermediate';

      if (storedEnrollment) {
        try {
          const parsed = JSON.parse(storedEnrollment);
          progress = parsed.progress || 0;
          level = parsed.level || 'intermediate';
        } catch {}
      } else if (storedProg) {
        progress = parseInt(storedProg, 10) || 0;
      }

      inProg.push({ course, progress: progress || 65, level });
    });

    setInProgressCourses(inProg);
  }, []);

  const handleSaveStudentName = () => {
    if (!tempName.trim()) {
      toast.error('Student name cannot be empty');
      return;
    }
    setStudentName(tempName.trim());
    setIsEditingName(false);
    toast.success('Certificate name updated successfully!');
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleCopyVerification = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Verification ID copied to clipboard!');
  };

  const handleGenerateInstantDemo = () => {
    const newDemoCert: Certificate = {
      id: `cert-gen-${Date.now()}`,
      courseId: '1',
      courseName: 'Advanced Python Concurrency & Microservices',
      level: 'Mastery',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      grade: 'A+ (Summa Cum Laude)',
      score: 100,
      verificationId: `AURA-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      skills: ['AsyncIO', 'Memory Layout', 'Raft Consensus', 'FastAPI', 'Distributed Systems'],
    };
    setCertificates([newDemoCert, ...certificates]);
    setSelectedCert(newDemoCert);
    toast.success('New Verified Certificate Issued!');
  };

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />

      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate,
          #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Official Academic Accreditations</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Verified <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Course Credentials</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Tamper-proof, cryptographically verifiable certificates issued strictly upon completion of curriculum modules and live AI evaluations.
          </p>

          {/* Student Name Customization Banner */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto mt-6">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  NAME ON YOUR CERTIFICATES:
                </p>
                <p className="text-base font-bold text-white tracking-wide">
                  {studentName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTempName(studentName);
                  setIsEditingName(true);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Name</span>
              </button>

              <button
                onClick={handleGenerateInstantDemo}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Issue Certificate</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. Earned Verified Certificates */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <span>Earned Credentials ({certificates.length})</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                className="bg-slate-900/90 rounded-3xl shadow-xl border border-slate-800 overflow-hidden cursor-pointer hover:shadow-2xl hover:border-amber-500/60 transition-all group relative flex flex-col justify-between"
              >
                <div className="h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600" />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-amber-500/15 text-amber-400 rounded-2xl border border-amber-500/30">
                      <Award className="w-8 h-8" />
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[11px] font-bold rounded-full flex items-center gap-1 font-mono">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> VERIFIED
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-amber-300 transition leading-snug">
                      {cert.courseName}
                    </h3>
                    <p className="text-xs text-amber-200/90 font-medium mt-1">
                      Awarded to: <span className="font-bold text-white">{studentName}</span>
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1 font-mono">
                      <span>Issued: {cert.date}</span>
                      <span>•</span>
                      <span className="font-semibold text-amber-400">{cert.grade}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cert.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-slate-950 text-slate-300 text-[10px] font-mono rounded-md border border-slate-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10.5px] text-slate-400 font-mono">
                    <span className="truncate max-w-[170px]">ID: {cert.verificationId}</span>
                    <span className="text-amber-400 font-bold group-hover:underline">View Credential →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 2. In-Progress Courses Gating */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Course Completion Milestones</h2>
            <p className="text-xs text-slate-400 mt-1">
              Reach 100% chapter completion in the AI Live Classroom to unlock and issue your credentials.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.map(({ course, progress, level }) => (
              <div
                key={course.id}
                className="bg-slate-900/80 p-6 rounded-3xl shadow-md border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-800/60">
                      {level} LEVEL
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200">{progress}% Done</span>
                  </div>

                  <h3 className="font-bold text-base text-white line-clamp-1">{course.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <Link
                  href={`/classroom?courseId=${course.id}&level=${level}`}
                  className="w-full py-2.5 bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-700/60 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <PlayCircle className="w-4 h-4 text-purple-400" />
                  <span>Resume in Classroom</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Student Name Modal */}
      <AnimatePresence>
        {isEditingName && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Customize Certificate Name</h3>
                </div>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Enter the exact legal or preferred name you want displayed on all your verified course certificates:
              </p>

              <div>
                <label className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block mb-1.5">
                  Student Full Name:
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="e.g. Rajeev Reddy"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl text-sm text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStudentName}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save to Certificate</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Screen Luxury Executive Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-4xl space-y-4 my-8"
            >
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold">
                  <Award className="w-4 h-4" />
                  <span>PREVIEW CREDENTIAL</span>
                </div>
                <button
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Luxury Certificate Canvas Box */}
              <div
                id="printable-certificate"
                ref={certRef}
                className="bg-gradient-to-b from-[#0b101e] via-[#0d1424] to-[#080d19] border-8 border-double border-amber-500/50 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden text-slate-100"
              >
                {/* Guilloché Corner Accents */}
                <div className="absolute top-3 left-3 w-16 h-16 border-t-2 border-l-2 border-amber-400/80 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-3 right-3 w-16 h-16 border-t-2 border-r-2 border-amber-400/80 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-16 h-16 border-b-2 border-l-2 border-amber-400/80 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-16 h-16 border-b-2 border-r-2 border-amber-400/80 rounded-br-xl pointer-events-none" />

                {/* Subtle Background Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <Award className="w-96 h-96 text-amber-400" />
                </div>

                {/* Header Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center space-x-2 text-[11px] font-mono uppercase tracking-[0.35em] text-amber-400 font-bold">
                    <span>✦ AURACAREER ACADEMIC COUNCIL ✦</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
                    Certificate of Mastery
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 italic font-serif">
                  This official academic credential is systematically awarded to
                </p>

                {/* PROMINENT STUDENT NAME */}
                <div className="py-2">
                  <div className="inline-block relative">
                    <p className="text-2xl sm:text-5xl font-serif font-bold text-amber-200 tracking-wide px-8 pb-2 border-b-2 border-amber-400/60 shadow-sm">
                      {studentName}
                    </p>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-amber-400 rounded-full" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  for demonstrating first-principles mastery, architectural problem solving, and 100% completion of all rigorous technical requirements in
                </p>

                {/* Course Name */}
                <div className="py-1">
                  <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    {selectedCert.courseName}
                  </p>
                </div>

                {/* Metadata & Distinction Grade */}
                <div className="grid grid-cols-3 gap-4 pt-4 max-w-lg mx-auto text-center border-y border-slate-800/80 py-3">
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-200">{selectedCert.date}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">DATE ISSUED</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-amber-400">{selectedCert.grade}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">HONORS GRADE</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-emerald-400">VERIFIED</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">STATUS</p>
                  </div>
                </div>

                {/* Signatures & Holographic Seal */}
                <div className="pt-6 flex justify-between items-end border-t border-slate-800/90 gap-4">
                  {/* Left: Academic Chancellor Signature */}
                  <div className="text-left space-y-1">
                    <p className="font-serif italic text-lg text-amber-300/90 font-bold">Dr. Aris Vance</p>
                    <div className="w-32 h-0.5 bg-slate-700" />
                    <p className="text-[10px] text-slate-400 font-mono">AI Chancellor & Dean</p>
                  </div>

                  {/* Center: Gold Foil Hologram Seal */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_25px_rgba(234,179,8,0.4)] flex flex-col items-center justify-center border-2 border-amber-200 text-slate-950 font-bold relative shrink-0">
                    <Award className="w-7 h-7 text-slate-950" />
                    <span className="text-[8px] tracking-widest uppercase font-mono font-extrabold mt-0.5">VERIFIED</span>
                  </div>

                  {/* Right: Verification Hash & QR Code */}
                  <div className="text-right space-y-1">
                    <p className="font-serif italic text-lg text-amber-300/90 font-bold">Elena Rostova</p>
                    <div className="w-32 h-0.5 bg-slate-700 ml-auto" />
                    <p className="text-[10px] text-slate-400 font-mono">Director of Learning</p>
                  </div>
                </div>

                {/* Tamper-Proof Cryptographic ID */}
                <div className="pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/60">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>VERIFICATION HASH:</span>
                    <span className="text-slate-300 select-all">{selectedCert.verificationId}</span>
                  </div>
                  <button
                    onClick={() => handleCopyVerification(selectedCert.verificationId)}
                    className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy ID</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={handlePrintCertificate}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download / Print Certificate
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
                  className="px-6 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share on LinkedIn
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
