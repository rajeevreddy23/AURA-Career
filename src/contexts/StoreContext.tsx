'use client';

import { create } from 'zustand';
import type {
  UserProfile,
  Course,
  Module,
  Chapter,
  QuizResult,
  Project,
  Certificate,
  Achievement,
  Badge,
  Notification,
  SearchResult,
} from '@/types';

interface AppStore {
  // User
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;

  // Courses
  enrolledCourses: Course[];
  setEnrolledCourses: (courses: Course[]) => void;
  currentCourse: Course | null;
  setCurrentCourse: (course: Course | null) => void;
  currentModule: Module | null;
  setCurrentModule: (module: Module | null) => void;
  currentChapter: Chapter | null;
  setCurrentChapter: (chapter: Chapter | null) => void;

  // Progress
  courseProgress: Record<string, number>;
  setCourseProgress: (courseId: string, progress: number) => void;
  completedLessons: string[];
  addCompletedLesson: (lessonId: string) => void;

  // Quizzes
  quizResults: QuizResult[];
  addQuizResult: (result: QuizResult) => void;

  // Projects
  projects: Project[];
  setProjects: (projects: Project[]) => void;

  // Certificates
  certificates: Certificate[];
  setCertificates: (certificates: Certificate[]) => void;

  // Gamification
  achievements: Achievement[];
  setAchievements: (achievements: Achievement[]) => void;
  badges: Badge[];
  setBadges: (badges: Badge[]) => void;
  xpPoints: number;
  addXP: (points: number) => void;
  level: number;
  setLevel: (level: number) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;

  // Search
  searchResults: SearchResult[];
  setSearchResults: (results: SearchResult[]) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;

  // Study Session
  studyTime: number;
  addStudyTime: (minutes: number) => void;
  dailyStreak: number;
  setDailyStreak: (streak: number) => void;
  lastStudyDate: string;
  setLastStudyDate: (date: string) => void;

  // Multi-user Isolation
  resetUserStore: () => void;
  hydrateUserStore: (uid: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // User
  profile: null,
  setProfile: (profile) => set({ profile }),

  // Courses
  enrolledCourses: [],
  setEnrolledCourses: (courses) => set({ enrolledCourses: courses }),
  currentCourse: null,
  setCurrentCourse: (course) => set({ currentCourse: course, currentModule: null, currentChapter: null }),
  currentModule: null,
  setCurrentModule: (module) => set({ currentModule: module, currentChapter: null }),
  currentChapter: null,
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

  // Progress
  courseProgress: {},
  setCourseProgress: (courseId, progress) =>
    set((state) => ({
      courseProgress: { ...state.courseProgress, [courseId]: progress },
    })),
  completedLessons: [],
  addCompletedLesson: (lessonId) =>
    set((state) => ({
      completedLessons: [...state.completedLessons, lessonId],
    })),

  // Quizzes
  quizResults: [],
  addQuizResult: (result) =>
    set((state) => ({
      quizResults: [...state.quizResults, result],
    })),

  // Projects
  projects: [],
  setProjects: (projects) => set({ projects }),

  // Certificates
  certificates: [],
  setCertificates: (certificates) => set({ certificates }),

  // Gamification
  achievements: [],
  setAchievements: (achievements) => set({ achievements }),
  badges: [],
  setBadges: (badges) => set({ badges }),
  xpPoints: 0,
  addXP: (points) =>
    set((state) => ({ xpPoints: state.xpPoints + points })),
  level: 1,
  setLevel: (level) => set({ level }),

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),

  // Search
  searchResults: [],
  setSearchResults: (results) => set({ searchResults: results }),
  isSearching: false,
  setIsSearching: (isSearching) => set({ isSearching }),

  // Study Session
  studyTime: 0,
  addStudyTime: (minutes) =>
    set((state) => ({ studyTime: state.studyTime + minutes })),
  dailyStreak: 0,
  setDailyStreak: (streak) => set({ dailyStreak: streak }),
  lastStudyDate: '',
  setLastStudyDate: (date) => set({ lastStudyDate: date }),

  resetUserStore: () =>
    set({
      enrolledCourses: [],
      currentCourse: null,
      currentModule: null,
      currentChapter: null,
      courseProgress: {},
      completedLessons: [],
      quizResults: [],
      projects: [],
      certificates: [],
      achievements: [],
      badges: [],
      xpPoints: 0,
      level: 1,
      studyTime: 0,
      dailyStreak: 0,
      lastStudyDate: '',
    }),

  hydrateUserStore: (uid: string) => {
    if (typeof window === 'undefined' || !uid) return;
    try {
      const statsKey = `aura_user_${uid}_stats`;
      const certsKey = `aura_user_${uid}_certificates`;
      const rawStats = localStorage.getItem(statsKey);
      const rawCerts = localStorage.getItem(certsKey);
      const certs = rawCerts ? JSON.parse(rawCerts) : [];
      let stats = rawStats ? JSON.parse(rawStats) : null;
      if (stats) {
        set({
          xpPoints: stats.xpPoints || 0,
          level: stats.level || 1,
          studyTime: (stats.studyHours || 0) * 60,
          dailyStreak: stats.dailyStreak || 0,
          certificates: certs,
        });
      } else {
        set({ certificates: certs });
      }
    } catch {}
  },
}));
