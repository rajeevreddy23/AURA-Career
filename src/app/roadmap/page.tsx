'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Map, ArrowLeft, CheckCircle, Lock, PlayCircle, BookOpen,
  Clock, Signal, Award, Sparkles, ChevronRight, Filter,
  CheckCircle2, Circle, ArrowUpRight, Flame, Shield, Cpu,
  Database, Globe, Terminal, Briefcase
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export interface RoadmapNode {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  description: string;
  concepts: string[];
}

export interface RoadmapDefinition {
  id: string;
  title: string;
  category: 'Software' | 'AI' | 'Cloud' | 'Security' | 'FinTech' | 'Data';
  description: string;
  duration: string;
  salaryRange: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: React.ElementType;
  nodes: RoadmapNode[];
}

const CAREER_ROADMAPS: RoadmapDefinition[] = [
  {
    id: 'fullstack-engineer',
    title: 'Full-Stack Software Engineer',
    category: 'Software',
    description: 'Master end-to-end modern application engineering from Python & TypeScript to Next.js App Router, PostgreSQL, and AWS deployment.',
    duration: '6 Months',
    salaryRange: '$95k – $165k / yr',
    difficulty: 'Beginner',
    icon: Globe,
    nodes: [
      {
        id: 'fs-1',
        courseId: '1',
        title: 'Complete Python Programming & Concurrency',
        duration: '4 weeks',
        description: 'Master memory models, OOP, dunder methods, generators, and AsyncIO event loops.',
        concepts: ['Dynamic arrays & slicing', 'Classes & encapsulation', 'Iterators & generators', 'AsyncIO concurrency'],
      },
      {
        id: 'fs-2',
        courseId: '3',
        title: 'Full-Stack Web Development & Next.js',
        duration: '6 weeks',
        description: 'React 19, Server Components, Zod validation, and ACID relational transactions.',
        concepts: ['TypeScript generics', 'Server Components', 'REST & Route Handlers', 'ACID transactions'],
      },
      {
        id: 'fs-3',
        courseId: '8',
        title: 'Cloud Architecture & AWS Infrastructure',
        duration: '4 weeks',
        description: 'Deploy resilient multi-AZ VPCs, Lambda serverless functions, and IAM policies.',
        concepts: ['VPC Subnets & NAT', 'Auto Scaling & ALB', 'Lambda & SQS pipelines', 'IAM least privilege'],
      },
      {
        id: 'fs-4',
        courseId: '5',
        title: 'Cybersecurity Fundamentals & Defense',
        duration: '3 weeks',
        description: 'OWASP Top 10 defenses, parameterized SQL queries, bcrypt hashing, and incident triage.',
        concepts: ['TCP Handshake & SYN flood', 'Password hashing & salts', 'SQLi & XSS prevention', 'NIST IR framework'],
      },
    ],
  },
  {
    id: 'ai-ml-engineer',
    title: 'AI & Machine Learning Engineer',
    category: 'AI',
    description: 'Build production neural networks, Transformer self-attention mechanisms, and LoRA parameter-efficient LLM adaptations.',
    duration: '8 Months',
    salaryRange: '$120k – $210k / yr',
    difficulty: 'Intermediate',
    icon: Cpu,
    nodes: [
      {
        id: 'ai-1',
        courseId: '7',
        title: 'Calculus & Linear Algebra Foundations',
        duration: '4 weeks',
        description: 'Gradients, Jacobian matrices, eigenvalues, SVD, and PCA dimensionality reduction.',
        concepts: ['Gradient vectors & ascent', 'Matrix transformations', 'Eigen decomposition', 'SVD & PCA energy'],
      },
      {
        id: 'ai-2',
        courseId: '4',
        title: 'Data Science & Applied Analytics',
        duration: '4 weeks',
        description: 'Pandas vectorized aggregations, A/B hypothesis testing, and Scikit-Learn pipelines.',
        concepts: ['Vectorized GroupBy', 'Two-sample t-tests', 'Random Forests & ROC-AUC', 'KPI storytelling'],
      },
      {
        id: 'ai-3',
        courseId: '2',
        title: 'Deep Learning & Neural Networks',
        duration: '6 weeks',
        description: 'Perceptrons, backpropagation automatic differentiation, CNNs, and Adam optimization.',
        concepts: ['ReLU & Softmax loss', 'Chain rule autograd', '2D convolutions & pooling', 'Adam training loop'],
      },
      {
        id: 'ai-4',
        courseId: '11',
        title: 'Natural Language Processing & Transformers',
        duration: '6 weeks',
        description: 'Vector embeddings, Multi-Head Self-Attention, BERT, and LoRA PEFT adaptation.',
        concepts: ['Cosine similarity', 'Scaled Dot-Product Attention', 'Masked LM context', 'LoRA parameter reduction'],
      },
    ],
  },
  {
    id: 'cloud-devops-architect',
    title: 'Cloud & DevOps Solutions Architect',
    category: 'Cloud',
    description: 'Architect multi-region fault-tolerant distributed clouds with Kubernetes container orchestration and automated CI/CD pipelines.',
    duration: '6 Months',
    salaryRange: '$115k – $185k / yr',
    difficulty: 'Advanced',
    icon: Terminal,
    nodes: [
      {
        id: 'cloud-1',
        courseId: '1',
        title: 'Python Scripting & Automation',
        duration: '4 weeks',
        description: 'Automate cloud provisioning, CLI tools, and background worker queues.',
        concepts: ['Process automation', 'CLI toolkits', 'Socket networking', 'Async worker tasks'],
      },
      {
        id: 'cloud-2',
        courseId: '8',
        title: 'Cloud Computing & AWS Architecture',
        duration: '6 weeks',
        description: 'Multi-AZ VPCs, S3 object storage policies, CloudFront CDN, and DynamoDB.',
        concepts: ['Multi-AZ Resiliency', 'ECS & EKS Containerization', 'CloudWatch Telemetry', 'Terraform IaC'],
      },
      {
        id: 'cloud-3',
        courseId: '5',
        title: 'Cloud Security & Zero-Trust Governance',
        duration: '4 weeks',
        description: 'Zero-trust network architecture, mutual TLS, automated vulnerability patching, and compliance.',
        concepts: ['Zero-Trust IAM', 'mTLS encryption', 'WAF rate limiting', 'Automated security pipelines'],
      },
    ],
  },
  {
    id: 'fintech-strategist',
    title: 'FinTech Strategist & Quantitative Modeler',
    category: 'FinTech',
    description: 'Bridge software engineering with 3-statement financial modeling, Black-Scholes options math, and algorithmic trading.',
    duration: '5 Months',
    salaryRange: '$110k – $190k / yr',
    difficulty: 'Intermediate',
    icon: Briefcase,
    nodes: [
      {
        id: 'fin-1',
        courseId: '6',
        title: 'Business Strategy & Platform Economics',
        duration: '3 weeks',
        description: "Porter's 5 Forces, SaaS LTV:CAC unit economics, OKR design, and DCF valuation modeling.",
        concepts: ["Porter's Five Forces", 'LTV:CAC & Payback', 'Measurable OKRs', 'Discounted Cash Flow'],
      },
      {
        id: 'fin-2',
        courseId: '10',
        title: 'Financial Modeling & Quantitative Valuation',
        duration: '5 weeks',
        description: '3-statement model linkages, CAPM beta, Black-Scholes options pricing, and LBO sponsor returns.',
        concepts: ['3-statement integration', 'Sharpe ratio & CAPM', 'Black-Scholes & Greeks', 'LBO 5-year IRR'],
      },
      {
        id: 'fin-3',
        courseId: '4',
        title: 'Data Science & Statistical Modeling',
        duration: '4 weeks',
        description: 'Quantitative modeling, time-series forecasting, and automated executive reporting.',
        concepts: ['Pandas aggregation', 'Time-series forecasting', 'Predictive modeling', 'Executive KPIs'],
      },
    ],
  },
  {
    id: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst & Threat Hunter',
    category: 'Security',
    description: 'Defend enterprise infrastructure with reverse engineering, cryptographic encryption, intrusion detection, and incident triage.',
    duration: '6 Months',
    salaryRange: '$105k – $175k / yr',
    difficulty: 'Intermediate',
    icon: Shield,
    nodes: [
      {
        id: 'sec-1',
        courseId: '5',
        title: 'Cybersecurity Fundamentals & Network Defense',
        duration: '5 weeks',
        description: 'Network packet analysis, firewalls, cryptographic ciphers, and threat modeling.',
        concepts: ['TCP/IP deep inspection', 'Public Key Infrastructure', 'Firewall rules', 'Threat modeling'],
      },
      {
        id: 'sec-2',
        courseId: '1',
        title: 'Python for Security Automation & Forensics',
        duration: '4 weeks',
        description: 'Build log parsers, packet sniffers, and automated security incident response scripts.',
        concepts: ['Scapy packet crafting', 'Log forensic parsing', 'Automated scanning', 'Memory triage'],
      },
      {
        id: 'sec-3',
        courseId: '8',
        title: 'Cloud Security Architecture',
        duration: '4 weeks',
        description: 'AWS GuardDuty, CloudTrail audit logs, least-privilege RBAC, and container sandbox isolation.',
        concepts: ['Audit logging', 'RBAC policies', 'Vulnerability scanning', 'Incident mitigation'],
      },
    ],
  },
];

