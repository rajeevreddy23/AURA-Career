// User & Auth Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
  lastLogin: Date;
  emailVerified: boolean;
  phoneNumber?: string;
  settings: UserSettings;
  learningPreferences: LearningPreferences;
  statistics: UserStatistics;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  classroomStyle: 'whiteboard' | 'blackboard';
  voiceEnabled: boolean;
  voiceSpeed: number;
  voicePitch: number;
  voiceGender: 'male' | 'female';
  ambientSound: AmbientSoundType;
  notifications: NotificationPreferences;
  keyboardShortcuts: boolean;
  autoNotes: boolean;
  autoCaptions: boolean;
}

export interface LearningPreferences {
  preferredLearningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  codingExperience: 'beginner' | 'intermediate' | 'advanced';
  studySchedule: StudySchedule;
  goals: string[];
  weakConcepts: string[];
  strongConcepts: string[];
  preferredExamples: string[];
  interests: string[];
}

export interface UserStatistics {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  totalStudyTime: number;
  totalQuizzesTaken: number;
  totalQuizzesPassed: number;
  totalProjectsCompleted: number;
  totalCertificatesEarned: number;
  dailyStreak: number;
  longestStreak: number;
  xpPoints: number;
  currentLevel: number;
  achievements: Achievement[];
  badges: Badge[];
}

export interface StudySchedule {
  daysPerWeek: number;
  hoursPerDay: number;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  reminders: boolean;
  reminderTime: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  language: string;
  thumbnail: string;
  banner: string;
  instructor: Instructor;
  modules: Module[];
  totalDuration: number;
  totalLessons: number;
  totalQuizzes: number;
  totalProjects: number;
  rating: number;
  enrolledStudents: number;
  prerequisites: string[];
  learningOutcomes: string[];
  tags: string[];
  price: number;
  hasCertificate: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CourseCategory =
  | 'programming'
  | 'artificial-intelligence'
  | 'mathematics'
  | 'science'
  | 'engineering'
  | 'business'
  | 'finance'
  | 'design'
  | 'languages'
  | 'law'
  | 'medicine'
  | 'humanities'
  | 'data-science'
  | 'cybersecurity'
  | 'cloud-computing'
  | 'mobile-development'
  | 'devops'
  | 'other';

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  chapters: Chapter[];
  totalDuration: number;
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
  content: LessonContent;
  duration: number;
  isCompleted: boolean;
  isLocked: boolean;
  quiz?: Quiz;
  project?: Project;
  resources: Resource[];
}

export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  specializations: string[];
  rating: number;
  totalStudents: number;
  totalCourses: number;
}

// Classroom Types
export interface LessonContent {
  type: 'whiteboard' | 'blackboard' | 'coding' | 'video' | 'interactive';
  sections: LessonSection[];
  boardContent: BoardContent[];
  codeExamples: CodeExample[];
  diagrams: Diagram[];
  equations: Equation[];
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'code' | 'diagram' | 'equation' | 'quiz' | 'exercise';
  order: number;
}

export interface BoardContent {
  id: string;
  type: 'text' | 'heading' | 'code' | 'diagram' | 'formula' | 'list' | 'table' | 'image';
  content: string;
  position: { x: number; y: number };
  style?: BoardStyle;
  animations?: BoardAnimation[];
}

export interface BoardStyle {
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  highlight: boolean;
  handwriting: boolean;
}

export interface BoardAnimation {
  type: 'write' | 'reveal' | 'fade' | 'slide' | 'highlight' | 'draw';
  duration: number;
  delay: number;
}

export interface CodeExample {
  id: string;
  language: string;
  code: string;
  explanation: string;
  output?: string;
  isExecutable: boolean;
  lineByLine: boolean;
}

export interface Diagram {
  id: string;
  type: 'flowchart' | 'mindmap' | 'venn' | 'timeline' | 'chart' | 'graph' | 'architecture';
  data: unknown;
  title: string;
  description: string;
}

export interface Equation {
  id: string;
  latex: string;
  description: string;
  variables: { name: string; value: string; description: string }[];
}

// AI Assistant Types
export interface AIAssistantState {
  isVisible: boolean;
  position: { x: number; y: number };
  animation: AIAnimation;
  emotion: AIEmotion;
  speech: string;
  isSpeaking: boolean;
  gesture: AIGesture;
  pointingTo?: string;
}

export type AIAnimation =
  | 'idle'
  | 'speaking'
  | 'listening'
  | 'thinking'
  | 'celebrating'
  | 'pointing'
  | 'nodding'
  | 'wave'
  | 'float';

export type AIEmotion =
  | 'neutral'
  | 'happy'
  | 'excited'
  | 'curious'
  | 'thinking'
  | 'surprised'
  | 'encouraging'
  | 'proud';

export type AIGesture =
  | 'none'
  | 'point-left'
  | 'point-right'
  | 'point-up'
  | 'point-board'
  | 'highlight'
  | 'draw-circle'
  | 'clap'
  | 'wave';

// Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  type: QuizType;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  totalPoints: number;
  attemptsAllowed: number;
  isTimed: boolean;
  shuffleQuestions: boolean;
  showResults: boolean;
}

