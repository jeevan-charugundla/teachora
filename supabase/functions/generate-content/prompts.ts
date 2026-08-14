// Prompt definitions for all 16 Teachora Creation Studio types
// Returns system prompt and user prompt designed for Groq (llama-3.3-70b-versatile)

export interface CreationPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export function buildCreationPrompt(creationType: string, form: Record<string, any>): CreationPrompt {
  const subject = form.subject || "General Education";
  const grade = form.grade || "Grade 8";
  const topic = form.topic || "Untitled Topic";
  const language = form.language || "English";
  const difficulty = form.difficulty || "Intermediate";
  const instructions = form.additionalInstructions ? `Additional Teacher Requirements: ${form.additionalInstructions}` : "";

  const systemPrompt = `You are Teachora AI, an elite educational curriculum designer and master teacher.
You produce rigorous, pedagogically sound, classroom-ready educational materials tailored specifically for teachers.
You must respond with ONLY a valid, parseable JSON object matching the requested schema.
Do NOT include markdown formatting, markdown backticks (\`\`\`json), or conversational text outside the JSON object.
Respect the requested language: All instructional text, questions, and explanations must be written in ${language}.
Grade Appropriateness: Tone, vocabulary, and conceptual depth must precisely match ${grade} students at a ${difficulty} difficulty level.`;

  let userPrompt = "";

