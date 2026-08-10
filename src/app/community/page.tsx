'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Copy,
  Plus,
  X,
  Users,
  CheckCircle,
  Hash,
  Clock
} from 'lucide-react';

const CATEGORIES = ['All', 'Programming', 'AI', 'Career', 'General'];

const INITIAL_DISCUSSIONS = [
  {
    id: 1,
    title: 'How to learn Next.js effectively?',
    author: 'Alice Cooper',
    time: '2h ago',
    category: 'Programming',
    replyCount: 3,
    likes: 12,
    replies: [
      { id: 101, author: 'Bob Builder', content: 'Start with the official documentation!', likes: 5 },
      { id: 102, author: 'Charlie Sheen', content: 'Build a small project first.', likes: 3 },
    ],
  },
  {
    id: 2,
    title: 'What is the future of AI in web development?',
    author: 'Dave Mustaine',
    time: '5h ago',
    category: 'AI',
    replyCount: 5,
    likes: 34,
    replies: [],
  },
];

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState(INITIAL_DISCUSSIONS);
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReply, setNewReply] = useState('');
  
  // Create Discussion State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Programming');
  const [newContent, setNewContent] = useState('');

  // Invite System State
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(50000);

  useEffect(() => {
    const joined = localStorage.getItem('aura_community_joined');
    if (joined) {
      setHasJoined(true);
      setMemberCount(prev => prev + 1);
    }
  }, []);

  const handleCreateInvite = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setInviteCode(code);
  };

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/community?invite=${inviteCode}`;
    navigator.clipboard.writeText(url);
    alert('Invite link copied to clipboard!');
  };

  const handleJoin = () => {
    if (joinCode.trim()) {
      localStorage.setItem('aura_community_joined', 'true');
      setHasJoined(true);
      setMemberCount(prev => prev + 1);
      setJoinCode('');
    }
  };

  const handleLike = (id: number, type: 'up' | 'down') => {
    setDiscussions(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, likes: type === 'up' ? d.likes + 1 : d.likes - 1 };
      }
      return d;
    }));
  };

  const handleReply = (id: number) => {
    if (!newReply.trim()) return;
    
    setDiscussions(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          replyCount: d.replyCount + 1,
          replies: [...d.replies, { id: Date.now(), author: 'You', content: newReply, likes: 0 }]
        };
      }
      return d;
    }));
    setNewReply('');
  };

  const handleCreateDiscussion = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const newDiscussion = {
      id: Date.now(),
      title: newTitle,
      author: 'You',
      time: 'Just now',
      category: newCategory,
      replyCount: 0,
      likes: 0,
      replies: []
    };

    setDiscussions([newDiscussion, ...discussions]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewContent('');
  };

  const filteredDiscussions = activeCategory === 'All' 
    ? discussions 
    : discussions.filter(d => d.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" />
              Community Hub
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              Join {memberCount.toLocaleString()} members worldwide
              {hasJoined && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle size={12}/> Joined</span>}
            </p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
            >
              <Plus size={18} /> Join Discussion
            </button>
          </div>
        </div>

        {/* Invite System */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Invite Friends</h2>
            <p className="text-gray-600 text-sm">Generate a unique code to invite friends to the community.</p>
            <div className="flex gap-2">
              <button onClick={handleCreateInvite} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition">
                Create Invite
              </button>
              {inviteCode && (
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg flex-1">
                  <span className="font-mono font-bold tracking-wider text-gray-800">{inviteCode}</span>
                  <button onClick={handleCopyInvite} className="ml-auto text-gray-500 hover:text-gray-800"><Copy size={18}/></button>
                </div>
              )}
            </div>
          </div>
          
          {!hasJoined && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Join with Code</h2>
              <p className="text-gray-600 text-sm">Have an invite code? Enter it below to join.</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3D4"
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                />
                <button onClick={handleJoin} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  Join
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Discussion Threads */}
        <div className="space-y-4">
          {filteredDiscussions.map((discussion) => (
            <motion.div 
              layout
              key={discussion.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setExpandedId(expandedId === discussion.id ? null : discussion.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full inline-flex items-center gap-1">
                      <Hash size={12}/> {discussion.category}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{discussion.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 relative">
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></span>
                        </div>
                        {discussion.author}
                      </div>
                      <span className="flex items-center gap-1"><Clock size={14}/> {discussion.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleLike(discussion.id, 'up'); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ThumbsUp size={18}/></button>
                      <span className="font-bold text-gray-700 self-center">{discussion.likes}</span>
                      <button onClick={(e) => { e.stopPropagation(); handleLike(discussion.id, 'down'); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ThumbsDown size={18}/></button>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><MessageSquare size={14}/> {discussion.replyCount} replies</span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === discussion.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-gray-50 p-6 space-y-4"
                  >
                    {discussion.replies.map(reply => (
                      <div key={reply.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between mb-2">
                          <span className="font-bold text-gray-800 text-sm">{reply.author}</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><ThumbsUp size={12}/> {reply.likes}</span>
                        </div>
                        <p className="text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 mt-4">
                      <input 
                        type="text" 
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button 
                        onClick={() => handleReply(discussion.id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                      >
                        Reply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Start a Discussion</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:bg-gray-100 p-2 rounded-lg transition"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="What do you want to ask?"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                  <textarea value={newContent} onChange={e => setNewContent(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Provide more details..."></textarea>
                </div>
                <button onClick={handleCreateDiscussion} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">
                  Post Discussion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
