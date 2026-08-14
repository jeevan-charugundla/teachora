import type { CreationMeta, CreationType, CreationFormState } from '../types/creationTypes';

export const CREATION_ITEMS_CATALOG: Record<CreationType, CreationMeta> = {
  // TEACH
  lesson: {
    type: 'lesson',
    category: 'teach',
    title: 'Lesson',
    subtitle: 'Build a complete lesson plan with objectives, activities, and assessment.',
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    iconName: 'BookOpen',
  },
  notes: {
    type: 'notes',
    category: 'teach',
    title: 'Notes',
    subtitle: 'Create structured teaching notes and key explanations.',
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    iconName: 'FileText',
  },
  presentation: {
    type: 'presentation',
    category: 'teach',
    title: 'Presentation',
    subtitle: 'Create a classroom-ready slide deck.',
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    iconName: 'Presentation',
  },
  video: {
    type: 'video',
    category: 'teach',
    title: 'Educational Video',
    subtitle: 'Plan an educational video with script and storyboard.',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    iconName: 'Video',
  },

  // PRACTICE
  assignment: {
    type: 'assignment',
    category: 'practice',
    title: 'Assignment',
    subtitle: 'Create homework or classroom work with clear instructions and evaluation criteria.',
    color: 'bg-violet-50 text-violet-600 border-violet-200',
    iconName: 'ClipboardList',
  },
  worksheet: {
    type: 'worksheet',
    category: 'practice',
    title: 'Worksheet',
    subtitle: 'Build a printable practice worksheet.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    iconName: 'FileSpreadsheet',
  },
  activity: {
    type: 'activity',
    category: 'practice',
    title: 'Classroom Activity',
    subtitle: 'Design an interactive activity students can complete individually or in groups.',
    color: 'bg-sky-50 text-sky-600 border-sky-200',
    iconName: 'Puzzle',
  },
  flashcards: {
    type: 'flashcards',
    category: 'practice',
    title: 'Flashcards',
    subtitle: 'Create quick revision cards for concepts, terms, and definitions.',
    color: 'bg-lime-50 text-lime-600 border-lime-200',
    iconName: 'Layers',
  },

  // ASSESS
  quiz: {
    type: 'quiz',
    category: 'assess',
    title: 'Quiz',
    subtitle: 'Create a quick assessment with optional answer key and marking.',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    iconName: 'HelpCircle',
  },
  'mock-test': {
    type: 'mock-test',
    category: 'assess',
    title: 'Mock Test',
    subtitle: 'Build a complete timed practice test.',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    iconName: 'Timer',
  },
  'question-paper': {
    type: 'question-paper',
    category: 'assess',
    title: 'Question Paper',
    subtitle: 'Create a formal question paper with sections and marks.',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    iconName: 'FileQuestion',
  },
  exam: {
    type: 'exam',
    category: 'assess',
    title: 'Exam',
    subtitle: 'Create a complete exam paper with questions, sections, and answer key.',
    color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
    iconName: 'GraduationCap',
  },

  // VISUALIZE
  diagram: {
    type: 'diagram',
    category: 'visualize',
    title: 'Diagram',
    subtitle: 'Turn a concept into a clear visual explanation.',
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    iconName: 'Image',
  },
  'mind-map': {
    type: 'mind-map',
    category: 'visualize',
    title: 'Mind Map',
    subtitle: 'Organize a topic into connected concepts.',
    color: 'bg-green-50 text-green-600 border-green-200',
    iconName: 'GitBranch',
  },
  chart: {
    type: 'chart',
    category: 'visualize',
    title: 'Chart',
    subtitle: 'Turn your data into a clear visual chart.',
    color: 'bg-red-50 text-red-600 border-red-200',
    iconName: 'BarChart3',
  },
  infographic: {
    type: 'infographic',
    category: 'visualize',
    title: 'Infographic',
    subtitle: 'Turn a topic into a visual, easy-to-understand summary.',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    iconName: 'Network',
  },
};