  switch (creationType) {
    case "lesson": {
      const duration = form.duration || "45 min";
      const lessonStyle = form.lessonStyle || "Direct Instruction";
      userPrompt = `Generate a complete, structured Lesson Plan for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Difficulty: ${difficulty}
Duration: ${duration}
Lesson Style: ${lessonStyle}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Lesson Plan: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "duration": "${duration}",
  "difficulty": "${difficulty}",
  "learningObjectives": [
    "Identify ...",
    "Explain ...",
    "Analyze ..."
  ],
  "materials": [
    "Material 1",
    "Material 2",
    "Material 3"
  ],
  "warmUp": "Engaging 5-minute hook and prior knowledge activation question/prompt.",
  "teachingSteps": [
    {
      "step": 1,
      "title": "Direct Instruction & Core Concepts",
      "duration": "12 min",
      "content": "Comprehensive step-by-step instructional explanation."
    },
    {
      "step": 2,
      "title": "Guided Exploration & Diagram Analysis",
      "duration": "15 min",
      "content": "Structured student exploration activity."
    },
    {
      "step": 3,
      "title": "Interactive Check for Understanding",
      "duration": "8 min",
      "content": "Formative check questions and exit questions."
    }
  ],
  "activity": {
    "title": "Classroom Activity: Collaborative Exploration",
    "duration": "10 min",
    "instructions": "Clear step-by-step student activity instructions."
  },
  "assessment": "Formative evaluation criteria and exit ticket check.",
  "homework": "Meaningful practice assignment to reinforce learning.",
  "teacherNotes": [
    "Pedagogical note on common student misconceptions."
  ]
}`;
      break;
    }

    case "notes": {
      const audience = form.notesAudience || "Students";
      const depth = form.notesDepth || "Comprehensive";
      userPrompt = `Generate structured, classroom-ready Revision & Teaching Notes for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Audience: ${audience}
Depth: ${depth}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Revision Notes: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "overview": "Clear 2-3 sentence conceptual overview.",
  "keyConcepts": [
    {
      "title": "Core Concept 1",
      "description": "Thorough pedagogical explanation.",
      "points": [
        "Key takeaway point 1",
        "Key takeaway point 2"
      ]
    },
    {
      "title": "Core Concept 2",
      "description": "Thorough pedagogical explanation.",
      "points": [
        "Key takeaway point 1",
        "Key takeaway point 2"
      ]
    }
  ],
  "definitions": [
    {
      "term": "Key Term 1",
      "definition": "Clear, precise academic definition."
    },
    {
      "term": "Key Term 2",
      "definition": "Clear, precise academic definition."
    }
  ],
  "examples": [
    {
      "title": "Classroom Example 1",
      "explanation": "Real-world relatable analogy or calculation."
    }
  ],
  "commonMisconceptions": [
    {
      "misconception": "Common student misunderstanding",
      "correction": "Scientifically accurate explanation"
    }
  ],
  "importantPoints": [
    "Exam-critical tip 1",
    "Exam-critical tip 2"
  ],
  "summary": "Concise bullet or paragraph summarizing understanding."
}`;
      break;
    }

    case "presentation": {
      const slideCount = Number(form.slideCount) || 6;
      const visualStyle = form.presentationStyle || "Modern Minimalist";
      userPrompt = `Generate a slide deck structure with speaker notes for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Slide Count: Exactly ${slideCount} slides
Visual Style: ${visualStyle}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "slides": [
    {
      "slideNumber": 1,
      "type": "title",
      "title": "${topic}",
      "subtitle": "Comprehensive Guide for ${grade}",
      "content": [
        "Welcome & Objectives",
        "Key Questions We Will Explore"
      ],
      "speakerNotes": "Teacher opening remarks to engage the classroom.",
      "visualSuggestion": "${topic} banner illustration"
    }
  ]
}
Ensure there are EXACTLY ${slideCount} slides in the slides array, covering Intro, Core Mechanisms, Detailed Analysis, Activity, and Conclusion.`;
      break;
    }

    case "video": {
      const duration = form.videoDuration || "3 min";
      const style = form.videoStyle || "Explainer";
      const audience = form.videoAudience || "Middle school students";
      userPrompt = `Generate an educational video script and scene-by-scene storyboard for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Target Duration: ${duration}
Style: ${style}
Audience: ${audience}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Educational Video Script: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "duration": "${duration}",
  "style": "${style}",
  "audience": "${audience}",
  "learningObjective": "Core takeaway for viewers.",
  "scenes": [
    {
      "sceneNumber": 1,
      "time": "0:00 - 0:30",
      "visual": "Visual camera shot description.",
      "visualDescription": "Search query keyword for stock footage (e.g. green leaf close up)",
      "onScreenText": "On-screen title or key text",
      "narration": "Word-for-word teacher/voiceover narration.",
      "sound": "Background audio / musical direction.",
      "audioDirection": "Upbeat gentle acoustic intro"
    },
    {
      "sceneNumber": 2,
      "time": "0:30 - 1:15",
      "visual": "Detailed animation or diagram shot description.",
      "visualDescription": "chloroplast plant cell animation",
      "onScreenText": "Core Concept Headline",
      "narration": "Word-for-word teacher narration.",
      "sound": "Sound effect transitions.",
      "audioDirection": "Clear explanatory tone"
    },
    {
      "sceneNumber": 3,
      "time": "1:15 - 2:15",
      "visual": "Process breakdown shot.",
      "visualDescription": "chemical reaction sunlight",
      "onScreenText": "Chemical Reaction / Mechanism",
      "narration": "Word-for-word teacher narration.",
      "sound": "Subtle chimes.",
      "audioDirection": "Focused didactic cadence"
    },
    {
      "sceneNumber": 4,
      "time": "2:15 - 3:00",
      "visual": "Cinematic summary shot.",
      "visualDescription": "nature forest sunlight",
      "onScreenText": "Summary & Key Takeaway",
      "narration": "Closing inspiring narration.",
      "sound": "Triumphant outro swell.",
      "audioDirection": "Inspiring closing"
    }
  ]
}`;
      break;
    }

    case "assignment": {
      const assignmentType = form.assignmentType || "Homework";
      const totalMarks = Number(form.totalMarks) || 25;
      const questionCount = Number(form.questionCount) || 5;
      userPrompt = `Generate a rigorous student Assignment with questions, rubric, and answer key for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Assignment Type: ${assignmentType}
Difficulty: ${difficulty}
Total Marks: ${totalMarks}
Question Count: Exactly ${questionCount} questions
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Assignment: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "assignmentType": "${assignmentType}",
  "difficulty": "${difficulty}",
  "totalMarks": ${totalMarks},
  "objective": "Clear assignment goal.",
  "instructions": [
    "Read each question carefully before answering.",
    "Show all work and diagrams where requested.",
    "Submit your completed work by the designated due date."
  ],
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "type": "Short answer",
      "marks": 3,
      "text": "Question 1 prompt text ...",
      "options": [],
      "correctAnswer": "Complete model answer for grading."
    },
    {
      "id": "q2",
      "number": 2,
      "type": "Multiple Choice",
      "marks": 2,
      "text": "Question 2 prompt text ...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "B) ..."
    }
  ],
  "rubric": [
    {
      "criteria": "Scientific Accuracy",
      "excellent": "Full accuracy with correct terminology (4-5 pts)",
      "satisfactory": "Mostly accurate with minor errors (2-3 pts)",
      "needsImprovement": "Significant inaccuracies (0-1 pt)"
    },
    {
      "criteria": "Clarity & Depth of Reasoning",
      "excellent": "Explanations are thorough and logical (4-5 pts)",
      "satisfactory": "Basic explanation provided (2-3 pts)",
      "needsImprovement": "Incomplete answers (0-1 pt)"
    }
  ],
  "answerKey": [
    {
      "q": 1,
      "answer": "Complete expected solution."
    },
    {
      "q": 2,
      "answer": "B) ... (Detailed explanation)"
    }
  ],
  "submissionInstructions": "Write neatly in blue or black ink or submit via digital portal."
}
Ensure the questions sum up exactly to ${totalMarks} total marks and contains ${questionCount} questions.`;
      break;
    }

    case "worksheet": {
      const style = form.worksheetStyle || "Classroom";
      userPrompt = `Generate a printable classroom Practice Worksheet for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Style: ${style}
Difficulty: ${difficulty}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Classroom Practice Worksheet: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "style": "${style}",
  "difficulty": "${difficulty}",
  "instructions": "Complete each section neatly in the spaces provided.",
  "sections": [
    {
      "title": "Part 1: Key Vocabulary Match",
      "items": [
        { "prompt": "1. Term A", "match": "A. Definition description" },
        { "prompt": "2. Term B", "match": "B. Definition description" },
        { "prompt": "3. Term C", "match": "C. Definition description" }
      ]
    },
    {
      "title": "Part 2: Fill in the Blanks",
      "items": [
        { "sentence": "During the process, ________ occurs inside the cell." },
        { "sentence": "The primary reactant needed is ________." },
        { "sentence": "The resulting molecule produced is ________." }
      ]
    },
    {
      "title": "Part 3: Short Analysis Questions",
      "items": [
        { "sentence": "Explain why this process is essential for living systems." },
        { "sentence": "Describe what happens if one of the key conditions is absent." }
      ]
    }
  ],
  "hints": [
    "Key memory hint 1",
    "Key memory hint 2"
  ],
  "answerKey": [
    {
      "section": "Part 1: Key Vocabulary Match",
      "answers": ["1-C", "2-A", "3-B"]
    },
    {
      "section": "Part 2: Fill in the Blanks",
      "answers": ["Term 1", "Term 2", "Term 3"]
    }
  ]
}`;
      break;
    }

    case "activity": {
      const activityType = form.activityType || "Group";
      const duration = form.duration || "30 min";
      userPrompt = `Generate an interactive classroom activity/experiment for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Activity Type: ${activityType}
Duration: ${duration}
Difficulty: ${difficulty}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Interactive Activity: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "activityType": "${activityType}",
  "duration": "${duration}",
  "difficulty": "${difficulty}",
  "objective": "Hands-on learning outcome for students.",
  "groupSize": "Small groups (3-4 students)",
  "materials": [
    "Material 1",
    "Material 2",
    "Material 3"
  ],
  "teacherInstructions": [
    "Pre-lab setup and station arrangement.",
    "Safety instructions and key checkpoints.",
    "Debrief facilitation."
  ],
  "studentInstructions": [
    "Step 1: Set up materials.",
    "Step 2: Execute procedure.",
    "Step 3: Record observations."
  ],
  "teacherSteps": [
    "Preparation and initial prompt.",
    "Facilitating small group inquiry.",
    "Leading whole-class synthesis."
  ],
  "studentSteps": [
    "Step 1: Organize roles.",
    "Step 2: Collect data.",
    "Step 3: Analyze results."
  ],
  "expectedOutcome": "What students should discover or synthesize.",
  "reflectionQuestions": [
    "What pattern did you notice in your data?",
    "How does this concept connect to everyday life?",
    "What might have caused discrepancies in your results?"
  ]
}`;
      break;
    }

    case "flashcards": {
      const cardCount = Number(form.flashcardCount) || 10;
      const cardType = form.flashcardType || "Term → Definition";
      userPrompt = `Generate a set of exactly ${cardCount} revision Flashcards for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Card Count: Exactly ${cardCount} cards
Card Type: ${cardType}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Flashcard Study Deck: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "cardCount": ${cardCount},
  "cardType": "${cardType}",
  "cards": [
    {
      "id": 1,
      "front": "Term / Question Front",
      "back": "Clear, concise definition / explanation.",
      "category": "Category tag",
      "mnemonic": "Memory tip or root word breakdown"
    }
  ]
}
Make sure the cards array contains EXACTLY ${cardCount} distinct cards.`;
      break;
    }

    case "quiz": {
      const timeLimit = form.quizTimeLimit || "15 min";
      const totalQuestions = Number(form.questionCount) || 5;
      userPrompt = `Generate an interactive assessment Quiz with multiple choice questions for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Time Limit: ${timeLimit}
Difficulty: ${difficulty}
Total Questions: Exactly ${totalQuestions} questions
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Assessment Quiz: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "timeLimit": "${timeLimit}",
  "difficulty": "${difficulty}",
  "totalQuestions": ${totalQuestions},
  "totalMarks": ${totalQuestions * 2},
  "instructions": [
    "Choose the best answer for each question.",
    "Review your answers before submitting."
  ],
  "questions": [
    {
      "id": "qz1",
      "number": 1,
      "question": "Clear conceptual question testing understanding?",
      "type": "MCQ",
      "options": [
        "A) Plausible distractor",
        "B) Correct scientific answer",
        "C) Plausible distractor",
        "D) Common misconception distractor"
      ],
      "correctIndex": 1,
      "correctAnswer": "B) Correct scientific answer",
      "explanation": "Pedagogical explanation of why this answer is correct and why other options are incorrect.",
      "marks": 2
    }
  ]
}
Ensure the questions array contains EXACTLY ${totalQuestions} questions.`;
      break;
    }

    case "mock-test": {
      const duration = form.mockDuration || "60 min";
      const totalMarks = Number(form.mockTotalMarks) || 50;
      const easy = Number(form.easyPercentage) || 30;
      const medium = Number(form.mediumPercentage) || 50;
      const hard = Number(form.hardPercentage) || 20;
      userPrompt = `Generate a full-length timed Mock Test for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Duration: ${duration}
Total Marks: ${totalMarks}
Difficulty Distribution: Easy ${easy}%, Medium ${medium}%, Hard ${hard}%
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Timed Mock Test: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "duration": "${duration}",
  "totalMarks": ${totalMarks},
  "distribution": {
    "easy": ${easy},
    "medium": ${medium},
    "hard": ${hard}
  },
  "instructions": [
    "Write your candidate details on the top margin.",
    "Section 1 contains direct conceptual questions (Easy).",
    "Section 2 contains analytical problems (Medium).",
    "Section 3 contains evaluation and case study scenarios (Hard)."
  ],
  "sections": [
    {
      "name": "Section 1: Objective & Conceptual Foundations (Easy ${easy}%)",
      "marks": ${Math.round(totalMarks * (easy / 100))},
      "questionCount": 5,
      "questions": [
        { "q": "1. Direct conceptual question...", "marks": 1, "type": "Short answer" }
      ]
    },
    {
      "name": "Section 2: Analytical & Chemical Mechanisms (Medium ${medium}%)",
      "marks": ${Math.round(totalMarks * (medium / 100))},
      "questionCount": 4,
      "questions": [
        { "q": "2. Multi-step analytical problem...", "marks": 5, "type": "Long answer" }
      ]
    },
    {
      "name": "Section 3: Experimental Analysis & Case Studies (Hard ${hard}%)",
      "marks": ${Math.round(totalMarks * (hard / 100))},
      "questionCount": 2,
      "questions": [
        { "q": "3. Critical evaluation or experimental setup...", "marks": 5, "type": "Case Study" }
      ]
    }
  ],
  "markingScheme": [
    { "section": "Section 1", "key": "Model answers for section 1" },
    { "section": "Section 2", "key": "Step-by-step scoring criteria" },
    { "section": "Section 3", "key": "Rubric for case study" }
  ]
}`;
      break;
    }

    case "question-paper":
    case "exam": {
      const examName = form.examName || `${subject} Term Examination: ${topic}`;
      const duration = form.examDuration || "90 min";
      const totalMarks = Number(form.examTotalMarks) || 80;
      userPrompt = `Generate a formal institutional Examination Question Paper for:
Exam Title: ${examName}
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Duration: ${duration}
Total Marks: ${totalMarks}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "${examName}",
  "examName": "${examName}",
  "subject": "${subject}",
  "grade": "${grade}",
  "duration": "${duration}",
  "totalMarks": ${totalMarks},
  "generalInstructions": [
    "All questions are compulsory unless internal choice is provided.",
    "Section A consists of multiple choice questions carrying 1 mark each.",
    "Section B consists of short answer questions carrying 3 marks each.",
    "Section C consists of long answer and diagrammatic questions carrying 5 marks each.",
    "Draw neat, labeled diagrams wherever required."
  ],
  "sections": [
    {
      "id": "1",
      "name": "Section A: Objective Questions",
      "questionType": "MCQ",
      "questionCount": 10,
      "marksPerQuestion": 1,
      "instructions": "Choose the single correct option."
    },
    {
      "id": "2",
      "name": "Section B: Short Answer Questions",
      "questionType": "Short answer",
      "questionCount": 6,
      "marksPerQuestion": 3,
      "instructions": "Answer in 30-50 words each."
    },
    {
      "id": "3",
      "name": "Section C: Long Answer & Diagrammatic Questions",
      "questionType": "Long answer",
      "questionCount": 4,
      "marksPerQuestion": 5,
      "instructions": "Answer in 80-120 words with labeled illustrations."
    }
  ],
  "sampleQuestions": [
    { "sec": "Section A", "q": "Q1. Objective prompt testing core definition... [1 Mark]" },
    { "sec": "Section A", "q": "Q2. Objective prompt testing identification... [1 Mark]" },
    { "sec": "Section B", "q": "Q11. Short answer prompt requiring conceptual distinction... [3 Marks]" },
    { "sec": "Section B", "q": "Q12. Short answer prompt on experimental cause and effect... [3 Marks]" },
    { "sec": "Section C", "q": "Q17. Draw and label the complete structure of ... Explain the mechanism. [5 Marks]" }
  ],
  "answerKey": [
    { "question": "Q1", "answer": "Option B" },
    { "question": "Q11", "answer": "Model solution points" }
  ],
  "markingScheme": [
    { "section": "Section A", "rule": "1 mark per correct answer" },
    { "section": "Section B", "rule": "1 mark for definition, 2 marks for explanation" },
    { "section": "Section C", "rule": "2 marks for labeled diagram, 3 marks for process" }
  ]
}`;
      break;
    }

    case "diagram": {
      const diagramType = form.diagramType || "Labeled Diagram";
      const style = form.diagramStyle || "Classroom";
      const orientation = form.diagramOrientation || "Landscape";
      const goal = form.diagramGoal || `Illustrate the structure and core components of ${topic}.`;
      const specificElements = form.diagramSpecificElements ? `Elements to include: ${form.diagramSpecificElements}` : "";
      const includeLabels = form.diagramIncludeLabels !== false;
      const includeExplanations = form.diagramIncludeExplanations !== false;

      const FLOW_TYPES = ["process diagram", "flowchart", "cycle diagram", "hierarchy", "timeline", "system diagram"];
      const isFlowType = FLOW_TYPES.includes(diagramType.toLowerCase());

      if (isFlowType) {
        userPrompt = `Generate a structured node-connection diagram for a "${diagramType}" visual:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Diagram Type: ${diagramType}
Style: ${style}
Orientation: ${orientation}
Educational Goal: ${goal}
${specificElements}
${instructions}

Return a JSON object with this EXACT structure (no other fields):
{
  "title": "${diagramType}: ${topic}",
  "topic": "${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "diagramType": "${diagramType}",
  "style": "${style}",
  "orientation": "${orientation}",
  "goal": "${goal}",
  "description": "A clear explanation of what this diagram shows and why it matters for ${grade} students.",
  "nodes": [
    { "id": "n1", "label": "Step / Stage 1 Name", "description": "${includeExplanations ? "Concise educational explanation of this step." : ""}" },
    { "id": "n2", "label": "Step / Stage 2 Name", "description": "${includeExplanations ? "Concise educational explanation of this step." : ""}" },
    { "id": "n3", "label": "Step / Stage 3 Name", "description": "${includeExplanations ? "Concise educational explanation of this step." : ""}" },
    { "id": "n4", "label": "Step / Stage 4 Name", "description": "${includeExplanations ? "Concise educational explanation of this step." : ""}" },
    { "id": "n5", "label": "Step / Stage 5 Name", "description": "${includeExplanations ? "Concise educational explanation of this step." : ""}" }
  ],
  "connections": [
    { "from": "n1", "to": "n2", "label": "leads to" },
    { "from": "n2", "to": "n3", "label": "produces" },
    { "from": "n3", "to": "n4", "label": "triggers" },
    { "from": "n4", "to": "n5", "label": "results in" }
  ],
  "legend": [
    { "color": "#0d9488", "label": "Primary Stage" },
    { "color": "#0284c7", "label": "Secondary Stage" }
  ]
}
CRITICAL: Generate ACCURATE, EDUCATIONALLY CORRECT content for ${topic} (${subject}, ${grade}).
- nodes: 4-7 meaningful stages/steps/levels (accurate for ${diagramType})
- connections: logical relationships showing the flow/hierarchy between nodes
- Use node "id" values (n1, n2, etc.) in connections, not label text
- For "cycle diagram": last connection must loop back to first node
- For "hierarchy": first node is the top-level parent, rest are children
- For "timeline": nodes must be in correct chronological order`;
      } else {
        // Labeled diagram / Scientific / Comparison — position-based
        userPrompt = `Generate a structured labeled diagram specification for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Diagram Type: ${diagramType}
Style: ${style}
Orientation: ${orientation}
Educational Goal: ${goal}
${specificElements}
${instructions}

Return a JSON object with this EXACT structure:
{
  "title": "${diagramType}: ${topic}",
  "topic": "${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "diagramType": "${diagramType}",
  "style": "${style}",
  "orientation": "${orientation}",
  "goal": "${goal}",
  "description": "Comprehensive overview of what this diagram illustrates.",
  "labels": [
    { "id": "l1", "name": "Component 1", "x": 20, "y": 25, "desc": "${includeExplanations ? "Detailed function and role of this component." : ""}" },
    { "id": "l2", "name": "Component 2", "x": 45, "y": 40, "desc": "${includeExplanations ? "Detailed function and role of this component." : ""}" },
    { "id": "l3", "name": "Component 3", "x": 60, "y": 60, "desc": "${includeExplanations ? "Detailed function and role of this component." : ""}" },
    { "id": "l4", "name": "Component 4", "x": 75, "y": 35, "desc": "${includeExplanations ? "Detailed function and role of this component." : ""}" },
    { "id": "l5", "name": "Component 5", "x": 30, "y": 70, "desc": "${includeExplanations ? "Detailed function and role of this component." : ""}" }
  ],
  "elements": [
    { "id": "e1", "label": "Component 1", "description": "Structural and functional role.", "position": { "x": 20, "y": 25 } }
  ],
  "relationships": [
    { "from": "Component 1", "to": "Component 2", "label": "connects to" }
  ],
  "legend": [
    { "color": "#0d9488", "label": "Primary Structures" },
    { "color": "#0284c7", "label": "Secondary Structures" }
  ]
}
CRITICAL: Generate ACCURATE content for ${topic} (${subject}, ${grade}).
- labels: 5-7 accurate component names with x/y coordinates (x: 10-85, y: 15-80)${includeLabels ? "" : "\n- Set includeLabels to false, omit labels array"}
- elements: same components with positional data
- relationships: scientifically accurate connections between components`;
      }
      break;
    }

    case "mind-map": {
      const layout = form.mindMapLayout || "Radial";
      const depth = form.mindMapDepth || "Standard";
      userPrompt = `Generate a structured hierarchical Mind Map tree for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Layout: ${layout}
Depth: ${depth}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Mind Map: ${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "layout": "${layout}",
  "depth": "${depth}",
  "centralTopic": "${topic}",
  "rootNode": {
    "id": "root",
    "label": "${topic}",
    "children": [
      {
        "id": "c1",
        "label": "1. Main Subtopic A",
        "color": "#0284c7",
        "children": [
          { "id": "c1-1", "label": "Sub-point A1" },
          { "id": "c1-2", "label": "Sub-point A2" },
          { "id": "c1-3", "label": "Sub-point A3" }
        ]
      },
      {
        "id": "c2",
        "label": "2. Main Subtopic B",
        "color": "#059669",
        "children": [
          { "id": "c2-1", "label": "Sub-point B1" },
          { "id": "c2-2", "label": "Sub-point B2" }
        ]
      },
      {
        "id": "c3",
        "label": "3. Main Subtopic C",
        "color": "#d97706",
        "children": [
          { "id": "c3-1", "label": "Sub-point C1" },
          { "id": "c3-2", "label": "Sub-point C2" }
        ]
      },
      {
        "id": "c4",
        "label": "4. Main Subtopic D",
        "color": "#7c3aed",
        "children": [
          { "id": "c4-1", "label": "Sub-point D1" },
          { "id": "c4-2", "label": "Sub-point D2" }
        ]
      }
    ]
  },
  "nodes": [
    { "id": "root", "label": "${topic}", "description": "Core concept", "parentId": null }
  ]
}`;
      break;
    }

    case "chart": {
      const chartType = form.chartType || "Bar";
      const orientation = form.chartOrientation || "Vertical";
      const purpose = form.chartPurpose || "Demonstrate comparative metrics";
      const chartTitle = form.chartTitle || `Chart: ${topic}`;
      const xAxisLabel = form.chartXAxisLabel || "";
      const yAxisLabel = form.chartYAxisLabel || "";
      const showValues = form.chartShowValues !== false;
      const showLegend = form.chartShowLegend !== false;
      // Teacher-provided data is authoritative if chartHasData flag is set
      const providedData = form.chartHasData && Array.isArray(form.chartData) && form.chartData.length > 0
        ? JSON.stringify(form.chartData)
        : null;

      userPrompt = `Generate pedagogical analysis, title, and insights for a chart visualization:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Chart Type: ${chartType}
Orientation: ${orientation}
Purpose: ${purpose}
${providedData ? `Authoritative Teacher-Provided Data: ${providedData}` : `Generate an accurate, illustrative 4-6 row dataset that teaches ${topic} to ${grade} students.`}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "${chartTitle}",
  "subject": "${subject}",
  "grade": "${grade}",
  "chartType": "${chartType}",
  "orientation": "${orientation}",
  "purpose": "${purpose}",
  "xAxisLabel": "${xAxisLabel || "Category"}",
  "yAxisLabel": "${yAxisLabel || "Value"}",
  "showValues": ${showValues},
  "showLegend": ${showLegend},
  "data": ${providedData || `[
    { "id": "1", "label": "Category 1", "value": 30 },
    { "id": "2", "label": "Category 2", "value": 65 },
    { "id": "3", "label": "Category 3", "value": 85 },
    { "id": "4", "label": "Category 4", "value": 95 }
  ]`},
  "includes": ["Legend", "Axis labels", "Data labels"],
  "insights": "Detailed pedagogical interpretation of the data trends for ${grade} students."
}
IMPORTANT: If teacher-provided data was supplied, you MUST keep the exact labels and numeric values. Do not invent different numbers.
If generating data, create educationally relevant values that illustrate ${topic} accurately.`;
      break;
    }


    case "infographic": {
      const style = form.infographicStyle || "Modern";
      const orientation = form.infographicOrientation || "Portrait";
      const purpose = form.infographicPurpose || "Visual Concept Summary";
      userPrompt = `Generate structured visual infographic content cards for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
Style: ${style}
Orientation: ${orientation}
Purpose: ${purpose}
${instructions}

Return a JSON object with this exact structure:
{
  "title": "Visual Infographic: ${topic}",
  "subtitle": "Essential Visual Guide for ${grade}",
  "subject": "${subject}",
  "grade": "${grade}",
  "style": "${style}",
  "orientation": "${orientation}",
  "purpose": "${purpose}",
  "sections": [
    {
      "title": "1. What is ${topic}?",
      "heading": "1. What is ${topic}?",
      "icon": "Sparkles",
      "color": "bg-emerald-50 text-emerald-800 border-emerald-200",
      "content": "Clear, concise foundational definition.",
      "stat": "Key impressive metric or fact",
      "facts": [
        "Essential takeaway fact 1",
        "Essential takeaway fact 2"
      ],
      "visualSuggestion": "diagram illustration of ${topic}"
    },
    {
      "title": "2. Core Mechanisms & Equations",
      "heading": "2. Core Mechanisms & Equations",
      "icon": "Flame",
      "color": "bg-blue-50 text-blue-800 border-blue-200",
      "content": "Core formula and scientific mechanism.",
      "stat": "Rate or efficiency statistic",
      "facts": [
        "Step 1 details",
        "Step 2 details"
      ],
      "visualSuggestion": "chemical reaction ${topic}"
    },
    {
      "title": "3. The Critical Stages",
      "heading": "3. The Critical Stages",
      "icon": "Layers",
      "color": "bg-indigo-50 text-indigo-800 border-indigo-200",
      "content": "Phase breakdown explaining how inputs transform to outputs.",
      "stat": "Process duration or count",
      "facts": [
        "Key checkpoint 1",
        "Key checkpoint 2"
      ],
      "visualSuggestion": "process flow chart"
    },
    {
      "title": "4. Real-World Significance",
      "heading": "4. Real-World Significance",
      "icon": "Globe",
      "color": "bg-amber-50 text-amber-800 border-amber-200",
      "content": "How this concept sustains natural ecosystems or technology.",
      "stat": "Global impact fact",
      "facts": [
        "Ecological impact",
        "Human application"
      ],
      "visualSuggestion": "nature ecosystem landscape"
    }
  ],
  "keyTakeaways": [
    "Primary summary rule 1",
    "Primary summary rule 2"
  ]
}`;
      break;
    }

    default: {
      userPrompt = `Generate comprehensive, structured educational material for:
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Language: ${language}
${instructions}

Return a JSON object with:
{
  "title": "${topic}",
  "subject": "${subject}",
  "grade": "${grade}",
  "content": "Structured educational content with headings and bullet points."
}`;
      break;
    }
  }

  return { systemPrompt, userPrompt };
}
