'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/contexts/StoreContext';
import { Trophy, Star, Target, Zap, Clock, Code, BookOpen, Crown, Lock } from 'lucide-react';

const BADGE_DATA = [
  { id: 'b1', title: 'First Steps', desc: 'Complete first lesson', icon: Target, category: 'Learning', tier: 'Bronze' },
  { id: 'b2', title: 'Week Warrior', desc: '7-day streak', icon: Zap, category: 'Streak', tier: 'Bronze' },
  { id: 'b3', title: 'Knowledge Seeker', desc: 'Study 10 hours total', icon: BookOpen, category: 'Learning', tier: 'Bronze' },
  
  { id: 's1', title: 'Perfect Score', desc: '100% on any quiz', icon: Star, category: 'Quiz', tier: 'Silver' },
  { id: 's2', title: 'Code Master', desc: 'Complete 10 coding exercises', icon: Code, category: 'Coding', tier: 'Silver' },
  { id: 's3', title: 'Speed Learner', desc: 'Complete lesson in under 10m', icon: Clock, category: 'Learning', tier: 'Silver' },
  
  { id: 'g1', title: 'Graduate', desc: 'Complete a full course', icon: Trophy, category: 'Learning', tier: 'Gold' },
  { id: 'g2', title: 'Project Pro', desc: 'Complete 5 projects', icon: Target, category: 'Coding', tier: 'Gold' },
  { id: 'g3', title: 'Legend', desc: 'Reach level 10', icon: Crown, category: 'Streak', tier: 'Gold' },
];

const TIER_COLORS = {
  Bronze: 'from-[#CD7F32] to-[#A0522D]',
  Silver: 'from-[#C0C0C0] to-[#808080]',
  Gold: 'from-[#FFD700] to-[#DAA520]',
};

export function GamificationEngine() {
  const store = useAppStore?.() as any;
  const xp = store?.xp || 1250;
  const level = store?.level || 3;
  
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('aura_earned_badges');
    if (stored) {
      setEarnedBadges(JSON.parse(stored));
    }
  }, []);

  const claimBadge = (id: string) => {
    if (earnedBadges.includes(id)) return;
    
    const newEarned = [...earnedBadges, id];
    setEarnedBadges(newEarned);
    localStorage.setItem('aura_earned_badges', JSON.stringify(newEarned));
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const xpProgress = (xp % 1000) / 1000 * 100;

  return (
    <div className="space-y-8 font-sans">
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

      {/* Level Progress */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg transform -rotate-6">
          L{level}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-gray-900 text-lg">Level Progress</h3>
            <span className="text-sm font-medium text-gray-500">{xp} / {(level + 1) * 1000} XP</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Badge Gallery */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-500"/> Achievement Badges
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {BADGE_DATA.map((badge) => {
              const isEarned = earnedBadges.includes(badge.id);
              const tierColor = TIER_COLORS[badge.tier as keyof typeof TIER_COLORS];
              
              return (
                <div key={badge.id} className="relative group perspective">
                  <motion.div 
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6, type: 'spring' }}
                    className="w-full aspect-square relative preserve-3d cursor-pointer"
                  >
                    {/* Front */}
                    <div className={`absolute inset-0 backface-hidden rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all ${
                      isEarned 
                        ? 'bg-white shadow-lg border border-gray-100' 
                        : 'bg-gray-50 border border-gray-100 grayscale opacity-60'
                    }`}>
                      <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center bg-gradient-to-br ${tierColor} ${isEarned ? 'shadow-[0_0_15px_rgba(0,0,0,0.2)]' : ''}`}>
                        <badge.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{badge.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{badge.tier}</p>
                      
                      {!isEarned && (
                        <div className="absolute top-2 right-2 bg-gray-200 rounded-full p-1">
                          <Lock size={12} className="text-gray-500"/>
                        </div>
                      )}
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rounded-2xl p-4 bg-gray-900 text-white flex flex-col items-center justify-center text-center rotate-y-180 shadow-xl">
                      <h4 className="font-bold text-sm mb-2">{badge.title}</h4>
                      <p className="text-xs text-gray-300 mb-4">{badge.desc}</p>
                      {!isEarned ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); claimBadge(badge.id); }}
                          className="px-4 py-2 bg-white text-gray-900 rounded-lg text-xs font-bold hover:bg-gray-100 transition"
                        >
                          Claim (Demo)
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                          Earned
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Widget */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="text-blue-500"/> Top Learners
          </h2>
          
          <div className="space-y-4">
            {[
              { name: 'Alex Johnson', xp: 4500, avatar: 'A' },
              { name: 'Sarah Smith', xp: 4250, avatar: 'S' },
              { name: 'Mike Brown', xp: 3900, avatar: 'M' },
              { name: 'Emily Davis', xp: 3600, avatar: 'E' },
              { name: 'You', xp: xp, avatar: 'Y', isCurrent: true },
            ].sort((a,b) => b.xp - a.xp).map((user, idx) => (
              <div key={user.name} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${user.isCurrent ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}>
                <div className="w-6 text-center font-bold text-gray-400 text-sm">#{idx + 1}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${user.isCurrent ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${user.isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                    {user.name}
                  </h4>
                  <p className="text-xs text-gray-500">{user.xp.toLocaleString()} XP</p>
                </div>
                {idx === 0 && <Crown className="text-yellow-500 w-5 h-5"/>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
