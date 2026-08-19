'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Map, ArrowLeft, CheckCircle, Lock, PlayCircle, BookOpen, Clock, Signal, Award, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { COURSE_SYLLABI } from '@/lib/constants/syllabi';
import { MOCK_COURSES } from '@/lib/constants';

interface RoadmapDefinition {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  nodes: {
    id: string;
    courseId: string;
    title: string;
    duration: string;
    description: string;
    concepts: string[];
  }[];
}

const CAREER_ROADMAPS: RoadmapDefinition[] = [
  {
    id: 'fullstack-engineer',
    title: 'Full-Stack Software Engineer',
    category: 'Software Engineering',
    description: 'From Python data structures to modern React, Next.js Server Components, relational databases, and AWS deployment.',
    duration: '6 Months',
    difficulty: 'Beginner',
    nodes: [
      {
        id: 'node-1',
        courseId: '1',
        title: 'Complete Python Programming',
        duration: '4 weeks',
        description: 'Master memory models, OOP, dunder methods, generators, and AsyncIO concurrency.',
        concepts: ['Dynamic arrays & slicing', 'Classes & encapsulation', 'Iterators & generators', 'AsyncIO event loop'],
      },
      {
        id: 'node-2',
        courseId: '3',
        title: 'Full-Stack Web Development',
        duration: '6 weeks',
        description: 'React 19, Next.js App Router, Zod validation, and SQL database transactions.',
        concepts: ['TypeScript generics', 'Server Components', 'REST & Route Handlers', 'ACID transactions'],
      },
      {
        id: 'node-3',
        courseId: '8',
        title: 'Cloud Computing & AWS',
        duration: '4 weeks',
        description: 'Deploy resilient multi-AZ VPCs, Lambda serverless functions, and IAM policies.',
        concepts: ['VPC Subnets & NAT', 'Auto Scaling & ALB', 'Lambda & SQS pipelines', 'IAM least privilege'],
      },
      {
        id: 'node-4',
        courseId: '5',
        title: 'Cybersecurity Fundamentals',
        duration: '3 weeks',
        description: 'OWASP Top 10 defenses, parameterized SQL queries, bcrypt hashing, and incident triage.',
        concepts: ['TCP Handshake & SYN flood', 'Password hashing & salts', 'SQLi & XSS prevention', 'NIST IR framework'],
      },
    ],
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI & Machine Learning Engineer',
    category: 'Artificial Intelligence',
    description: 'Master mathematical foundations, PyTorch neural networks, Transformer attention models, and LoRA LLM fine-tuning.',
    duration: '8 Months',
    difficulty: 'Intermediate',
    nodes: [
      {
        id: 'node-ai-1',
        courseId: '7',
        title: 'Calculus & Linear Algebra Mastery',
        duration: '4 weeks',
        description: 'Gradients, Jacobian matrices, eigenvalues, SVD, and PCA dimensionality reduction.',
        concepts: ['Gradient vectors & ascent', 'Matrix transformations', 'Eigen decomposition', 'SVD & PCA energy'],
      },
      {
        id: 'node-ai-2',
        courseId: '4',
        title: 'Data Science & Analytics',
        duration: '4 weeks',
        description: 'Pandas vectorized aggregations, A/B hypothesis testing, and Scikit-Learn pipelines.',
        concepts: ['Vectorized GroupBy', 'Two-sample t-tests', 'Random Forests & ROC-AUC', 'KPI storytelling'],
      },
      {
        id: 'node-ai-3',
        courseId: '2',
        title: 'Deep Learning & Neural Networks',
        duration: '6 weeks',
        description: 'Perceptrons, backpropagation automatic differentiation, CNNs, and Adam optimization.',
        concepts: ['ReLU & Softmax loss', 'Chain rule autograd', '2D convolutions & pooling', 'Adam training loop'],
      },
      {
        id: 'node-ai-4',
        courseId: '11',
        title: 'Natural Language Processing',
        duration: '6 weeks',
        description: 'Vector embeddings, Multi-Head Self-Attention, BERT, and LoRA PEFT adaptation.',
        concepts: ['Cosine similarity', 'Scaled Dot-Product Attention', 'Masked LM context', 'LoRA parameter reduction'],
      },
    ],
  },
  {
    id: 'fintech-strategist',
    title: 'FinTech Strategist & Quantitative Modeler',
    category: 'Finance & Strategy',
    description: 'Integrate financial statement linkages, Black-Scholes options math, LBO private equity, and SaaS unit economics.',
    duration: '5 Months',
    difficulty: 'Intermediate',
    nodes: [
      {
        id: 'node-fin-1',
        courseId: '6',
        title: 'Business Strategy & Management',
        duration: '3 weeks',
        description: "Porter's 5 Forces, SaaS LTV:CAC ratios, OKR design, and DCF valuation modeling.",
        concepts: ["Porter's Five Forces", 'LTV:CAC & Payback', 'Measurable OKRs', 'Discounted Cash Flow'],
      },
      {
        id: 'node-fin-2',
        courseId: '10',
        title: 'Financial Modeling & Investment',
        duration: '5 weeks',
        description: '3-statement model linkages, CAPM beta, Black-Scholes pricing, and LBO sponsor returns.',
        concepts: ['3-statement integration', 'Sharpe ratio & CAPM', 'Black-Scholes & Greeks', 'LBO 5-year IRR'],
      },
      {
        id: 'node-fin-3',
        courseId: '4',
        title: 'Data Science & Analytics',
        duration: '4 weeks',
        description: 'Quantitative modeling, hypothesis testing, and executive visual reporting.',
        concepts: ['Pandas aggregation', 'A/B significance', 'Predictive modeling', 'Executive KPIs'],
      },
    ],
  },
];

