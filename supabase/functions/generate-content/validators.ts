// Validation and schema normalization for all 16 creation types

export interface ValidationResult {
  isValid: boolean;
  normalizedData: Record<string, any>;
  errors?: string[];
}

export function validateAndNormalize(creationType: string, raw: any, form: Record<string, any>): ValidationResult {
  if (!raw || typeof raw !== "object") {
    return {
      isValid: false,
      normalizedData: {},
      errors: ["Response is not a valid JSON object"],
    };
  }

  const subject = raw.subject || form.subject || "General Education";
  const grade = raw.grade || form.grade || "Grade 8";
  const topic = form.topic || "Topic";

  switch (creationType) {
    case "lesson": {
      const title = raw.title || `Lesson Plan: ${topic}`;
      const learningObjectives = Array.isArray(raw.learningObjectives) && raw.learningObjectives.length > 0
        ? raw.learningObjectives
        : (Array.isArray(raw.objectives) ? raw.objectives : [`Understand fundamental principles of ${topic}.`]);
      const materials = Array.isArray(raw.materials) && raw.materials.length > 0
        ? raw.materials
        : ["Whiteboard / presentation screen", "Student notebook", "Printed activity sheets"];
      const warmUp = raw.warmUp || raw.introduction || `Think-Pair-Share: What do you already know about ${topic}?`;
      const teachingSteps = Array.isArray(raw.teachingSteps) && raw.teachingSteps.length > 0
        ? raw.teachingSteps
        : [
            { step: 1, title: "Direct Instruction", duration: "15 min", content: raw.content || `Overview of ${topic}.` },
            { step: 2, title: "Guided Practice", duration: "15 min", content: "Student collaborative inquiry." },
            { step: 3, title: "Review & Check", duration: "10 min", content: "Formative evaluation." }
          ];

      const activity = raw.activity && typeof raw.activity === "object"
        ? raw.activity
        : { title: `Activity: Exploring ${topic}`, duration: "10 min", instructions: "Work in pairs to complete the prompt." };

      const assessment = raw.assessment
        ? (typeof raw.assessment === "string" ? raw.assessment : JSON.stringify(raw.assessment))
        : `Exit Ticket: Summarize the core concept of ${topic} in 2 sentences.`;

      const homework = raw.homework || `Complete practice worksheet on ${topic}.`;

      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          duration: raw.duration || form.duration || "45 min",
          difficulty: raw.difficulty || form.difficulty || "Intermediate",
          learningObjectives,
          materials,
          warmUp,
          teachingSteps,
          activity,
          assessment,
          homework,
        },
      };
    }

    case "notes": {
      const title = raw.title || `Revision Notes: ${topic}`;
      const keyConcepts = Array.isArray(raw.keyConcepts) ? raw.keyConcepts : [];
      const definitions = Array.isArray(raw.definitions) ? raw.definitions : [];
      const examples = Array.isArray(raw.examples) ? raw.examples : [];
      const commonMisconceptions = Array.isArray(raw.commonMisconceptions) ? raw.commonMisconceptions : [];
      const importantPoints = Array.isArray(raw.importantPoints) ? raw.importantPoints : [];
      const summary = raw.summary || `Summary of key learnings for ${topic}.`;

      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          overview: raw.overview || `Essential notes covering ${topic}.`,
          keyConcepts,
          definitions,
          examples,
          commonMisconceptions,
          importantPoints,
          summary,
        },
      };
    }

    case "presentation": {
      const title = String(raw.title || topic).replace(/#+\s*/g, '').replace(/\*\*/g, '').trim();
      const requestedCount = Math.max(3, Math.min(30, Number(form.slideCount) || 8));
      const speakerNotesEnabled = form.presentationSpeakerNotes !== false;

      let normalizedSlides = Array.isArray(raw.slides) && raw.slides.length > 0
        ? raw.slides.map((s: any, idx: number) => {
            const rawContent = Array.isArray(s.content)
              ? s.content
              : (typeof s.content === 'string' ? [s.content] : []);
            
            const cleanContent = rawContent
              .map((item: any) => String(item || '').replace(/#+\s*/g, '').replace(/\*\*/g, '').trim())
              .filter(Boolean);

            const slideTitle = String(s.title || `Slide ${idx + 1}`).replace(/#+\s*/g, '').replace(/\*\*/g, '').trim();
            const slideSubtitle = String(s.subtitle || '').replace(/#+\s*/g, '').replace(/\*\*/g, '').trim();
            const notes = speakerNotesEnabled ? String(s.speakerNotes || s.notes || '').trim() : '';

            const visQuery = String(s.visualQuery || s.visualSuggestion || `${subject} ${topic} ${slideTitle}`)
              .replace(/[^a-zA-Z0-9\s]/g, ' ')
              .trim();

            return {
              slideNumber: idx + 1,
              type: s.type || (idx === 0 ? 'title' : (idx === raw.slides.length - 1 ? 'summary' : 'concept')),
              title: slideTitle,
              subtitle: slideSubtitle,
              content: cleanContent.length > 0 ? cleanContent : [`Core discussion points for ${slideTitle}`],
              speakerNotes: notes,
              visualSuggestion: String(s.visualSuggestion || s.visual || `${slideTitle} diagram`).trim(),
              visualQuery: visQuery,
            };
          })
        : [];

      // Enforce exact slide count
      if (normalizedSlides.length > requestedCount) {
        normalizedSlides = normalizedSlides.slice(0, requestedCount);
      } else if (normalizedSlides.length < requestedCount) {
        const diff = requestedCount - normalizedSlides.length;
        for (let i = 0; i < diff; i++) {
          const slideNum = normalizedSlides.length + 1;
          const isFinal = slideNum === requestedCount;
          normalizedSlides.push({
            slideNumber: slideNum,
            type: isFinal ? 'summary' : 'concept',
            title: isFinal ? `Summary & Key Takeaways` : `${topic} - Focus Area ${slideNum - 1}`,
            subtitle: isFinal ? `Core lesson review for ${grade}` : `Deep dive into key concepts`,
            content: isFinal
              ? [
                  `Review key definitions and principles of ${topic}.`,
                  `Apply understanding in upcoming practice activities.`,
                  `Clarify any remaining questions with the instructor.`
                ]
              : [
                  `Detailed breakdown of ${topic} concept ${slideNum - 1}.`,
                  `Key observations and real-world relevance.`,
                  `Guided classroom discussion point.`
                ],
            speakerNotes: speakerNotesEnabled ? `Guide students through this slide section and assess understanding.` : '',
            visualSuggestion: `${topic} classroom visual ${slideNum}`,
            visualQuery: `${subject} ${topic} educational concept ${slideNum}`,
          });
        }
      }

      // Re-index slide numbers strictly from 1 to requestedCount
      normalizedSlides = normalizedSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));

      return {
        isValid: true,
        normalizedData: {
          title,
          subtitle: raw.subtitle || `${form.presentationPurpose || 'Presentation'} • ${grade} ${subject}`,
          subject,
          grade,
          topic,
          visualStyle: form.visualStyle || raw.visualStyle || 'Clean',
          slideCount: requestedCount,
          slides: normalizedSlides,
        },
      };
    }

    case "video": {
      const title = raw.title || `Educational Video Script: ${topic}`;
      const duration = raw.duration || form.videoDuration || "3 min";
      const scenes = Array.isArray(raw.scenes) && raw.scenes.length > 0
        ? raw.scenes.map((sc: any, idx: number) => ({
            sceneNumber: sc.sceneNumber || idx + 1,
            time: sc.time || `${idx * 45}s - ${(idx + 1) * 45}s`,
            visual: sc.visual || sc.visualDescription || `Visual shot for scene ${idx + 1}`,
            visualDescription: sc.visualDescription || sc.visual || topic,
            onScreenText: sc.onScreenText || `Scene ${idx + 1}`,
            narration: sc.narration || sc.script || "",
            sound: sc.sound || sc.audioDirection || "Background acoustic music",
            audioDirection: sc.audioDirection || sc.sound || "Clear narration",
          }))
        : [];

      return {
        isValid: scenes.length > 0,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          duration,
          style: raw.style || form.videoStyle || "Explainer",
          audience: raw.audience || form.videoAudience || "Middle school students",
          scenes,
        },
      };
    }

    case "assignment": {
      const title = raw.title || `Assignment: ${topic}`;
      const questions = Array.isArray(raw.questions) && raw.questions.length > 0
        ? raw.questions.map((q: any, idx: number) => ({
            id: q.id || `q${idx + 1}`,
            number: q.number || idx + 1,
            type: q.type || "Short answer",
            marks: Number(q.marks) || 5,
            text: q.text || q.question || `Question ${idx + 1}`,
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: q.correctAnswer || q.answer || "",
          }))
        : [];

      return {
        isValid: questions.length > 0,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          assignmentType: raw.assignmentType || form.assignmentType || "Homework",
          difficulty: raw.difficulty || form.difficulty || "Medium",
          totalMarks: Number(raw.totalMarks) || Number(form.totalMarks) || 25,
          instructions: Array.isArray(raw.instructions) ? raw.instructions : ["Read carefully and answer all questions."],
          questions,
          rubric: Array.isArray(raw.rubric) ? raw.rubric : [],
          answerKey: Array.isArray(raw.answerKey) ? raw.answerKey : [],
        },
      };
    }

    case "worksheet": {
      const title = raw.title || `Classroom Practice Worksheet: ${topic}`;
      const sections = Array.isArray(raw.sections) && raw.sections.length > 0
        ? raw.sections
        : [
            {
              title: "Part 1: Key Questions",
              items: [{ sentence: `Explain the fundamental concept of ${topic}.` }],
            },
          ];

      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          style: raw.style || form.worksheetStyle || "Classroom",
          difficulty: raw.difficulty || form.difficulty || "Medium",
          instructions: raw.instructions || "Complete each section neatly.",
          sections,
          hints: Array.isArray(raw.hints) ? raw.hints : [],
          answerKey: Array.isArray(raw.answerKey) ? raw.answerKey : [],
        },
      };
    }

    case "activity": {
      const title = raw.title || `Interactive Activity: ${topic}`;
      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          activityType: raw.activityType || form.activityType || "Group",
          duration: raw.duration || form.duration || "30 min",
          difficulty: raw.difficulty || form.difficulty || "Intermediate",
          objective: raw.objective || form.activityObjective || `To investigate ${topic}.`,
          materials: Array.isArray(raw.materials) ? raw.materials : ["Standard classroom supplies"],
          teacherSteps: Array.isArray(raw.teacherSteps) ? raw.teacherSteps : (Array.isArray(raw.teacherInstructions) ? raw.teacherInstructions : []),
          studentSteps: Array.isArray(raw.studentSteps) ? raw.studentSteps : (Array.isArray(raw.studentInstructions) ? raw.studentInstructions : []),
          reflectionQuestions: Array.isArray(raw.reflectionQuestions) ? raw.reflectionQuestions : [],
        },
      };
    }

    case "flashcards": {
      const title = raw.title || `Flashcard Study Deck: ${topic}`;
      const cards = Array.isArray(raw.cards) && raw.cards.length > 0
        ? raw.cards.map((c: any, idx: number) => ({
            id: c.id || idx + 1,
            front: c.front || c.term || `Term ${idx + 1}`,
            back: c.back || c.definition || `Definition for term ${idx + 1}`,
            category: c.category || "General",
            mnemonic: c.mnemonic || "",
            example: c.example || "",
          }))
        : [];

      return {
        isValid: cards.length > 0,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          cardCount: cards.length,
          cardType: raw.cardType || form.flashcardType || "Term → Definition",
          cards,
        },
      };
    }

    case "quiz": {
      const title = raw.title || `Assessment Quiz: ${topic}`;
      const questions = Array.isArray(raw.questions) && raw.questions.length > 0
        ? raw.questions.map((q: any, idx: number) => {
            const options = Array.isArray(q.options) && q.options.length > 0
              ? q.options
              : ["A) Option A", "B) Option B", "C) Option C", "D) Option D"];
            let correctIndex = typeof q.correctIndex === "number" ? q.correctIndex : 0;
            let correctAnswer = q.correctAnswer || options[correctIndex] || options[0];

            return {
              id: q.id || `qz${idx + 1}`,
              number: q.number || idx + 1,
              question: q.question || `Question ${idx + 1}`,
              type: q.type || "MCQ",
              options,
              correctIndex,
              correctAnswer,
              explanation: q.explanation || "Correct conceptual reasoning.",
              marks: Number(q.marks) || 2,
            };
          })
        : [];

      return {
        isValid: questions.length > 0,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          timeLimit: raw.timeLimit || form.quizTimeLimit || "15 min",
          difficulty: raw.difficulty || form.difficulty || "Medium",
          totalQuestions: questions.length,
          totalMarks: questions.reduce((acc: number, q: any) => acc + (q.marks || 2), 0),
          questions,
        },
      };
    }

    case "mock-test": {
      const title = raw.title || `Timed Mock Test: ${topic}`;
      const totalMarks = Number(raw.totalMarks) || Number(form.mockTotalMarks) || 50;
      const sections = Array.isArray(raw.sections) && raw.sections.length > 0
        ? raw.sections
        : [
            {
              name: "Section 1: Objective Questions",
              marks: Math.round(totalMarks * 0.4),
              questions: [{ q: `1. Define ${topic}.`, marks: 2 }],
            },
          ];

      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          duration: raw.duration || form.mockDuration || "60 min",
          totalMarks,
          distribution: raw.distribution || {
            easy: Number(form.easyPercentage) || 30,
            medium: Number(form.mediumPercentage) || 50,
            hard: Number(form.hardPercentage) || 20,
          },
          sections,
        },
      };
    }

    case "question-paper":
    case "exam": {
      const title = raw.title || raw.examName || form.examName || `${subject} Examination: ${topic}`;
      const sections = Array.isArray(raw.sections) && raw.sections.length > 0
        ? raw.sections
        : (Array.isArray(form.sections) && form.sections.length > 0 ? form.sections : [
            { id: "1", name: "Section A: Objective Questions", questionType: "MCQ", questionCount: 10, marksPerQuestion: 1, instructions: "Answer all questions." }
          ]);

      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          examName: title,
          subject,
          grade,
          duration: raw.duration || form.examDuration || "90 min",
          totalMarks: Number(raw.totalMarks) || Number(form.examTotalMarks) || 80,
          generalInstructions: Array.isArray(raw.generalInstructions) ? raw.generalInstructions : (Array.isArray(raw.instructions) ? raw.instructions : ["All questions are compulsory."]),
          sections,
          sampleQuestions: Array.isArray(raw.sampleQuestions) ? raw.sampleQuestions : [],
        },
      };
    }

    case "diagram": {
      const diagramTypeRaw = raw.diagramType || form.diagramType || "Labeled Diagram";
      const title = raw.title || `${diagramTypeRaw}: ${topic}`;

      const FLOW_TYPES = ["process diagram", "flowchart", "cycle diagram", "hierarchy", "timeline", "system diagram"];
      const isFlowType = FLOW_TYPES.includes(diagramTypeRaw.toLowerCase());

      // Normalize nodes for flow-type diagrams
      const nodes = Array.isArray(raw.nodes) && raw.nodes.length > 0
        ? raw.nodes.map((n: any, idx: number) => ({
            id: n.id || `n${idx + 1}`,
            label: n.label || n.name || `Step ${idx + 1}`,
            description: n.description || n.desc || "",
          }))
        : (isFlowType && Array.isArray(raw.elements) && raw.elements.length > 0
            ? raw.elements.map((el: any, idx: number) => ({
                id: el.id || `n${idx + 1}`,
                label: el.label || `Step ${idx + 1}`,
                description: el.description || "",
              }))
            : (isFlowType ? [
                { id: "n1", label: "Input / Start", description: "Initial stage of the process." },
                { id: "n2", label: "Processing", description: "Core processing or transformation step." },
                { id: "n3", label: "Output / End", description: "Final output or result." },
              ] : []));

      // Normalize connections for flow-type diagrams
      const connections = Array.isArray(raw.connections) && raw.connections.length > 0
        ? raw.connections
        : (Array.isArray(raw.relationships) && raw.relationships.length > 0 && isFlowType
            ? raw.relationships.map((r: any) => ({ from: r.from, to: r.to, label: r.label || "" }))
            : []);

      // Normalize labels for labeled diagrams
      const labels = Array.isArray(raw.labels) && raw.labels.length > 0
        ? raw.labels.map((l: any, idx: number) => ({
            id: l.id || `l${idx + 1}`,
            name: l.name || l.label || `Part ${idx + 1}`,
            x: Number(l.x) || 20 + (idx * 15) % 60,
            y: Number(l.y) || 25 + (idx * 12) % 50,
            desc: l.desc || l.description || "Component description.",
          }))
        : (!isFlowType ? [
            { id: "l1", name: "Outer Boundary", x: 20, y: 30, desc: "Outer cellular / structural membrane." },
            { id: "l2", name: "Core Matrix", x: 50, y: 50, desc: "Internal matrix where primary reactions occur." },
            { id: "l3", name: "Active Center", x: 75, y: 65, desc: "Site of high concentration activity." },
          ] : []);

      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          topic: form.topic || topic,
          subject,
          grade,
          diagramType: diagramTypeRaw,
          style: raw.style || form.diagramStyle || "Classroom",
          orientation: raw.orientation || form.diagramOrientation || "Landscape",
          goal: raw.goal || form.diagramGoal || `Illustrate ${topic}.`,
          // Flow-type fields
          nodes,
          connections,
          // Labeled-type fields
          labels,
          elements: Array.isArray(raw.elements) ? raw.elements : [],
          relationships: Array.isArray(raw.relationships) ? raw.relationships : [],
          legend: Array.isArray(raw.legend) ? raw.legend : [],
        },
      };
    }


    case "mind-map": {
      const title = raw.title || `Mind Map: ${topic}`;
      const rootNode = raw.rootNode && typeof raw.rootNode === "object"
        ? raw.rootNode
        : {
            id: "root",
            label: topic,
            children: [
              { id: "c1", label: "1. Core Principles", color: "#0284c7", children: [{ id: "c1-1", label: "Foundations" }] },
              { id: "c2", label: "2. Key Mechanisms", color: "#059669", children: [{ id: "c2-1", label: "Process Flow" }] },
              { id: "c3", label: "3. Real-world Examples", color: "#d97706", children: [{ id: "c3-1", label: "Applications" }] },
            ],
          };

      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          layout: raw.layout || form.mindMapLayout || "Radial",
          depth: raw.depth || form.mindMapDepth || "Standard",
          rootNode,
        },
      };
    }

    case "chart": {
      const title = raw.title || form.chartTitle || `Chart: ${topic}`;
      // Teacher-provided data is authoritative when chartHasData is true
      const data = (form.chartHasData && Array.isArray(form.chartData) && form.chartData.length > 0)
        ? form.chartData
        : (Array.isArray(raw.data) && raw.data.length > 0 ? raw.data : [
            { id: "1", label: "Category 1", value: 30 },
            { id: "2", label: "Category 2", value: 65 },
            { id: "3", label: "Category 3", value: 85 },
          ]);

      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          chartType: raw.chartType || form.chartType || "Bar",
          orientation: raw.orientation || form.chartOrientation || "Vertical",
          purpose: raw.purpose || form.chartPurpose || "Comparative metrics",
          xAxisLabel: raw.xAxisLabel || form.chartXAxisLabel || "",
          yAxisLabel: raw.yAxisLabel || form.chartYAxisLabel || "",
          showValues: raw.showValues !== undefined ? raw.showValues : (form.chartShowValues !== false),
          showLegend: raw.showLegend !== undefined ? raw.showLegend : (form.chartShowLegend !== false),
          data,
          includes: Array.isArray(raw.includes) ? raw.includes : ["Legend", "Axis labels", "Data labels"],
        },
      };
    }

    case "infographic": {
      const title = raw.title || `Visual Infographic: ${topic}`;
      const sections = Array.isArray(raw.sections) && raw.sections.length > 0
        ? raw.sections.map((sec: any, idx: number) => ({
            title: sec.title || sec.heading || `Step 0${idx + 1}`,
            heading: sec.heading || sec.title || `Step 0${idx + 1}`,
            icon: sec.icon || "Sparkles",
            color: sec.color || ["bg-emerald-50 text-emerald-800 border-emerald-200", "bg-blue-50 text-blue-800 border-blue-200", "bg-indigo-50 text-indigo-800 border-indigo-200", "bg-amber-50 text-amber-800 border-amber-200"][idx % 4],
            content: sec.content || "Key instructional insight.",
            stat: sec.stat || "",
            facts: Array.isArray(sec.facts) ? sec.facts : [],
            visualSuggestion: sec.visualSuggestion || "",
          }))
        : [];

      return {
        isValid: sections.length > 0,
        normalizedData: {
          ...raw,
          title,
          subject,
          grade,
          style: raw.style || form.infographicStyle || "Modern",
          orientation: raw.orientation || form.infographicOrientation || "Portrait",
          purpose: raw.purpose || form.infographicPurpose || "Concept summary",
          sections,
          keyTakeaways: Array.isArray(raw.keyTakeaways) ? raw.keyTakeaways : [],
        },
      };
    }

    default:
      return {
        isValid: true,
        normalizedData: {
          ...raw,
          title: raw.title || topic,
          subject,
          grade,
        },
      };
  }
}
