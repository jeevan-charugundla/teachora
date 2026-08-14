export interface LessonContent {
  title: string;
  subject: string;
  grade: string;
  duration: string;
  difficulty: string;
  objectives: string[];
  introduction: string;
  sections: LessonSection[];
  activities: LessonActivity[];
  assessment: LessonAssessment;
  summary: string;
  homework?: string;
  resources?: string[];
}

export interface LessonSection {
  heading: string;
  content: string;
  examples?: string[];
  key_points?: string[];
}

export interface LessonActivity {
  name: string;
  description: string;
  duration: string;
  materials?: string[];
  instructions: string[];
}

export interface LessonAssessment {
  type: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  question: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false' | 'open_ended';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  marks?: number;
}

export interface QuizContent {
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  total_marks: number;
  time_limit?: string;
  instructions: string[];
  questions: AssessmentQuestion[];
}

export interface AssignmentContent {
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  instructions: string[];
  questions: AssignmentQuestion[];
  total_marks: number;
  due_date?: string;
  answer_key?: AnswerKeyEntry[];
}

export interface AssignmentQuestion {
  question: string;
  type: string;
  marks: number;
  sub_questions?: string[];
}

export interface AnswerKeyEntry {
  question_number: number;
  answer: string;
  explanation?: string;
}

export interface WorksheetContent {
  title: string;
  subject: string;
  grade: string;
  instructions: string[];
  sections: WorksheetSection[];
}

export interface WorksheetSection {
  heading: string;
  instructions?: string;
  questions: string[];
}

export interface PresentationContent {
  title: string;
  subject: string;
  grade: string;
  slides: PresentationSlide[];
}

export interface PresentationSlide {
  title: string;
  content: string[];
  notes?: string;
  layout?: 'title' | 'content' | 'two-column' | 'image' | 'blank';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
}

export interface ChatAction {
  label: string;
  type: string;
  prompt?: string;
}

export interface GenerationRequest {
  type: string;
  topic: string;
  subject: string;
  grade: string;
  difficulty?: string;
  duration?: string;
  language?: string;
  teaching_style?: string;
  additional_instructions?: string;
}
