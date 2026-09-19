'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { getUserStats, getUserCertificates, getUserStorageKey } from '@/lib/utils/userData';
import { User, Mail, Calendar, MapPin, Globe, Edit2, Save, Award, BookOpen, Clock, Flame, Trophy, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const [userStats, setUserStats] = useState({
    enrolledCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    studyHours: 0,
    xpPoints: 0,
    level: 1,
    dailyStreak: 0,
  });

  const [userBio, setUserBio] = useState('Passionate learner exploring AI and modern software engineering.');
  const [userLocation, setUserLocation] = useState('Online Campus');
  const [userWebsite, setUserWebsite] = useState('https://auracareer.com');

  useEffect(() => {
    const stats = getUserStats(user?.uid);
    setUserStats(stats);

    if (user?.uid) {
      try {
        const savedBio = localStorage.getItem(getUserStorageKey('bio', user.uid));
        const savedLoc = localStorage.getItem(getUserStorageKey('location', user.uid));
        const savedWeb = localStorage.getItem(getUserStorageKey('website', user.uid));
        if (savedBio) setUserBio(savedBio);
        if (savedLoc) setUserLocation(savedLoc);
        if (savedWeb) setUserWebsite(savedWeb);
      } catch {}
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (user?.uid) {
      localStorage.setItem(getUserStorageKey('bio', user.uid), userBio);
      localStorage.setItem(getUserStorageKey('location', user.uid), userLocation);
      localStorage.setItem(getUserStorageKey('website', user.uid), userWebsite);
    }
    setIsEditing(false);
    toast.success('Profile details updated successfully!');
  };

  const stats = [
    { icon: BookOpen, label: 'Courses Completed', value: String(userStats.completedCount) },
    { icon: Clock, label: 'Study Hours', value: `${userStats.studyHours}h` },
    { icon: Flame, label: 'Day Streak', value: `${userStats.dailyStreak}` },
    { icon: Trophy, label: 'Active Courses', value: String(userStats.inProgressCount + userStats.completedCount) },
  ];

  const studentName =
    user?.displayName || profile?.displayName || user?.email?.split('@')[0] || 'Learner';

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile Header */}
            <Card className="mb-8 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-amber-500" />
              <CardContent className="relative -mt-16">
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                  <Avatar src={profile?.photoURL} fallback={studentName} size="2xl" className="border-4 border-background" />
                  <div className="flex-1 pt-4 sm:pt-0">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold">{studentName}</h1>
                      <Badge variant="primary" size="sm">Student</Badge>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                        UID: {user?.uid ? user.uid.slice(0, 8) : 'GUEST'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{user?.email || profile?.email || 'student@auracareer.com'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {user?.emailVerified ? 'Verified Account' : 'Active Account'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? 'primary' : 'outline'}
                    onClick={() => {
                      if (isEditing) handleSaveProfile();
                      else setIsEditing(true);
                    }}
                  >
                    {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                    {isEditing ? 'Save Profile' : 'Edit Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left - Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Student</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">Bio</label>
                          <textarea
                            value={userBio}
                            onChange={(e) => setUserBio(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">Location</label>
                          <input
                            type="text"
                            value={userLocation}
                            onChange={(e) => setUserLocation(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground block mb-1">Portfolio / Website</label>
                          <input
                            type="text"
                            value={userWebsite}
                            onChange={(e) => setUserWebsite(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground leading-relaxed">{userBio}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" /> {userLocation}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4 text-primary" /> {userWebsite}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Verified Credentials on Record</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userStats.completedCount === 0 ? (
                      <div className="text-center py-6 text-muted-foreground space-y-2">
                        <Award className="h-8 w-8 mx-auto text-muted-foreground/60" />
                        <p className="text-sm">No verified credentials earned yet on this account.</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                        <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                        <span>You have {userStats.completedCount} cryptographically verified certificates registered under your account.</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right - Stats & Achievements */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <stat.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{stat.label}</span>
                        </div>
                        <span className="font-semibold">{stat.value}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">XP Points</span>
                        <span className="font-bold text-primary">{userStats.xpPoints.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Level</span>
                        <span className="font-bold text-primary">{userStats.level}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
