import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  multiFactor,
  PhoneMultiFactorGenerator,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, setAuthPersistence } from './config';
import type { UserProfile, UserSettings } from '@/types';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const githubProvider = new GithubAuthProvider();
githubProvider.setCustomParameters({ prompt: 'select_account' });

const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  prompt: 'select_account',
  tenant: 'consumers',
});

const defaultSettings: UserSettings = {
  theme: 'system',
  language: 'en',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  classroomStyle: 'whiteboard',
  voiceEnabled: true,
  voiceSpeed: 1,
  voicePitch: 1,
  voiceGender: 'female',
  ambientSound: 'none',
  notifications: {
    push: true,
    email: true,
    sms: false,
    courseUpdates: true,
    reminders: true,
    achievements: true,
    community: true,
    marketing: false,
    quietHours: { start: '22:00', end: '08:00' },
  },
  keyboardShortcuts: true,
  autoNotes: true,
  autoCaptions: true,
};

const createUserProfile = async (user: User, additionalData?: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Learner',
      photoURL: user.photoURL || '',
      role: 'student',
      createdAt: new Date(),
      lastLogin: new Date(),
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber || undefined,
      settings: defaultSettings,
      learningPreferences: {
        preferredLearningStyle: 'visual',
        codingExperience: 'beginner',
        studySchedule: {
          daysPerWeek: 5,
          hoursPerDay: 1,
          preferredTime: 'evening',
          reminders: true,
          reminderTime: '09:00',
        },
        goals: [],
        weakConcepts: [],
        strongConcepts: [],
        preferredExamples: [],
        interests: [],
      },
      statistics: {
        totalCoursesEnrolled: 0,
        totalCoursesCompleted: 0,
        totalLessonsCompleted: 0,
        totalStudyTime: 0,
        totalQuizzesTaken: 0,
        totalQuizzesPassed: 0,
        totalProjectsCompleted: 0,
        totalCertificatesEarned: 0,
        dailyStreak: 0,
        longestStreak: 0,
        xpPoints: 0,
        currentLevel: 1,
        achievements: [],
        badges: [],
      },
      ...additionalData,
    };

    await setDoc(userRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });
  }
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  await createUserProfile(credential.user, { displayName });
  return credential;
};

export const loginWithEmail = async (
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<UserCredential> => {
  await setAuthPersistence(rememberMe);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await createUserProfile(credential.user);
  return credential;
};

export const loginWithGoogle = async (): Promise<UserCredential> => {
  const credential = await signInWithPopup(auth, googleProvider);
  await createUserProfile(credential.user);
  return credential;
};

export const loginWithGithub = async (): Promise<UserCredential> => {
  const credential = await signInWithPopup(auth, githubProvider);
  await createUserProfile(credential.user);
  return credential;
};

export const loginWithMicrosoft = async (): Promise<UserCredential> => {
  const credential = await signInWithPopup(auth, microsoftProvider);
  await createUserProfile(credential.user);
  return credential;
};

export const loginWithPhone = async (
  phoneNumber: string,
  applicationVerifier: RecaptchaVerifier
) => {
  const credential = await signInWithPhoneNumber(auth, phoneNumber, applicationVerifier);
  return credential;
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

export const verifyEmail = async (user: User) => {
  await sendEmailVerification(user);
};

export const logout = async () => {
  await signOut(auth);
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  }
  return null;
};

export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
  });
};

export const enrollMFA = async (user: User, phoneNumber: string) => {
  const authInstance = auth;
  const multiFactorSession = await multiFactor(authInstance).getSession();
  const phoneInfoOptions = {
    phoneNumber,
    session: multiFactorSession,
  };
  const phoneAuthProvider = new PhoneAuthProvider(authInstance);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber(
    phoneInfoOptions,
    new RecaptchaVerifier(authInstance, 'recaptcha-container', { size: 'invisible' })
  );
  return verificationId;
};

export const completeMFAEnrollment = async (
  verificationId: string,
  verificationCode: string,
  displayName: string
) => {
  const authInstance = auth;
  const phoneAuthCredential = PhoneAuthProvider.credential(
    verificationId,
    verificationCode
  );
  const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(
    phoneAuthCredential
  );
  await multiFactor(authInstance).enroll(multiFactorAssertion, displayName);
};
