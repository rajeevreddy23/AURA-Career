'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROADMAPS } from '@/lib/constants';
import { Map, ArrowLeft, CheckCircle, Lock, PlayCircle, BookOpen, Clock, Signal, Award } from 'lucide-react';
import Link from 'next/link';

export default function RoadmapPage() {
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('aura_completed_roadmap_nodes');
    if (stored) {
      setCompletedNodes(JSON.parse(stored));
    }
  }, []);

  const handleNodeComplete = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (completedNodes.includes(nodeId)) {
      const newCompleted = completedNodes.filter(id => id !== nodeId);
      setCompletedNodes(newCompleted);
      localStorage.setItem('aura_completed_roadmap_nodes', JSON.stringify(newCompleted));
    } else {
      const newCompleted = [...completedNodes, nodeId];
      setCompletedNodes(newCompleted);
      localStorage.setItem('aura_completed_roadmap_nodes', JSON.stringify(newCompleted));
    }
  };

  const getRoadmapsList = () => {
    if (ROADMAPS && ROADMAPS.length > 0) return ROADMAPS as any[];
    
    // Fallback if constants aren't fully defined
    return [
      {
        id: 'frontend',
        title: 'Frontend Developer',
        description: 'Master modern UI development with React, Next.js, and CSS.',
        duration: '6 Months',
        difficulty: 'Beginner',
        nodes: [
          { id: 'f1', title: 'HTML & CSS Fundamentals', duration: '2 weeks' },
          { id: 'f2', title: 'JavaScript Essentials', duration: '4 weeks' },
          { id: 'f3', title: 'React & Hooks', duration: '4 weeks' },
          { id: 'f4', title: 'Next.js & SSR', duration: '3 weeks' },
        ]
      },
      {
        id: 'ai',
        title: 'AI Engineer',
        description: 'Learn ML, Neural Networks, and LLM fine-tuning.',
        duration: '8 Months',
        difficulty: 'Advanced',
        nodes: [
          { id: 'a1', title: 'Python for AI', duration: '3 weeks' },
          { id: 'a2', title: 'Machine Learning Basics', duration: '6 weeks' },
          { id: 'a3', title: 'Deep Learning & PyTorch', duration: '8 weeks' },
        ]
      }
    ];
  };

  const roadmaps = getRoadmapsList();

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {!selectedRoadmap ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
                <Map className="w-10 h-10 text-blue-600" />
                Career Roadmaps
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Follow structured learning paths curated by industry experts to achieve your career goals.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map(roadmap => (
                <div 
                  key={roadmap.id}
                  onClick={() => setSelectedRoadmap(roadmap)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                      <Map size={24} />
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <Signal size={12}/> {(roadmap as any).difficulty || (roadmap as any).level || 'Beginner'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{roadmap.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">{roadmap.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-50 pt-4">
                    <span className="flex items-center gap-1"><Clock size={14}/> {roadmap.duration}</span>
                    <span className="flex items-center gap-1"><BookOpen size={14}/> {((roadmap as any).nodes || (roadmap as any).courses || []).length} Courses</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <button 
              onClick={() => setSelectedRoadmap(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
            >
              <ArrowLeft size={20}/> Back to all paths
            </button>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-8 border-b border-gray-100">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedRoadmap.title}</h2>
                  <p className="text-gray-500 mt-2">{selectedRoadmap.description}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round((selectedRoadmap.nodes.filter((n:any) => completedNodes.includes(n.id)).length / selectedRoadmap.nodes.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Completed</div>
                </div>
              </div>

              <div className="relative pl-4 md:pl-10">
                {/* Vertical Line */}
                <div className="absolute left-7 md:left-[3.25rem] top-4 bottom-4 w-1 bg-gray-100 rounded-full"></div>
                
                <div className="space-y-8">
                  {selectedRoadmap.nodes.map((node: any, index: number) => {
                    const isCompleted = completedNodes.includes(node.id);
                    const prevNodeCompleted = index === 0 || completedNodes.includes(selectedRoadmap.nodes[index - 1].id);
                    const isLocked = !isCompleted && !prevNodeCompleted;
                    const isCurrent = !isCompleted && prevNodeCompleted;

                    return (
                      <div key={node.id} className="relative flex items-start gap-6 md:gap-8 group">
                        {/* Status Icon */}
                        <div className={`relative z-10 w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-colors ${
                          isCompleted ? 'bg-green-500 text-white' : 
                          isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {isCompleted ? <CheckCircle size={20}/> : 
                           isLocked ? <Lock size={20}/> : 
                           <span className="font-bold">{index + 1}</span>}
                           
                          {isCurrent && (
                            <span className="absolute -inset-1 rounded-full animate-ping bg-blue-400 opacity-20"></span>
                          )}
                        </div>

                        {/* Node Card */}
                        <div className={`flex-1 bg-white p-6 rounded-2xl border transition-all ${
                          isCompleted ? 'border-green-200 bg-green-50/30' :
                          isCurrent ? 'border-blue-200 shadow-md' :
                          'border-gray-100 opacity-60 grayscale-[50%]'
                        }`}>
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h4 className="text-lg font-bold text-gray-900">{node.title}</h4>
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Clock size={14}/> Est. {node.duration}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => handleNodeComplete(node.id, e)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                  isCompleted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                              </button>
                              
                              {!isLocked && (
                                <Link 
                                  href={`/classroom?course=${node.id}&topic=${encodeURIComponent(node.title)}`}
                                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
                                >
                                  <PlayCircle size={16}/> Start
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedRoadmap.nodes.every((n:any) => completedNodes.includes(n.id)) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl p-8 text-center text-white shadow-xl"
                >
                  <h3 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                    <Award size={32}/> Congratulations!
                  </h3>
                  <p className="text-green-50 text-lg">You have completed the entire {selectedRoadmap.title} roadmap.</p>
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
