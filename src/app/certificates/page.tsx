'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, CheckCircle, X } from 'lucide-react';
import { MOCK_COURSES } from '@/lib/constants';

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  date: string;
  grade: string;
  skills: string[];
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('aura_completed_courses');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCompletedCourseIds(parsed.map((c: any) => c.courseId));
      setCertificates(parsed);
    }
  }, []);

  const handleCompleteCourse = (course: any) => {
    const newCert: Certificate = {
      id: `AURA-CERT-${course.id}-${Date.now()}`,
      courseId: course.id,
      courseName: course.title,
      date: new Date().toLocaleDateString(),
      grade: 'A+',
      skills: ['React', 'Next.js', 'Frontend']
    };

    const newCompleted = [...certificates, newCert];
    setCertificates(newCompleted);
    setCompletedCourseIds([...completedCourseIds, course.id]);
    localStorage.setItem('aura_completed_courses', JSON.stringify(newCompleted));
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const availableCourses = MOCK_COURSES?.filter((c: any) => !completedCourseIds.includes(c.id)) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -50, x: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight,
                x: (Math.random() - 0.5) * window.innerWidth,
                rotate: Math.random() * 360,
                opacity: 0
              }}
              transition={{ duration: 2 + Math.random() * 2, ease: "easeOut" }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Award className="w-10 h-10 text-yellow-500" />
            My Certificates
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View and manage your earned certificates. Every completed course awards you a verified digital certificate to showcase your skills.
          </p>
        </div>

        {/* Earned Certificates */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle className="text-green-500"/> Earned Certificates ({certificates.length})
          </h2>
          {certificates.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
              You haven't earned any certificates yet. Complete a course below to get started!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all group relative"
                >
                  <div className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <Award className="w-10 h-10 text-yellow-500" />
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle size={12}/> Verified
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 leading-tight">{cert.courseName}</h3>
                      <p className="text-sm text-gray-500 mt-1">Issued: {cert.date}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {cert.skills.map(s => (
                        <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{s}</span>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-50">
                      <p className="text-xs text-gray-400 font-mono truncate">ID: {cert.id}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-4 py-2 bg-white rounded-lg shadow-sm font-medium text-blue-600">View Details</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Available Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available to Complete</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map((course: any) => (
              <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="font-bold text-lg text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                <button 
                  onClick={() => handleCompleteCourse(course)}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  Complete Course (Demo)
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Full Screen Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl"
            >
              <button 
                onClick={() => setSelectedCert(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2"
              >
                <X size={24}/> Close
              </button>

              <div className="bg-white p-2 md:p-4 rounded-xl shadow-2xl relative overflow-hidden">
                {/* Certificate Content */}
                <div id="certificate-content" className="border-[8px] border-double border-gray-200 p-8 md:p-16 text-center space-y-8 bg-amber-50/20 relative">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-100 to-transparent opacity-50"></div>
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-yellow-100 to-transparent opacity-50"></div>
                  
                  <h2 className="text-2xl font-serif text-gray-500 uppercase tracking-widest">Aura Learn</h2>
                  <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900">Certificate of Completion</h1>
                  
                  <p className="text-xl text-gray-600 italic">This is to certify that</p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 border-b border-gray-300 pb-2 inline-block px-12">
                    Student Name
                  </p>
                  
                  <p className="text-xl text-gray-600 italic">has successfully completed the course</p>
                  <p className="text-2xl font-bold text-gray-800">{selectedCert.courseName}</p>
                  
                  <div className="flex justify-center gap-12 pt-8">
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{selectedCert.date}</p>
                      <p className="text-sm text-gray-500 border-t border-gray-300 pt-1 mt-1">Date</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-800">{selectedCert.grade}</p>
                      <p className="text-sm text-gray-500 border-t border-gray-300 pt-1 mt-1">Grade</p>
                    </div>
                  </div>

                  <div className="pt-12 flex justify-between items-end">
                    <p className="text-xs text-gray-400 font-mono text-left max-w-[200px] break-words">
                      Verification ID:<br/>{selectedCert.id}
                    </p>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-600 shadow-lg flex items-center justify-center border-4 border-yellow-200 relative">
                      <div className="absolute inset-2 border-2 border-dashed border-yellow-700/30 rounded-full"></div>
                      <Award className="w-10 h-10 text-yellow-800" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button className="px-6 py-3 bg-white text-gray-900 rounded-lg font-bold shadow-lg hover:bg-gray-50 transition flex items-center gap-2">
                  <Download size={20}/> Download PNG
                </button>
                <button 
                  onClick={() => window.open(`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(selectedCert.courseName)}&organizationId=123456&issueYear=${new Date().getFullYear()}&certUrl=${window.location.origin}/verify/${selectedCert.id}`, '_blank')}
                  className="px-6 py-3 bg-[#0A66C2] text-white rounded-lg font-bold shadow-lg hover:bg-[#004182] transition flex items-center gap-2"
                >
                  <Share2 size={20}/> Share to LinkedIn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
