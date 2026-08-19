'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_COURSES } from '@/lib/constants';
import { getCourseSyllabus } from '@/lib/constants/syllabi';
import { formatDuration, formatNumber } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/contexts/StoreContext';
import toast from 'react-hot-toast';
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Share2,
  Award,
  ChevronDown,
  ChevronUp,
  FileText,
  Code2,
  MessageSquare,
  Sparkles,
  Zap,
  Layers,
  X,
  GraduationCap,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setCourseProgress } = useAppStore();

  const courseId = (params.courseId as string) || '1';
  const course = MOCK_COURSES.find((c) => c.id === courseId) || MOCK_COURSES[0];
  const syllabus = getCourseSyllabus(course.id);

  // State
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    [syllabus.modules[0]?.moduleId || '0']: true,
  });

  const toggleModuleAccordion = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleEnrollAndStart = (level = selectedLevel) => {
    // Persist enrollment choice in localStorage and store
    const enrollmentData = {
      courseId: course.id,
      courseTitle: course.title,
      level,
      enrolledAt: new Date().toISOString(),
      currentModuleIndex: 0,
      currentSlideIndex: 0,
      completedSlides: [],
      completedModules: [],
    };

    localStorage.setItem(`aura_enrollment_${course.id}`, JSON.stringify(enrollmentData));
    localStorage.setItem('aura_last_course_id', course.id);
    localStorage.setItem('aura_last_level', level);
    setCourseProgress(course.id, 0);

    toast.success(`Enrolled in "${course.title}" at ${level.toUpperCase()} level!`);
    setShowLevelModal(false);
    router.push(`/classroom?courseId=${course.id}&level=${level}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-10">
        {/* Course Header */}
        <div className="bg-gradient-to-b from-primary/5 via-purple-500/5 to-cyan-500/5 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="md">{course.category}</Badge>
                  <Badge variant="default" size="md">{course.level}</Badge>
                  <Badge variant="success" size="sm" dot>Complete Curriculum</Badge>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{course.title}</h1>
                <p className="text-lg text-muted-foreground">{course.description}</p>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{course.rating}</span>
                    <span className="text-muted-foreground">(12K+ reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{formatNumber(course.enrolledStudents)}</span>
                    <span className="text-muted-foreground">enrolled</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{formatDuration(course.totalDuration)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold">{syllabus.modules.reduce((acc, m) => acc + m.slides.length, 0)}</span>
                    <span className="text-muted-foreground">concepts / slides</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {course.instructor.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{course.instructor.name}</p>
                    <p className="text-xs text-muted-foreground">{course.instructor.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </span>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowLevelModal(true)}
                    className="group"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Learning
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Course link copied!');
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Preview Card */}
              <div className="hidden lg:block">
                <div
                  onClick={() => setShowLevelModal(true)}
                  className="aspect-video rounded-2xl bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-indigo-950/50 relative overflow-hidden border border-purple-800/40 shadow-2xl cursor-pointer group hover:border-purple-500/60 transition-all"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 ml-1" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <span className="text-xs font-mono text-purple-300 block uppercase font-bold">● AI LIVE CLASSROOM</span>
                        <span className="text-sm font-semibold">{course.title}</span>
                      </div>
                      <span className="text-xs bg-purple-950/80 px-2 py-1 rounded border border-purple-700/50 font-mono text-purple-200">
                        {syllabus.modules.length} Modules
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Learning Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    What You'll Master in this Course
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      `Core theoretical and practical foundations of ${course.title}`,
                      'Step-by-step verified code implementations and algorithms',
                      'Memory layout, runtime internals, and Big-O complexity',
                      'Production patterns, defensive error handling, and testing',
                      'Live AI whiteboard lectures with interactive robot teaching',
                      'Official verified Certificate of Completion upon 100% syllabus mastery',
                    ].map((outcome) => (
                      <div key={outcome} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Complete Ordered Syllabus */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Complete Course Curriculum Roadmap
                    </CardTitle>
                    <span className="text-xs font-mono text-muted-foreground bg-accent px-2 py-0.5 rounded">
                      {syllabus.modules.length} Chapters · {syllabus.modules.reduce((acc, m) => acc + m.slides.length, 0)} Concepts
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {syllabus.modules.map((mod, mi) => {
                    const isExpanded = !!expandedModules[mod.moduleId];
                    return (
                      <div key={mod.moduleId || mi} className="border border-border rounded-xl overflow-hidden transition-all">
                        <div
                          onClick={() => toggleModuleAccordion(mod.moduleId)}
                          className="flex items-center justify-between p-4 bg-accent/40 cursor-pointer hover:bg-accent/70 transition"
                        >
                          <div className="flex-1 min-w-0 pr-3">
                            <h4 className="font-semibold text-sm text-foreground">{mod.moduleTitle}</h4>
                            {mod.chapterSummary && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{mod.chapterSummary}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="text-xs text-muted-foreground font-mono">{mod.slides.length} slides</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </div>
                        </div>

                        {/* Accordion Slides */}
                        {isExpanded && (
                          <div className="divide-y divide-border bg-card">
                            {mod.slides.map((slide, si) => (
                              <div
                                key={slide.slideId || si}
                                onClick={() => setShowLevelModal(true)}
                                className="flex items-center justify-between p-3.5 hover:bg-accent/20 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold flex items-center justify-center shrink-0">
                                    {mi + 1}.{si + 1}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-sm font-medium block truncate">{slide.title}</span>
                                    <span className="text-[11px] font-mono text-muted-foreground uppercase">{slide.conceptTag}</span>
                                  </div>
                                </div>
                                <span className="text-xs font-mono text-primary flex items-center gap-1 shrink-0">
                                  <Play className="w-3 h-3" /> Live
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardContent className="py-6 text-center space-y-4">
                  <div className="text-3xl font-bold">{course.price === 0 ? 'Free' : `$${course.price}`}</div>
                  <Button
                    variant="primary"
                    className="w-full"
                    size="lg"
                    onClick={() => setShowLevelModal(true)}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Enroll & Choose Level
                  </Button>
                  <p className="text-xs text-muted-foreground">Self-paced AI Masterclass with verified certificate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>This Course Includes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Play, label: `${syllabus.modules.reduce((acc, m) => acc + m.slides.length, 0)} interactive AI slides & lectures` },
                    { icon: Clock, label: `${formatDuration(course.totalDuration)} estimated mastery time` },
                    { icon: FileText, label: 'Auto-generated session notes & summaries' },
                    { icon: Code2, label: 'Integrated Coding Lab exercises' },
                    { icon: Award, label: 'Verified Certificate upon 100% completion' },
                    { icon: MessageSquare, label: 'Real-time AI Professor Q&A stream' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                      <item.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL SELECTION ENROLLMENT MODAL (STEP 2) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showLevelModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl space-y-6 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Enroll in Course</h3>
                    <p className="text-xs text-purple-300 font-medium truncate max-w-sm">{course.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-200">Choose your learning difficulty level:</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your AI Professor will tailor pacing, code depth, terminology, and edge cases to your selected level throughout the class.
                </p>
              </div>

              {/* 3 Level Cards */}
              <div className="space-y-3">
                {[
                  {
                    id: 'beginner' as const,
                    title: 'Beginner',
                    badge: 'Foundations First',
                    desc: 'Plain language, clear step-by-step analogies, foundational concepts, and heavily commented beginner-friendly code.',
                    color: 'from-emerald-950/40 to-slate-900/60 border-emerald-500/40 hover:border-emerald-500',
                    activeColor: 'ring-2 ring-emerald-500 bg-emerald-950/50',
                    iconColor: 'text-emerald-400',
                  },
                  {
                    id: 'intermediate' as const,
                    title: 'Intermediate',
                    badge: 'Practical & Idiomatic',
                    desc: 'Practical design patterns, idiomatic syntax, robust error handling, and real-world architectural building blocks.',
                    color: 'from-amber-950/40 to-slate-900/60 border-amber-500/40 hover:border-amber-500',
                    activeColor: 'ring-2 ring-amber-500 bg-amber-950/50',
                    iconColor: 'text-amber-400',
                  },
                  {
                    id: 'advanced' as const,
                    title: 'Advanced',
                    badge: 'Deep Internals & Big-O',
                    desc: 'Terse production-grade code, memory layout analysis, Big-O runtime bounds, performance tuning, and edge-case resilience.',
                    color: 'from-purple-950/40 to-slate-900/60 border-purple-500/40 hover:border-purple-500',
                    activeColor: 'ring-2 ring-purple-500 bg-purple-950/50',
                    iconColor: 'text-purple-400',
                  },
                ].map((lvl) => {
                  const isSelected = selectedLevel === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 bg-gradient-to-r ${lvl.color} ${
                        isSelected ? lvl.activeColor : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-bold ${lvl.iconColor}`}>{lvl.title}</span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                            {lvl.badge}
                          </span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-purple-400 bg-purple-500' : 'border-slate-600'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{lvl.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowLevelModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleEnrollAndStart(selectedLevel)}
                  className="px-6 font-bold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Enter Live Classroom ({selectedLevel.toUpperCase()})
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
