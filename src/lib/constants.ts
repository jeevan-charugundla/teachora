export const APP_NAME = 'Teachora';
export const APP_TAGLINE = 'The Teacher Creation Studio';
export const APP_DESCRIPTION = 'Create. Teach. Inspire.';

export const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education',
  'Social Studies',
  'Economics',
  'Literature',
  'Foreign Language',
  'Environmental Science',
  'Other',
] as const;

export const GRADE_LEVELS = [
  'Pre-K',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'College',
  'University',
  'Adult Education',
] as const;

export const DIFFICULTY_LEVELS = [
  'Easy',
  'Medium',
  'Hard',
  'Advanced',
] as const;

export const TEACHING_STYLES = [
  'Simple and clear',
  'Interactive and engaging',
  'Detailed and thorough',
  'Visual and creative',
  'Story-based',
  'Inquiry-based',
  'Balanced',
] as const;

export const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Chinese',
  'Japanese',
  'Arabic',
  'Portuguese',
  'Other',
] as const;

export const PROJECT_TYPES = {
  lesson: { label: 'Lesson', icon: 'BookOpen' },
  notes: { label: 'Notes', icon: 'FileText' },
  assignment: { label: 'Assignment', icon: 'ClipboardList' },
  worksheet: { label: 'Worksheet', icon: 'FileSpreadsheet' },
  quiz: { label: 'Quiz', icon: 'HelpCircle' },
  'mock-test': { label: 'Mock Test', icon: 'Timer' },
  'question-paper': { label: 'Question Paper', icon: 'FileQuestion' },
  exam: { label: 'Exam', icon: 'GraduationCap' },
  presentation: { label: 'Presentation', icon: 'Presentation' },
  visual: { label: 'Visual', icon: 'Image' },
  video: { label: 'Video', icon: 'Video' },
  flashcards: { label: 'Flashcards', icon: 'Layers' },
  activity: { label: 'Activity', icon: 'Puzzle' },
  pack: { label: 'Teaching Pack', icon: 'Package' },
} as const;

export type ProjectType = keyof typeof PROJECT_TYPES;
