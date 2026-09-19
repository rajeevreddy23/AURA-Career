/**
 * Centralized User Data Scoping and Persistence Manager
 * Ensures 100% individual data isolation across students in AuraCareer.
 * All localStorage keys and state queries are strictly scoped to the user's UID.
 */

import { auth } from '@/lib/firebase/config';

export interface UserCertificate {
  id: string;
  courseId: string;
  courseName: string;
  level?: string;
  date: string;
  grade: string;
  score?: number;
  verificationId: string;
  skills: string[];
  studentName: string;
  studentEmail?: string;
  language?: string;
}

export interface UserEnrollment {
  courseId: string;
  courseTitle: string;
  level: string;
  enrolledAt: string;
  currentModuleIndex: number;
  currentSlideIndex: number;
  progress: number;
  lastActive?: string;
}

export interface UserDynamicStats {
  enrolledCount: number;
  inProgressCount: number;
  completedCount: number;
  studyHours: number;
  xpPoints: number;
  level: number;
  dailyStreak: number;
}

/**
 * Returns the active user's unique ID, or 'guest' if unauthenticated
 */
export function getEffectiveUid(explicitUid?: string | null): string {
  if (explicitUid && explicitUid.trim()) return explicitUid.trim();
  if (typeof window !== 'undefined' && auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  return 'guest';
}

/**
 * Generates a strictly user-scoped storage key
 */
export function getUserStorageKey(key: string, explicitUid?: string | null): string {
  const uid = getEffectiveUid(explicitUid);
  return `aura_user_${uid}_${key}`;
}

/**
 * Retrieves all verified certificates issued specifically to this user
 */
export function getUserCertificates(explicitUid?: string | null): UserCertificate[] {
  if (typeof window === 'undefined') return [];
  const key = getUserStorageKey('certificates', explicitUid);
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new certificate strictly to this user's account
 */
export function saveUserCertificate(cert: UserCertificate, explicitUid?: string | null): void {
  if (typeof window === 'undefined') return;
  const uid = getEffectiveUid(explicitUid);
  const key = getUserStorageKey('certificates', uid);
  const current = getUserCertificates(uid);
  
  // Upsert certificate by verificationId or courseId
  const existingIdx = current.findIndex((c) => c.verificationId === cert.verificationId || c.id === cert.id);
  let updated: UserCertificate[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...cert };
  } else {
    updated = [cert, ...current];
  }

  localStorage.setItem(key, JSON.stringify(updated));

  // Also update user's completed count in stats
  const stats = getUserStats(uid);
  stats.completedCount = updated.length;
  saveUserStats(stats, uid);
}

/**
 * Retrieves all course enrollments for this user
 */
export function getUserEnrollments(explicitUid?: string | null): Record<string, UserEnrollment> {
  if (typeof window === 'undefined') return {};
  const key = getUserStorageKey('enrollments', explicitUid);
  const raw = localStorage.getItem(key);
  if (!raw) return {};
  try {
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

/**
 * Saves an enrollment for this user
 */
export function saveUserEnrollment(
  courseId: string,
  enrollment: Partial<UserEnrollment>,
  explicitUid?: string | null
): void {
  if (typeof window === 'undefined') return;
  const uid = getEffectiveUid(explicitUid);
  const key = getUserStorageKey('enrollments', uid);
  const all = getUserEnrollments(uid);

  const existing = all[courseId] || {
    courseId,
    courseTitle: enrollment.courseTitle || 'Course',
    level: enrollment.level || 'beginner',
    enrolledAt: new Date().toISOString(),
    currentModuleIndex: 0,
    currentSlideIndex: 0,
    progress: 0,
  };

  all[courseId] = {
    ...existing,
    ...enrollment,
    lastActive: new Date().toISOString(),
  };

  localStorage.setItem(key, JSON.stringify(all));

  // Re-calculate user stats
  recalculateUserStats(uid);
}

/**
 * Gets progress percentage (0 - 100) for a specific course for this user
 */
export function getUserCourseProgress(courseId: string, explicitUid?: string | null): number {
  if (typeof window === 'undefined') return 0;
  const enrollments = getUserEnrollments(explicitUid);
  if (enrollments[courseId]?.progress !== undefined) {
    return enrollments[courseId].progress;
  }
  const progKey = getUserStorageKey(`progress_${courseId}`, explicitUid);
  const raw = localStorage.getItem(progKey);
  return raw ? parseInt(raw, 10) || 0 : 0;
}

/**
 * Saves progress percentage for a specific course for this user
 */
export function saveUserCourseProgress(
  courseId: string,
  progress: number,
  explicitUid?: string | null
): void {
  if (typeof window === 'undefined') return;
  const uid = getEffectiveUid(explicitUid);
  const boundedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  // Save standalone key
  const progKey = getUserStorageKey(`progress_${courseId}`, uid);
  localStorage.setItem(progKey, String(boundedProgress));

  // Also update inside enrollments record
  const enrollments = getUserEnrollments(uid);
  if (enrollments[courseId]) {
    enrollments[courseId].progress = boundedProgress;
    localStorage.setItem(getUserStorageKey('enrollments', uid), JSON.stringify(enrollments));
  }

  recalculateUserStats(uid);
}

/**
 * Returns dynamic stats computed strictly from this user's data
 */
export function getUserStats(explicitUid?: string | null): UserDynamicStats {
  if (typeof window === 'undefined') {
    return {
      enrolledCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      studyHours: 0,
      xpPoints: 0,
      level: 1,
      dailyStreak: 0,
    };
  }

  const uid = getEffectiveUid(explicitUid);
  const key = getUserStorageKey('stats', uid);
  const raw = localStorage.getItem(key);

  const enrollments = getUserEnrollments(uid);
  const certs = getUserCertificates(uid);

  const enrollmentList = Object.values(enrollments);
  const enrolledCount = enrollmentList.length;
  const inProgressCount = enrollmentList.filter((e) => e.progress > 0 && e.progress < 100).length;
  const completedCount = Math.max(
    certs.length,
    enrollmentList.filter((e) => e.progress >= 100).length
  );

  let stored: Partial<UserDynamicStats> = {};
  if (raw) {
    try {
      stored = JSON.parse(raw);
    } catch {}
  }

  const xpPoints = stored.xpPoints ?? (completedCount * 500 + inProgressCount * 150);
  const level = stored.level ?? Math.max(1, Math.floor(xpPoints / 1000) + 1);
  const dailyStreak = stored.dailyStreak ?? (enrolledCount > 0 ? 1 : 0);
  const studyHours = stored.studyHours ?? (completedCount * 12 + inProgressCount * 4);

  return {
    enrolledCount,
    inProgressCount,
    completedCount,
    studyHours,
    xpPoints,
    level,
    dailyStreak,
  };
}

/**
 * Saves customized stats for this user
 */
export function saveUserStats(stats: Partial<UserDynamicStats>, explicitUid?: string | null): void {
  if (typeof window === 'undefined') return;
  const uid = getEffectiveUid(explicitUid);
  const current = getUserStats(uid);
  const updated = { ...current, ...stats };
  localStorage.setItem(getUserStorageKey('stats', uid), JSON.stringify(updated));
}

/**
 * Recalculates stats based on enrollments and certificates
 */
export function recalculateUserStats(uid: string): UserDynamicStats {
  const stats = getUserStats(uid);
  saveUserStats(stats, uid);
  return stats;
}

/**
 * Gets the preferred display name for certificates and dashboard
 */
export function getUserStudentName(explicitUid?: string | null, fallback?: string): string {
  if (typeof window === 'undefined') return fallback || 'Student';
  const uid = getEffectiveUid(explicitUid);
  const key = getUserStorageKey('student_name', uid);
  const saved = localStorage.getItem(key);
  if (saved && saved.trim()) return saved.trim();

  if (auth.currentUser?.displayName) return auth.currentUser.displayName;
  if (auth.currentUser?.email) return auth.currentUser.email.split('@')[0];

  return fallback || 'Student';
}

/**
 * Saves customized certificate student name
 */
export function saveUserStudentName(name: string, explicitUid?: string | null): void {
  if (typeof window === 'undefined') return;
  const uid = getEffectiveUid(explicitUid);
  const key = getUserStorageKey('student_name', uid);
  localStorage.setItem(key, name.trim());
}

/**
 * Issues a verified credential for a student
 */
export function issueCredentialForStudent(
  courseId: string,
  courseTitle: string,
  grade = 'A+ (Honors)',
  score = 98,
  skills: string[] = ['System Architecture', 'Algorithms', 'Engineering'],
  explicitUid?: string | null,
  studentName?: string
): UserCertificate {
  const uid = getEffectiveUid(explicitUid);
  const resolvedName = studentName || getUserStudentName(uid);
  const verificationHash = `AURA-CERT-${courseId.toUpperCase().slice(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const cert: UserCertificate = {
    id: `cert-${courseId}-${Date.now()}`,
    courseId,
    courseName: courseTitle,
    level: 'Mastery',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    grade,
    score,
    verificationId: verificationHash,
    skills,
    studentName: resolvedName,
    studentEmail: auth.currentUser?.email || undefined,
  };

  saveUserCertificate(cert, uid);
  saveUserCourseProgress(courseId, 100, uid);
  return cert;
}