export function getInitialFormState(type: CreationType, defaultSubject = 'Science', defaultGrade = 'Grade 8'): CreationFormState {
  return {
    type,
    subject: defaultSubject,
    grade: defaultGrade,
    topic: '',
    language: 'English',
    difficulty: 'Medium',
    additionalInstructions: '',

    // Lesson
    lessonType: 'Introduction',
    duration: '45 min',
    learningObjectives: '',
    teachingStyle: 'Interactive',
    lessonIncludes: ['Learning objectives', 'Key concepts', 'Teaching steps', 'Classroom activity', 'Assessment', 'Homework'],
    includeActivities: true,
    includeAssessment: true,
    includeHomework: true,

    // Notes
    notesPurpose: 'Student Notes',
    notesDepth: 'Standard',
    notesIncludes: ['Definitions', 'Key concepts', 'Examples', 'Important points', 'Summary'],

    // Presentation
    slideCount: '10',
    presentationGoal: 'Comprehensive classroom lesson with examples and summary',
    presentationPurpose: 'Teach a concept',
    visualStyle: 'Clean',
    presentationIncludes: ['Title slide', 'Learning objectives', 'Concept slides', 'Examples', 'Summary', 'Questions'],
    presentationSpeakerNotes: true,
    presentationVisualSource: 'Auto',

    // Video
    videoDuration: '3 min',
    videoAudience: 'Middle school students',
    videoStyle: 'Explainer',
    videoNarrationStyle: 'Conversational',
    videoVisualStyle: 'Diagrams',
    videoIncludes: ['Narration script', 'Scene breakdown', 'On-screen text', 'Visual suggestions'],
    videoVisualSource: 'Stock Library',

    // Assignment
    assignmentTitle: '',
    assignmentType: 'Homework',
    questionCount: '10',
    questionTypes: ['Short answer', 'MCQ', 'True/False'],
    totalMarks: '25',
    assignmentIncludeRubric: true,
    assignmentIncludeAnswerKey: true,
    assignmentIncludes: ['Instructions', 'Answer key', 'Grading rubric', 'Marks'],

    // Worksheet
    worksheetPurpose: 'Practice',
    worksheetQuestionCount: '10',
    worksheetQuestionTypes: ['Fill in blanks', 'MCQ', 'Short answer'],
    worksheetStyle: 'Classroom',
    worksheetIncludeAnswerKey: true,
    worksheetIncludes: ['Answer key', 'Hints', 'Learning objective'],

    // Activity
    activityType: 'Group',
    activityKind: 'Hands-on',
    activityDuration: '20 min',
    activityObjective: '',
    activityIncludes: ['Materials required', 'Instructions', 'Teacher steps', 'Student steps', 'Expected outcome', 'Reflection questions'],

    // Flashcards
    flashcardCount: '20',
    flashcardType: 'Term → Definition',
    flashcardDifficulty: 'Mixed',
    flashcardIncludes: ['Examples', 'Important note', 'Mnemonic'],

    // Quiz
    quizQuestionCount: '10',
    quizQuestionTypes: ['MCQ', 'True/False', 'Short answer'],
    quizTimeLimit: '15 min',
    quizIncludeExplanations: true,
    quizRandomize: false,
    quizIncludes: ['Answer key', 'Explanations', 'Marks'],

    // Mock Test
    mockDuration: '60 min',
    mockTotalMarks: '50',
    easyPercentage: 30,
    mediumPercentage: 50,
    hardPercentage: 20,
    mockQuestionTypes: ['MCQ', 'Short answer', 'Long answer'],
    mockIncludes: ['Answer key', 'Solutions', 'Marking scheme'],

    // Question Paper & Exam
    examName: 'Term Mid-Semester Examination',
    examDuration: '90 min',
    examTotalMarks: '80',
    syllabusTopics: '',
    sections: [
      { id: '1', name: 'Section A: Objective Questions', questionType: 'MCQ & Fill in blanks', questionCount: 10, marksPerQuestion: 1, instructions: 'Answer all questions. Each carries 1 mark.' },
      { id: '2', name: 'Section B: Short Conceptual Questions', questionType: 'Short answer', questionCount: 5, marksPerQuestion: 3, instructions: 'Answer in 2-3 sentences. Each carries 3 marks.' },
      { id: '3', name: 'Section C: In-depth Explanations', questionType: 'Long answer', questionCount: 3, marksPerQuestion: 5, instructions: 'Explain with diagrams where appropriate. Each carries 5 marks.' },
    ],
    examIncludes: ['Answer key', 'Detailed solutions', 'Marking scheme', 'Exam instructions'],

    // Diagram
    diagramGoal: '',
    diagramType: 'Process Diagram',
    diagramOrientation: 'Landscape',
    diagramStyle: 'Classroom',
    diagramIncludeLabels: true,
    diagramIncludeExplanations: true,
    diagramVisualMethod: 'Auto',
    diagramSpecificElements: '',
    diagramLabels: 'Automatic',
    diagramCustomLabels: '',

    // Mind Map
    mindMapCentralTopic: '',
    mindMapBranchCount: '5',
    mindMapDepth: 'Standard',
    mindMapLayout: 'Radial',
    mindMapStyle: 'Academic',
    mindMapIncludes: ['Definitions', 'Examples', 'Key facts'],

    // Chart
    chartTitle: '',
    chartPurpose: '',
    chartType: 'Bar',
    chartOrientation: 'Vertical',
    chartHasData: false,
    chartData: [
      { id: '1', label: 'Category 1', value: 30 },
      { id: '2', label: 'Category 2', value: 65 },
      { id: '3', label: 'Category 3', value: 82 },
    ],
    chartXAxisLabel: '',
    chartYAxisLabel: '',
    chartShowValues: true,
    chartShowLegend: true,
    chartIncludes: ['Legend', 'Axis labels', 'Data labels'],

    // Infographic
    infographicGoal: '',
    infographicPurpose: 'Teach',
    infographicOrientation: 'Portrait',
    infographicStyle: 'Educational',
    infographicSectionCount: '4',
    infographicIncludes: ['Key facts', 'Definitions', 'Examples', 'Steps'],
    infographicVisualSource: 'Auto',
    infographicSections: ['Definition', 'Key Facts', 'Step-by-Step Process', 'Summary'],
  };
}
