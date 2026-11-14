export type TeacherId = 'professor' | 'friend' | 'simplifier' | 'coach' | 'expert';

export interface TeacherProfile {
  id: TeacherId;
  name: string;
  initial: string;
  gender: 'female' | 'male';
  role: string;
  color: string;
  skin: string;
  hair: string;
  hairstyle: 'long' | 'ponytail' | 'bob' | 'short' | 'swept';
  voice: string;
  browserVoices: string[];
  pitch: number;
  rate: number;
  approach: string;
}

export const TEACHERS: TeacherProfile[] = [
  { id: 'professor', name: 'Pravalika', initial: 'P', gender: 'female', role: 'Professor', color: '#818cf8', skin: '#c98b68', hair: '#241713', hairstyle: 'long', voice: 'en-US-Neural2-F', browserVoices: ['Zira', 'Samantha', 'Jenny'], pitch: 1.02, rate: 0.94, approach: 'Build understanding with clear definitions, a worked example, and a thoughtful check for understanding.' },
  { id: 'friend', name: 'Navya', initial: 'N', gender: 'female', role: 'Friend', color: '#f472b6', skin: '#dfaa82', hair: '#3c241d', hairstyle: 'ponytail', voice: 'en-US-Neural2-C', browserVoices: ['Aria', 'Susan', 'Zira'], pitch: 1.12, rate: 1, approach: 'Learn together through everyday analogies, patient explanations, and friendly encouragement.' },
  { id: 'simplifier', name: 'Srihita', initial: 'S', gender: 'female', role: 'Simplifier', color: '#2dd4bf', skin: '#b87955', hair: '#1c171b', hairstyle: 'bob', voice: 'en-GB-Neural2-A', browserVoices: ['Hazel', 'Sonia', 'Karen', 'Zira'], pitch: 1.06, rate: 0.87, approach: 'One idea at a time, visual steps, simple language, and small experiments.' },
  { id: 'coach', name: 'Madhu', initial: 'M', gender: 'male', role: 'Coach', color: '#fbbf24', skin: '#bc825c', hair: '#2a1b15', hairstyle: 'short', voice: 'en-US-Neural2-D', browserVoices: ['David', 'Guy', 'Alex'], pitch: 0.95, rate: 1.08, approach: 'Practice with focused challenges, useful hints, and feedback on each attempt.' },
  { id: 'expert', name: 'Rajeev', initial: 'R', gender: 'male', role: 'Expert', color: '#a78bfa', skin: '#d19a73', hair: '#17181f', hairstyle: 'swept', voice: 'en-GB-Neural2-B', browserVoices: ['George', 'Ryan', 'Daniel', 'David'], pitch: 0.85, rate: 0.97, approach: 'Explore practical engineering decisions, edge cases, and accurate trade-offs.' },
];

export function getTeacher(style = 'professor'): TeacherProfile {
  const value = style.toLowerCase();
  return TEACHERS.find(t => value.includes(t.id) || value.includes(t.name.toLowerCase())) || TEACHERS[0];
}