export default function RoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapDefinition>(CAREER_ROADMAPS[0]);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    // Load completed nodes from localStorage
    try {
      const stored = localStorage.getItem('aura_completed_roadmap_nodes');
      if (stored) {
        setCompletedNodes(new Set(JSON.parse(stored)));
      } else {
        setCompletedNodes(new Set(['fs-1', 'ai-1']));
      }
    } catch {}
  }, []);

  const toggleNodeCompletion = (nodeId: string) => {
    const updated = new Set(completedNodes);
    if (updated.has(nodeId)) {
      updated.delete(nodeId);
      toast('Milestone marked as in-progress', { icon: '⏳' });
    } else {
      updated.add(nodeId);
      toast.success('Milestone completed! +100 XP');
    }
    setCompletedNodes(updated);
    try {
      localStorage.setItem('aura_completed_roadmap_nodes', JSON.stringify(Array.from(updated)));
    } catch {}
  };

  const filteredRoadmaps = activeCategory === 'All'
    ? CAREER_ROADMAPS
    : CAREER_ROADMAPS.filter((r) => r.category === activeCategory);

  const totalNodesInSelected = selectedRoadmap.nodes.length;
  const completedNodesInSelected = selectedRoadmap.nodes.filter((n) => completedNodes.has(n.id)).length;
  const roadmapProgress = Math.round((completedNodesInSelected / totalNodesInSelected) * 100);

  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 font-sans">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        {/* Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold">
            <Map className="w-4 h-4 text-purple-400" />
            <span>Interactive Industry Roadmaps</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Career Learning <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Roadmaps</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Structured step-by-step pathways designed by industry practitioners with direct links into the AI Live Classroom.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['All', 'Software', 'AI', 'Cloud', 'Security', 'FinTech'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat} Pathways
            </button>
          ))}
        </div>

        {/* Pathway Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoadmaps.map((rm) => {
            const Icon = rm.icon;
            const isSelected = selectedRoadmap.id === rm.id;
            const doneCount = rm.nodes.filter((n) => completedNodes.has(n.id)).length;
            const pct = Math.round((doneCount / rm.nodes.length) * 100);

            return (
              <motion.div
                key={rm.id}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedRoadmap(rm)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all shadow-xl flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/70 shadow-purple-500/15'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700">
                      {rm.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition">
                      {rm.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {rm.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span>{rm.duration}</span>
                    <span className="text-emerald-400 font-semibold">{rm.salaryRange}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>{doneCount} of {rm.nodes.length} Milestones</span>
                    <span className="text-purple-300 font-bold">{pct}% Completed</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Roadmap Interactive Interactive Timeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          {/* Pathway Header Details */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold uppercase tracking-wider border border-purple-500/40">
                  ACTIVE ROADMAP
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedRoadmap.salaryRange}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
                {selectedRoadmap.title}
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {selectedRoadmap.description}
              </p>
            </div>

            {/* Overall Progress Gauge */}
            <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-bold text-white font-mono">{roadmapProgress}%</p>
                <p className="text-[10px] font-mono text-slate-400 uppercase">PATHWAY PROGRESS</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-purple-500 border-r-indigo-500 flex items-center justify-center font-bold text-xs text-purple-300 font-mono">
                {completedNodesInSelected}/{totalNodesInSelected}
              </div>
            </div>
          </div>

          {/* Sequential Milestones Flow */}
          <div className="space-y-6 relative">
            {/* Connecting Vertical Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-500 to-slate-800 hidden sm:block pointer-events-none" />

            {selectedRoadmap.nodes.map((node, index) => {
              const isCompleted = completedNodes.has(node.id);

              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`relative sm:pl-16 p-5 sm:p-6 rounded-3xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-950/80 border-emerald-500/40 shadow-emerald-500/5'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Timeline Badge Node */}
                  <div
                    onClick={() => toggleNodeCompletion(node.id)}
                    className={`sm:absolute sm:left-3 sm:top-6 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all border shrink-0 mb-3 sm:mb-0 ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/40'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-purple-400'
                    }`}
                    title={isCompleted ? 'Click to unmark milestone' : 'Click to complete milestone'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-mono font-bold">{index + 1}</span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono text-purple-400 font-bold">
                          PHASE {index + 1} · {node.duration}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                            COMPLETED
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white">{node.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{node.description}</p>

                      {/* Concept Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {node.concepts.map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            className="bg-slate-900 text-slate-300 text-[10.5px] font-mono px-2.5 py-0.5 rounded-lg border border-slate-800"
                          >
                            • {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions: Direct Classroom Link + Toggle */}
                    <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => toggleNodeCompletion(node.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                          isCompleted
                            ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                            : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
                        }`}
                      >
                        {isCompleted ? 'Mark Incomplete' : 'Complete Phase'}
                      </button>

                      <Link
                        href={`/classroom?courseId=${node.courseId}&level=intermediate`}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Launch in Classroom</span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
