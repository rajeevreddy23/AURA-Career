'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Download, Share2, CheckCircle, X, Lock,
  PlayCircle, BookOpen, Clock, Sparkles, ExternalLink,
  Edit3, Check, Copy, Printer, ShieldCheck, QrCode, FileText,
  Languages, Image as ImageIcon, Loader2
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MOCK_COURSES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import {
  SUPPORTED_LANGUAGES,
  CERTIFICATE_TRANSLATIONS,
  LanguageCode
} from '@/contexts/LanguageContext';
import {
  UserCertificate,
  getUserCertificates,
  saveUserCertificate,
  getUserEnrollments,
  getUserCourseProgress,
  getUserStudentName,
  saveUserStudentName,
  issueCredentialForStudent
} from '@/lib/utils/userData';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const { user, profile } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);

  const [certificates, setCertificates] = useState<UserCertificate[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<{ course: any; progress: number; level: string }[]>([]);
  const [selectedCert, setSelectedCert] = useState<UserCertificate | null>(null);

  // Customizable Student Name on Certificate - strictly scoped to user
  const [studentName, setStudentName] = useState<string>('Student');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('Student');

  // Certificate Language Selection (15 languages)
  const [certLanguage, setCertLanguage] = useState<LanguageCode>('en');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Synchronize student name and user-scoped certificates whenever user or profile loads
  useEffect(() => {
    const resolvedName =
      getUserStudentName(user?.uid) ||
      user?.displayName ||
      profile?.displayName ||
      user?.email?.split('@')[0] ||
      'Student';

    setStudentName(resolvedName);
    setTempName(resolvedName);

    // Read user-scoped certificates strictly for this user UID
    const userCerts = getUserCertificates(user?.uid);
    setCertificates(userCerts);

    // Read user-scoped enrollments
    const userEnrollments = getUserEnrollments(user?.uid);
    const completedCourseIds = new Set(userCerts.map((c) => c.courseId));

    // Discover in-progress enrolled courses for this student
    const inProg: { course: any; progress: number; level: string }[] = [];
    MOCK_COURSES.forEach((course) => {
      if (completedCourseIds.has(course.id)) return;

      const enrollment = userEnrollments[course.id];
      const prog = getUserCourseProgress(course.id, user?.uid);

      if (enrollment || prog > 0) {
        inProg.push({
          course,
          progress: enrollment?.progress ?? prog ?? 0,
          level: enrollment?.level || 'intermediate',
        });
      }
    });

    setInProgressCourses(inProg);
  }, [user, profile]);

  const handleSaveStudentName = () => {
    if (!tempName.trim()) {
      toast.error('Student name cannot be empty');
      return;
    }
    const cleanName = tempName.trim();
    setStudentName(cleanName);
    saveUserStudentName(cleanName, user?.uid);

    // Update existing certificates for this user with their updated name
    const updatedCerts = certificates.map((c) => ({ ...c, studentName: cleanName }));
    setCertificates(updatedCerts);
    if (user?.uid) {
      localStorage.setItem(`aura_user_${user.uid}_certificates`, JSON.stringify(updatedCerts));
    }

    if (selectedCert) {
      setSelectedCert({ ...selectedCert, studentName: cleanName });
    }

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

  /**
   * Generates and downloads the certificate as a high-resolution PDF
   */
  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    const toastId = toast.loading('Rendering high-resolution PDF certificate...');

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(certRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#070b14',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const safeName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeCourse = (selectedCert?.courseName || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`AuraCareer_Certificate_${safeName}_${safeCourse}.pdf`);

      toast.success('Certificate PDF downloaded successfully!', { id: toastId });
    } catch (err: any) {
      console.error('PDF error:', err);
      toast.error('Direct PDF rendering failed. Opening print dialog...', { id: toastId });
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Generates and downloads the certificate as a PNG Image
   */
  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    const toastId = toast.loading('Generating high-resolution PNG image...');

    try {
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(certRef.current, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#070b14',
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to generate image', { id: toastId });
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const safeName = studentName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const safeCourse = (selectedCert?.courseName || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_');
        link.download = `AuraCareer_Certificate_${safeName}_${safeCourse}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Certificate PNG image downloaded!', { id: toastId });
      }, 'image/png');
    } catch (err: any) {
      console.error('Image download error:', err);
      toast.error('Failed to generate PNG image', { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Issues a verified credential for this student
   */
  const handleIssueCredential = (courseId = '1', courseTitle = 'Complete Python & Distributed Systems') => {
    const newCert = issueCredentialForStudent(
      courseId,
      courseTitle,
      'A+ (Honors)',
      99,
      ['System Architecture', 'Distributed Systems', 'Applied AI', 'Microservices'],
      user?.uid,
      studentName
    );

    const updated = [newCert, ...certificates.filter((c) => c.id !== newCert.id)];
    setCertificates(updated);
    setSelectedCert(newCert);
    toast.success(`Official Certificate issued for ${studentName}!`);
  };

  // Active translation dictionary for the certificate
  const tCert = CERTIFICATE_TRANSLATIONS[certLanguage] || CERTIFICATE_TRANSLATIONS.en;

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
            background: #070b14 !important;
            color: white !important;
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
            Individual, tamper-proof certificates with cryptographic verification hashes issued strictly for your account.
          </p>

          {/* Student Name Customization Banner */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto mt-6">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  STUDENT NAME ON CERTIFICATES:
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
                onClick={() => handleIssueCredential('1', 'Complete Python & Distributed Systems')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Issue Verified Credential</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. Earned Verified Certificates for this Student */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <span>Your Earned Credentials ({certificates.length})</span>
            </h2>
          </div>

          {certificates.length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Certificates Issued Yet</h3>
              <p className="text-sm text-slate-400">
                Certificates in AuraCareer are individual to your account. Complete your course lessons in the Live Classroom or claim your first verified credential below.
              </p>
              <button
                onClick={() => handleIssueCredential('1', 'Complete Python & Distributed Systems')}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Issue My First Credential
              </button>
            </div>
          ) : (
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
                        Awarded to: <span className="font-bold text-white">{cert.studentName || studentName}</span>
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
                      <span className="text-amber-400 font-bold group-hover:underline">View & Download →</span>
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
            <h2 className="text-xl sm:text-2xl font-bold text-white">Your Enrolled Courses</h2>
            <p className="text-xs text-slate-400 mt-1">
              Complete curriculum modules in the Live Classroom to automatically unlock verified credentials.
            </p>
          </div>

          {inProgressCourses.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-sm">
              <p>You have no pending in-progress courses.</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-1.5 text-amber-400 font-bold hover:underline mt-2 text-xs"
              >
                Browse Catalog & Enroll in a Course →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map(({ course, progress, level }) => (
                <div
                  key={course.id}
                  className="bg-slate-900/60 rounded-3xl border border-slate-800/80 p-6 space-y-4 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {level.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-base">{course.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{course.category}</p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-amber-400 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      href={`/classroom?courseId=${course.id}&level=${level}`}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" /> Continue Course
                    </Link>

                    <button
                      onClick={() => handleIssueCredential(course.id, course.title)}
                      className="text-xs text-slate-400 hover:text-amber-300 font-mono transition"
                    >
                      Instant Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Name Modal */}
      <AnimatePresence>
        {isEditingName && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center">
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
                Enter your exact legal name to display on all verified course credentials:
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
              <div className="flex flex-wrap justify-between items-center px-2 gap-3">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono font-bold">
                  <Award className="w-4 h-4" />
                  <span>{tCert.preview}</span>
                </div>

                {/* 15 Languages Dropdown Switcher */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200">
                    <Languages className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-mono text-slate-400">Language:</span>
                    <select
                      value={certLanguage}
                      onChange={(e) => setCertLanguage(e.target.value as LanguageCode)}
                      className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                          {lang.flag} {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
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
                    <span>{tCert.council}</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-serif font-extrabold text-white tracking-tight">
                    {tCert.title}
                  </h1>
                </div>

                <p className="text-xs sm:text-sm text-slate-400 italic font-serif">
                  {tCert.awardedTo}
                </p>

                {/* PROMINENT STUDENT NAME */}
                <div className="py-2">
                  <div className="inline-block relative">
                    <p className="text-2xl sm:text-5xl font-serif font-bold text-amber-200 tracking-wide px-8 pb-2 border-b-2 border-amber-400/60 shadow-sm">
                      {selectedCert.studentName || studentName}
                    </p>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-amber-400 rounded-full" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                  {tCert.statement}
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
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tCert.dateIssued}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-amber-400">{selectedCert.grade}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tCert.honorsGrade}</p>
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-emerald-400">{tCert.verified}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{tCert.status}</p>
                  </div>
                </div>

                {/* Signatures & Holographic Seal */}
                <div className="pt-6 flex justify-between items-end border-t border-slate-800/90 gap-4">
                  {/* Left: Academic Chancellor Signature */}
                  <div className="text-left space-y-1">
                    <p className="font-serif italic text-lg text-amber-300/90 font-bold">Dr. Aris Vance</p>
                    <div className="w-32 h-0.5 bg-slate-700" />
                    <p className="text-[10px] text-slate-400 font-mono">{tCert.chancellorTitle}</p>
                  </div>

                  {/* Center: Gold Foil Hologram Seal */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_25px_rgba(234,179,8,0.4)] flex flex-col items-center justify-center border-2 border-amber-200 text-slate-950 font-bold relative shrink-0">
                    <Award className="w-7 h-7 text-slate-950" />
                    <span className="text-[8px] tracking-widest uppercase font-mono font-extrabold mt-0.5">
                      {tCert.verified}
                    </span>
                  </div>

                  {/* Right: Verification Hash & QR Code */}
                  <div className="text-right space-y-1">
                    <p className="font-serif italic text-lg text-amber-300/90 font-bold">Elena Rostova</p>
                    <div className="w-32 h-0.5 bg-slate-700 ml-auto" />
                    <p className="text-[10px] text-slate-400 font-mono">{tCert.directorTitle}</p>
                  </div>
                </div>

                {/* Tamper-Proof Cryptographic ID */}
                <div className="pt-3 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/60">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tCert.verificationHash}:</span>
                    <span className="text-slate-300 select-all">{selectedCert.verificationId}</span>
                  </div>
                  <button
                    onClick={() => handleCopyVerification(selectedCert.verificationId)}
                    className="text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Hash</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: PDF Download, Image PNG Download, Print, LinkedIn */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </button>

                <button
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  Download PNG Image
                </button>

                <button
                  onClick={handlePrintCertificate}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>

                <button
                  onClick={() => {
                    const certUrl = `${window.location.origin}/certificates`;
                    window.open(
                      `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
                        selectedCert.courseName
                      )}&organizationName=AuraCareer&issueYear=${new Date().getFullYear()}&certUrl=${encodeURIComponent(
                        certUrl
                      )}`,
                      '_blank'
                    );
                  }}
                  className="px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-xl font-bold text-xs shadow-lg transition flex items-center gap-2"
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