export type QuizType =
  | 'multiple-choice'
  | 'coding'
  | 'drag-drop'
  | 'fill-blanks'
  | 'matching'
  | 'short-answer'
  | 'long-answer'
  | 'case-study'
  | 'scenario'
  | 'debugging'
  | 'true-false'
  | 'diagram-label';

export interface Question {
  id: string;
  type: QuizType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  hint: string;
  points: number;
  code?: string;
  diagram?: string;
  image?: string;
}

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  answers: AnswerRecord[];
  timeTaken: number;
  attempts: number;
  completedAt: Date;
}

export interface AnswerRecord {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  timeTaken: number;
}

// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  milestones: Milestone[];
  technologies: string[];
  resources: Resource[];
  estimatedHours: number;
  isRequired: boolean;
  evaluationCriteria: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  isCompleted: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  hints: string[];
  validationCriteria: string[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'documentation' | 'code' | 'link' | 'book' | 'tool';
  url: string;
  description: string;
  isRequired: boolean;
}

// Achievement & Gamification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  unlockedAt?: Date;
  progress: number;
  isUnlocked: boolean;
  criteria: string[];
}

export type AchievementCategory =
  | 'learning'
  | 'coding'
  | 'quiz'
  | 'streak'
  | 'project'
  | 'community'
  | 'milestone'
  | 'hidden';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  xpPoints: number;
  level: number;
  streak: number;
  rank: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  icon: string;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'course_update'
  | 'lesson_reminder'
  | 'achievement_unlocked'
  | 'quiz_result'
  | 'new_course'
  | 'certificate_earned'
  | 'streak_reminder'
  | 'community_reply'
  | 'system_update'
  | 'mentor_message';

export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  sms: boolean;
  courseUpdates: boolean;
  reminders: boolean;
  achievements: boolean;
  community: boolean;
  marketing: boolean;
  quietHours: { start: string; end: string };
}

// AI Agent Types
export interface AIAgentMessage {
  agentId: string;
  agentType: AgentType;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type AgentType =
  | 'curriculum'
  | 'teacher'
  | 'whiteboard'
  | 'voice'
  | 'coding'
  | 'quiz'
  | 'memory'
  | 'translation'
  | 'career'
  | 'analytics'
  | 'help';

export interface AIAgentState {
  agentId: string;
  agentType: AgentType;
  status: 'idle' | 'processing' | 'streaming' | 'error';
  currentTask?: string;
  progress: number;
  lastActive: Date;
}

// Doubt Resolution
export interface Doubt {
  id: string;
  userId: string;
  lessonId: string;
  question: string;
  context: string;
  answer?: string;
  status: 'pending' | 'answered' | 'resolved';
  attachments: string[];
  createdAt: Date;
  resolvedAt?: Date;
  aiResponse: AIResponse;
  isResolved: boolean;
}

export interface AIResponse {
  explanation: string;
  codeExamples: CodeExample[];
  diagrams: Diagram[];
  relatedConcepts: string[];
  suggestedResources: Resource[];
}

// Search Types
export interface SearchResult {
  id: string;
  type: 'course' | 'lesson' | 'concept' | 'code' | 'note' | 'doubt' | 'project' | 'glossary' | 'documentation';
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  relevance: number;
  highlights: string[];
}

// Help Center Types
export interface HelpTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: HelpCategory;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export type HelpCategory =
  | 'account'
  | 'technical'
  | 'learning'
  | 'ai'
  | 'auth'
  | 'coding'
  | 'certificates'
  | 'other';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderType: 'user' | 'ai' | 'support';
  message: string;
  attachments: string[];
  createdAt: Date;
}

// Ambient Sound
export type AmbientSoundType =
  | 'none'
  | 'classroom'
  | 'rain'
  | 'library'
  | 'instrumental'
  | 'white-noise'
  | 'nature'
  | 'coffee-shop';

export interface AmbientSoundConfig {
  type: AmbientSoundType;
  volume: number;
  isPlaying: boolean;
}

// Certificate
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationId: string;
  grade: string;
  score: number;
  totalHours: number;
  skills: string[];
  instructorName: string;
  isVerified: boolean;
  metadata: Record<string, unknown>;
}

// API Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StreamChunk {
  id: string;
  type: 'text' | 'code' | 'diagram' | 'animation' | 'command' | 'speech' | 'complete';
  content: string;
  metadata?: Record<string, unknown>;
}

// Teacher Styles
export type TeacherStyleId = 'professor' | 'coach' | 'friend' | 'expert' | 'simplifier';

export interface TeacherStyle {
  id: TeacherStyleId;
  name: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  voiceStyle: string;
  teachingApproach: string;
  explanationDepth: 'basic' | 'moderate' | 'deep' | 'comprehensive';
  useAnalogies: boolean;
  useExamples: boolean;
  useHumor: boolean;
  encourageQuestions: boolean;
  pace: 'slow' | 'moderate' | 'fast';
}

export interface BoardPage {
  id: string;
  pageNumber: number;
  items: BoardContentItem[];
  createdAt: Date;
  downloaded: boolean;
}

export interface BoardContentItem {
  id: string;
  type: 'heading' | 'text' | 'code' | 'diagram' | 'bullets' | 'quiz' | 'check';
  content: string;
  isStreaming?: boolean;
  timestamp: Date;
}
