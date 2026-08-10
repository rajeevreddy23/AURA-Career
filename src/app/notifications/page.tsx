'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Bell, BookOpen, Award, Flame, MessageSquare, CheckCheck, X,
  Star, Calendar, Bot, Trash2
} from 'lucide-react';

type NotificationCategory = 'All' | 'Unread' | 'Learning' | 'Achievement' | 'Community' | 'AI';

interface Notification {
  id: string;
  icon: any;
  title: string;
  description: string;
  time: string;
  read: boolean;
  category: NotificationCategory;
  aiHandled?: boolean;
  actionUrl?: string;
  color: string;
}

const initialNotifications: Notification[] = [
  { id: '1', icon: Bot, title: 'Resume Learning?', description: "You're 80% through Python Programming — resume it?", time: '5 min ago', read: false, category: 'AI', aiHandled: true, actionUrl: '/classroom?course=python', color: 'bg-primary/10 text-primary' },
  { id: '2', icon: BookOpen, title: 'New lesson available', description: 'Module 3: Functions & Modules is now available', time: '10 min ago', read: false, category: 'Learning', color: 'bg-blue-500/10 text-blue-500' },
  { id: '3', icon: Bot, title: 'Concept Review', description: 'Based on your quiz scores, review Recursion.', time: '1 hour ago', read: false, category: 'AI', aiHandled: true, actionUrl: '/courses', color: 'bg-primary/10 text-primary' },
  { id: '4', icon: Flame, title: '7-day streak achieved!', description: 'Keep it up! You have been learning for 7 days straight.', time: '2 hours ago', read: true, category: 'Achievement', color: 'bg-orange-500/10 text-orange-500' },
  { id: '5', icon: MessageSquare, title: 'New reply to your discussion', description: 'Alex replied to your question about variables.', time: '1 day ago', read: true, category: 'Community', color: 'bg-green-500/10 text-green-500' },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<NotificationCategory>('All');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return !n.read;
    return n.category === activeTab;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const tabs: NotificationCategory[] = ['All', 'Unread', 'Learning', 'Achievement', 'Community', 'AI'];

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-sm">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={markAllRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>

            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 no-scrollbar">
              {tabs.map(tab => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className="rounded-full whitespace-nowrap"
                >
                  {tab}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No notifications found in this category.</p>
                  </motion.div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card 
                        className={cn(
                          'transition-all relative group cursor-pointer overflow-hidden', 
                          !notif.read ? 'bg-primary/[0.03] border-primary/30 shadow-sm' : 'hover:border-border/80'
                        )}
                        onClick={() => {
                          if (!notif.read) markAsRead(notif.id);
                        }}
                      >
                        <CardContent className="flex items-start gap-4 py-4 pr-12">
                          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0', notif.color)}>
                            <notif.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className={cn("font-medium text-sm", !notif.read && "font-semibold")}>
                                    {notif.title}
                                  </h4>
                                  {notif.aiHandled && (
                                    <Badge variant="secondary" className="text-[10px] h-5 bg-primary/10 text-primary border-0">
                                      🤖 Handled by AI
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{notif.description}</p>
                                
                                {notif.actionUrl && (
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="mt-2 text-xs h-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notif.id);
                                      router.push(notif.actionUrl!);
                                    }}
                                  >
                                    Take Action
                                  </Button>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground shrink-0">{notif.time}</span>
                            </div>
                          </div>
                          {!notif.read && <span className="absolute top-1/2 -translate-y-1/2 right-12 h-2 w-2 rounded-full bg-primary shrink-0" />}
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