export default function RoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapDefinition | null>(null);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);

  useEffect(() => {
    // Read completed nodes
    const storedNodes = localStorage.getItem('aura_completed_roadmap_nodes');
    if (storedNodes) {
      try {
        setCompletedNodes(JSON.parse(storedNodes));
      } catch {}
    }

    // Check localStorage for enrolled courses
    const enrolled: string[] = [];
    MOCK_COURSES.forEach((c) => {
      if (localStorage.getItem(`aura_enrollment_${c.id}`)) {
        enrolled.push(c.id);
      }
    });
    setEnrolledCourseIds(enrolled);
  }, []);

  const handleNodeComplete = (nodeId: string, courseId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let newCompleted: string[];
    if (completedNodes.includes(nodeId)) {
      newCompleted = completedNodes.filter((id) => id !== nodeId);
    } else {
      newCompleted = [...completedNodes, nodeId];
    }
    setCompletedNodes(newCompleted);
    localStorage.setItem('aura_completed_roadmap_nodes', JSON.stringify(newCompleted));
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        {!selectedRoadmap ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            {/* Hero */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Structured Career Tracks</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                Verified <span className="text-gradient">Career Roadmaps</span>
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg">
                Step-by-step curriculum tracks directly mapped to live AI masterclasses, hands-on coding labs, and certified milestones.
              </p>
            </div>

            {/* Roadmaps Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CAREER_ROADMAPS.map((roadmap) => {
                const totalNodes = roadmap.nodes.length;
                const completedCount = roadmap.nodes.filter((n) => completedNodes.includes(n.id)).length;
                const pct = Math.round((completedCount / totalNodes) * 100);

                return (
                  <div
                    key={roadmap.id}
                    onClick={() => setSelectedRoadmap(roadmap)}
                    className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition">
                          <Map className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-accent text-foreground text-xs font-bold rounded-full flex items-center gap-1 border border-border">
                          <Signal className="w-3 h-3" /> {roadmap.difficulty}
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] font-mono uppercase text-primary font-bold">{roadmap.category}</span>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition">{roadmap.title}</h3>
                        <p className="text-muted-foreground text-xs leading-relaxed mt-1.5 line-clamp-2">{roadmap.description}</p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5" /> {roadmap.duration}</span>
                        <span className="flex items-center gap-1.5 font-medium"><BookOpen className="w-3.5 h-3.5" /> {totalNodes} Mastery Courses</span>
                      </div>

                      {/* Mini Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono">
                          <span className="text-muted-foreground">Track Progress</span>
                          <span className="font-bold text-primary">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-accent rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* Roadmap Detail View */
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <button
              onClick={() => setSelectedRoadmap(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to all roadmaps
            </button>

            <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border">
                <div>
                  <span className="text-xs font-mono uppercase text-primary font-bold">{selectedRoadmap.category} TRACK</span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground mt-1">{selectedRoadmap.title}</h2>
                  <p className="text-muted-foreground text-sm max-w-2xl mt-2">{selectedRoadmap.description}</p>
                </div>
                <div className="text-right shrink-0 bg-accent/40 p-4 rounded-2xl border border-border">
                  <div className="text-3xl font-extrabold text-primary">
                    {Math.round(
                      (selectedRoadmap.nodes.filter((n) => completedNodes.includes(n.id)).length /
                        selectedRoadmap.nodes.length) *
                        100
                    )}%
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider font-semibold">Track Completion</div>
                </div>
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-4 sm:pl-10 space-y-8">
                {/* Timeline Line */}
                <div className="absolute left-7 sm:left-[3.25rem] top-6 bottom-6 w-0.5 bg-border" />

                {selectedRoadmap.nodes.map((node, index) => {
                  const isCompleted = completedNodes.includes(node.id);
                  const isEnrolled = enrolledCourseIds.includes(node.courseId);

                  return (
                    <div key={node.id} className="relative flex items-start gap-6 sm:gap-8 group">
                      {/* Status Icon */}
                      <div
                        className={`relative z-10 w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 shadow-md font-bold text-xs sm:text-sm transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                            : 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`flex-1 p-5 sm:p-6 rounded-2xl border transition-all ${
                          isCompleted
                            ? 'border-emerald-500/30 bg-emerald-950/10'
                            : 'border-border bg-card shadow-sm hover:border-primary/50'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-base sm:text-lg font-bold text-foreground">{node.title}</h4>
                              {isEnrolled && (
                                <span className="text-[10px] font-mono font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                                  Enrolled
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground">{node.description}</p>

                            {/* Concepts badges */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {node.concepts.map((c, ci) => (
                                <span
                                  key={ci}
                                  className="text-[11px] font-mono bg-accent/60 text-muted-foreground px-2 py-0.5 rounded border border-border/80"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <button
                              onClick={(e) => handleNodeComplete(node.id, node.courseId, e)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                                isCompleted
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-accent text-muted-foreground border-border hover:text-foreground'
                              }`}
                            >
                              {isCompleted ? '✓ Completed' : 'Mark Done'}
                            </button>

                            <Link
                              href={`/courses/${node.courseId}`}
                              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-primary/20"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>Go to Course</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Banner */}
              {selectedRoadmap.nodes.every((n) => completedNodes.includes(n.id)) && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 text-center text-white shadow-2xl space-y-3"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                    <Award className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-extrabold">Track Completed!</h3>
                  <p className="text-emerald-100 text-sm max-w-lg mx-auto">
                    You have mastered all core courses in the {selectedRoadmap.title} track. Your verified skill credentials are ready in Certificates.
                  </p>
                  <Link
                    href="/certificates"
                    className="inline-flex items-center space-x-1.5 px-6 py-2.5 bg-white text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-50 transition shadow-lg mt-2"
                  >
                    <span>View Certificates</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </main>
  );
}
