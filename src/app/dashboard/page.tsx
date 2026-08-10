'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/contexts/StoreContext';
import {
  BookOpen, Clock, Flame, Trophy, Zap, Play, ArrowRight, Bell,
  GraduationCap, Code2, Award, Star, Compass, FileText, Map, Settings, Users, CheckCircle, Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { xpPoints, level, dailyStreak, studyTime } = useAppStore();
  const router = useRouter();

  const [courseProgress, setCourseProgress] = useState({
    python: 0,
    deepLearning: 0
  });

  useEffect(() => {
    // Load real progress from localStorage
    const p1 = localStorage.getItem('course_python_progress') || '65';
    const p2 = localStorage.getItem('course_dl_progress') || '30';
    setCourseProgress({
      python: parseInt(p1),
      deepLearning: parseInt(p2)
    });
  }, []);

  const quickStats = [
    { icon: BookOpen, label: 'Enrolled', value: '4', color: 'bg-blue-500/10 text-blue-500', link: '/courses' },
    { icon: Play, label: 'In Progress', value: '2', color: 'bg-yellow-500/10 text-yellow-500', link: '/courses' },
    { icon: Trophy, label: 'Completed', value: '1', color: 'bg-green-500/10 text-green-500', link: '/courses' },
    { icon: Clock, label: 'Study Hours', value: `${Math.floor(studyTime / 60)}h`, color: 'bg-purple-500/10 text-purple-500', link: '/courses' },
  ];

  const recentCourses = [
    { id: 'python', title: 'Python Programming', progress: courseProgress.python, nextLesson: 'Functions & Modules', instructor: 'Dr. Sarah Chen' },
    { id: 'deep-learning', title: 'Deep Learning', progress: courseProgress.deepLearning, nextLesson: 'Convolutional Neural Networks', instructor: 'Prof. Alex Kumar' },
  ];

  const quickActions = [
    { icon: Compass, label: 'Explore Courses', path: '/courses', color: 'text-blue-500 bg-blue-500/10' },
    { icon: GraduationCap, label: 'Live Classroom', path: '/classroom', color: 'text-purple-500 bg-purple-500/10' },
    { icon: FileText, label: 'Resume Hub', path: '/resume-hub', color: 'text-green-500 bg-green-500/10' },
    { icon: Map, label: 'Career Roadmap', path: '/roadmap', color: 'text-orange-500 bg-orange-500/10' },
    { icon: Award, label: 'Certificates', path: '/certificates', color: 'text-yellow-500 bg-yellow-500/10' },
    { icon: Users, label: 'Community', path: '/community', color: 'text-indigo-500 bg-indigo-500/10' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-gray-500 bg-gray-500/10' },
    { icon: Bell, label: 'Notifications', path: '/notifications', color: 'text-pink-500 bg-pink-500/10' },
  ];

  const recommendations = [
    { title: 'Advanced React Patterns', match: '98% match', reason: 'Based on your frontend progress' },
    { title: 'Machine Learning Basics', match: '94% match', reason: 'Follows Python Programming' },
  ];

  const activities = [
    { title: 'Completed lesson "Loops in Python"', time: '2 hours ago', icon: CheckCircle, color: 'text-green-500' },
    { title: 'Earned "Fast Learner" badge', time: '1 day ago', icon: Award, color: 'text-yellow-500' },
    { title: 'Started "Deep Learning"', time: '2 days ago', icon: Play, color: 'text-blue-500' },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10"
          >
            <div className="flex items-center gap-4">
              <Avatar src={profile?.photoURL} fallback={profile?.displayName} size="xl" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  Welcome back, {profile?.displayName || 'Learner'}
                </h1>
                <p className="text-muted-foreground">Ready to continue your learning journey?</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{xpPoints.toLocaleString()} XP</p>
                  <p className="text-xs text-muted-foreground">Level {level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-semibold">{dailyStreak} Days</p>
                  <p className="text-xs text-muted-foreground">Streak</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {quickStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(stat.link)}
                className="cursor-pointer"
              >
                <Card className="hover:border-primary/50 transition-colors">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => router.push(action.path)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all gap-2"
                >
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Continue Learning */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Continue Learning</CardTitle>
                  <Link href="/courses">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentCourses.map((course, index) => (
                    <motion.div
                      key={course.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="group flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shrink-0">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium group-hover:text-primary transition-colors">{course.title}</h4>
                          <p className="text-sm text-muted-foreground">{course.instructor}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={course.progress} className="h-2 flex-1" />
                            <span className="text-xs font-medium">{course.progress}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Next: {course.nextLesson}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => router.push(`/classroom?course=${course.id}&topic=${encodeURIComponent(course.title)}`)}
                          className="shrink-0"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Recommends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-accent/50">
                      <div>
                        <h4 className="font-medium">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {rec.match}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 ${act.color}`}>
                        <act.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{act.title}</p>
                        <p className="text-xs text-muted-foreground">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Daily Goal */}
              <Card>
                <CardHeader>
                  <CardTitle>Daily Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Study Time</span>
                    <span className="font-medium">{studyTime} min / 60 min</span>
                  </div>
                  <Progress value={(studyTime / 60) * 100} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
