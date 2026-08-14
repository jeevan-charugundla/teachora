export type CreationCategory = 'teach' | 'practice' | 'assess' | 'visualize';

export type CreationType =
  // Teach
  | 'lesson'
  | 'notes'
  | 'presentation'
  | 'video'
  // Practice
  | 'assignment'
  | 'worksheet'
  | 'activity'
  | 'flashcards'
  // Assess
  | 'quiz'
  | 'mock-test'
  | 'question-paper'
  | 'exam'
  // Visualize
  | 'diagram'
  | 'mind-map'
  | 'chart'
  | 'infographic';

export interface CreationMeta {
  type: CreationType;
  category: CreationCategory;
  title: string;
  subtitle: string;
  color: string;
  iconName: string;
}

export interface ChartDataRow {
  id: string;
  label: string;
  value: number;
}

export interface QuestionPaperSection {
  id: string;
  name: string;
  questionType: string;
  questionCount: number;
  marksPerQuestion: number;
  instructions?: string;
}

export interface CreationFormState {
  type: CreationType;
  // ── Common Details ──────────────────────────────────────────────────────────
  subject: string;
  grade: string;
  topic: string;
  language: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed' | 'Beginner' | 'Intermediate' | 'Advanced';
  additionalInstructions: string;

  // ── Lesson ──────────────────────────────────────────────────────────────────
  lessonType: 'Introduction' | 'Concept' | 'Skill-building' | 'Review' | 'Application';
  duration: string;
  learningObjectives: string;
  teachingStyle: string;
  includeActivities: boolean;
  includeAssessment: boolean;
  includeHomework: boolean;

  // ── Notes ───────────────────────────────────────────────────────────────────
  notesPurpose: 'Teacher Notes' | 'Student Notes' | 'Revision Notes' | 'Exam Preparation';
  notesDepth: 'Quick' | 'Standard' | 'Detailed';
  notesIncludes: string[];

  // ── Presentation ─────────────────────────────────────────────────────────────
  slideCount: string;
  presentationGoal: string;
  presentationPurpose: 'Teach a concept' | 'Introduce a topic' | 'Review & revision' | 'Project presentation' | 'Parent meeting';
  visualStyle: 'Clean' | 'Academic' | 'Modern' | 'Playful' | 'Minimal';
  presentationIncludes: string[];
  presentationSpeakerNotes: boolean;
  presentationVisualSource: 'Auto' | 'Stock' | 'AI' | 'None';

  // ── Video ────────────────────────────────────────────────────────────────────
  videoDuration: string;
  videoAudience: string;
  videoStyle: 'Explainer' | 'Story-based' | 'Whiteboard' | 'Presentation' | 'Animated concept';
  videoNarrationStyle: 'Formal' | 'Conversational' | 'Step-by-step' | 'Question-led';
  videoVisualStyle: 'Animated' | 'Live footage' | 'Diagrams' | 'Mixed';
  videoIncludes: string[];
  videoVisualSource: 'Stock (Pexels)' | 'AI (Pollinations)' | 'Auto';

  // ── Assignment ───────────────────────────────────────────────────────────────
  assignmentTitle: string;
  assignmentType: 'Homework' | 'Classwork' | 'Practice' | 'Research' | 'Project';
  questionCount: string;
  questionTypes: string[];
  totalMarks: string;
  assignmentIncludeRubric: boolean;
  assignmentIncludeAnswerKey: boolean;
  assignmentIncludes: string[];

  // ── Worksheet ────────────────────────────────────────────────────────────────
  worksheetPurpose: 'Practice' | 'Revision' | 'Assessment' | 'Homework';
  worksheetQuestionCount: string;
  worksheetQuestionTypes: string[];
  worksheetStyle: 'Minimal' | 'Classroom' | 'Exam-style' | 'Practice-focused';
  worksheetIncludeAnswerKey: boolean;
  worksheetIncludes: string[];

  // ── Activity ─────────────────────────────────────────────────────────────────
  activityType: 'Individual' | 'Pair' | 'Group' | 'Whole class';
  activityKind: 'Hands-on' | 'Discussion' | 'Game' | 'Experiment' | 'Creative' | 'Research';
  activityDuration: string;
  activityObjective: string;
  activityIncludes: string[];

  // ── Flashcards ───────────────────────────────────────────────────────────────
  flashcardCount: string;
  flashcardType: 'Term → Definition' | 'Question → Answer' | 'Concept → Example' | 'Mixed';
  flashcardDifficulty: 'Easy' | 'Mixed' | 'Challenging';
  flashcardIncludes: string[];

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  quizQuestionCount: string;
  quizQuestionTypes: string[];
  quizTimeLimit: string;
  quizIncludeExplanations: boolean;
  quizRandomize: boolean;
  quizIncludes: string[];

  // ── Mock Test ────────────────────────────────────────────────────────────────
  mockDuration: string;
  mockTotalMarks: string;
  easyPercentage: number;
  mediumPercentage: number;
  hardPercentage: number;
  mockQuestionTypes: string[];
  mockIncludes: string[];

  // ── Question Paper & Exam ────────────────────────────────────────────────────
  examName: string;
  examDuration: string;
  examTotalMarks: string;
  syllabusTopics: string;
  sections: QuestionPaperSection[];
  examIncludes: string[];

  // ── Diagram ──────────────────────────────────────────────────────────────────
  diagramGoal: string;
  diagramType:
    | 'Process Diagram'
    | 'Flowchart'
    | 'Labeled Diagram'
    | 'Cycle Diagram'
    | 'Comparison Diagram'
    | 'Hierarchy'
    | 'Timeline'
    | 'Scientific Diagram'
    | 'System Diagram';
  diagramOrientation: 'Portrait' | 'Landscape' | 'Square';
  diagramStyle: 'Simple' | 'Classroom' | 'Scientific' | 'Detailed' | 'Colorful';
  diagramIncludeLabels: boolean;
  diagramIncludeExplanations: boolean;
  diagramVisualMethod: 'Structured Diagram' | 'AI Illustration' | 'Auto';
  diagramSpecificElements: string;
  // legacy compat
  diagramLabels: 'Automatic' | 'Custom labels';
  diagramCustomLabels: string;

  // ── Mind Map ─────────────────────────────────────────────────────────────────
  mindMapCentralTopic: string;
  mindMapBranchCount: string;
  mindMapDepth: 'Basic' | 'Standard' | 'Detailed';
  mindMapLayout: 'Radial' | 'Tree' | 'Horizontal';
  mindMapStyle: 'Minimal' | 'Academic' | 'Colorful';
  mindMapIncludes: string[];

  // ── Chart ────────────────────────────────────────────────────────────────────
  chartTitle: string;
  chartPurpose: string;
  chartType: 'Bar' | 'Line' | 'Pie' | 'Area' | 'Comparison';
  chartOrientation: 'Vertical' | 'Horizontal';
  chartHasData: boolean;
  chartData: ChartDataRow[];
  chartXAxisLabel: string;
  chartYAxisLabel: string;
  chartShowValues: boolean;
  chartShowLegend: boolean;
  chartIncludes: string[];

  // ── Infographic ──────────────────────────────────────────────────────────────
  infographicGoal: string;
  infographicPurpose: 'Teach' | 'Summarize' | 'Compare' | 'Explain a process' | 'Revision' | 'Fact sheet';
  infographicOrientation: 'Portrait' | 'Landscape' | 'Square';
  infographicStyle: 'Educational' | 'Modern' | 'Minimal' | 'Colorful' | 'Editorial';
  infographicSectionCount: string;
  infographicIncludes: string[];
  infographicVisualSource: 'Stock' | 'AI' | 'Auto' | 'No visuals';
  // legacy compat
  infographicSections: string[];
}

export type WizardStep = 'details' | 'customize' | 'review' | 'generating' | 'preview';
