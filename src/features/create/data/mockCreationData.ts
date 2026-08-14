import type { CreationFormState } from '../types/creationTypes';

export function getMockPreviewData(form: CreationFormState) {
  const topic = form.topic || 'Photosynthesis and Plant Respiration';
  const subject = form.subject || 'Science';
  const grade = form.grade || 'Grade 8';

  switch (form.type) {
    case 'lesson':
      return {
        title: `Lesson Plan: ${topic}`,
        subject,
        grade,
        duration: form.duration || '45 min',
        difficulty: form.difficulty || 'Medium',
        objectives: [
          `Identify the essential inputs and outputs of ${topic}.`,
          `Explain the role of specialized cellular structures in the process.`,
          `Analyze real-world environmental factors affecting efficiency.`,
        ],
        materials: [
          'Interactive whiteboard or projector',
          'Student science journals',
          'Leaf cross-section diagrams & microscope slides',
          'Concept review worksheet',
        ],
        warmup: {
          duration: '5 min',
          prompt: `Think-Pair-Share: Where do plants get their food from? How does sunlight turn into energy?`,
        },
        teachingSteps: [
          {
            step: 1,
            time: '12 min',
            heading: 'Direct Instruction & Core Concepts',
            content: `Introduce the core biological definition of ${topic}. Outline the general chemical reaction equation, highlighting chlorophyll pigments within chloroplasts.`,
          },
          {
            step: 2,
            time: '15 min',
            heading: 'Guided Exploration & Diagram Analysis',
            content: `Walk students through microscopic leaf structures (stomata, chloroplasts, thylakoid membranes). Demonstrate how carbon dioxide and water are transformed into glucose and oxygen.`,
          },
          {
            step: 3,
            time: '8 min',
            heading: 'Interactive Check for Understanding',
            content: `Conduct quick formative poll questions using mini whiteboards to check student grasp of reactants vs products.`,
          },
        ],
        activity: {
          name: 'The Energy Factory Roleplay',
          duration: '10 min',
          description: 'Students work in teams of 4 representing Sun, Water, CO2, and Chloroplast to simulate the flow of energy.',
        },
        assessment: {
          questions: [
            'What are the two main chemical outputs of this biological process?',
            'How would a lack of sunlight alter plant glucose production over 48 hours?',
          ],
        },
        homework: `Complete Practice Worksheet 4.1 and write a 4-sentence reflection in your science notebook.`,
      };

    case 'notes':
      return {
        title: `Teaching & Revision Notes: ${topic}`,
        subject,
        grade,
        depth: form.notesDepth,
        purpose: form.notesPurpose,
        definitions: [
          { term: topic, definition: `The vital process by which living organisms convert raw resources into chemical energy and foundational cellular matter.` },
          { term: 'Chloroplast', definition: `Specialized organelle containing chlorophyll where light energy is harvested.` },
          { term: 'Stomata', definition: `Microscopic pores on leaf surfaces that regulate gas exchange and transpiration.` },
        ],
        keyConcepts: [
          `Light-Dependent Reactions occur in thylakoid membranes where water molecules undergo photolysis.`,
          `The Calvin Cycle takes place in the stroma, fixing carbon dioxide into high-energy carbohydrates.`,
          `Environmental rate-limiting factors include light intensity, ambient temperature, and carbon dioxide concentration.`,
        ],
        examples: [
          `Aquatic pondweed (*Elodea*) producing observable oxygen bubbles under bright lamp illumination.`,
          `Greenhouse crop yield optimization using artificial LED grow lights and climate control.`,
        ],
        commonMistakes: [
          `Mistake: Believing plants only carry out photosynthesis and not cellular respiration (plants respire 24/7!).`,
          `Mistake: Assuming oxygen is consumed rather than released as a byproduct during the light reaction.`,
        ],
        summary: `${topic} sustains terrestrial and marine ecosystems by powering the primary trophic level and replenishing atmospheric oxygen.`,
      };

    case 'presentation':
      return {
        title: `Presentation Deck: ${topic}`,
        subject,
        grade,
        slideCount: Number(form.slideCount) || 8,
        visualStyle: form.visualStyle,
        slides: [
          {
            slideNumber: 1,
            type: 'title',
            title: topic,
            subtitle: `${subject} • ${grade} Classroom Deck`,
            content: ['Instructor: Dr. Sarah Johnson', 'Teachora Educational Presentation Series'],
            speakerNotes: 'Welcome students, state today\'s topic, and hook their interest with a real-world question.',
          },
          {
            slideNumber: 2,
            type: 'objectives',
            title: 'Learning Objectives',
            subtitle: 'What we will master today',
            content: [
              'Understand the core mechanisms and chemical foundations.',
              'Identify key cellular organelles and pigment roles.',
              'Evaluate environmental factors affecting process speed.',
            ],
            speakerNotes: 'Read through the three learning goals so students know the success criteria.',
          },
          {
            slideNumber: 3,
            type: 'concept',
            title: 'Cellular Structure & Organelles',
            subtitle: 'Inside the Chloroplast',
            content: [
              'Thylakoids: Flattened disc membranes housing chlorophyll pigments.',
              'Stroma: Dense fluid region where chemical fixation takes place.',
              'Double Membrane: Regulates transport of critical biochemical molecules.',
            ],
            speakerNotes: 'Direct students\' attention to the projected diagram. Ask a volunteer to point out the stroma.',
          },
          {
            slideNumber: 4,
            type: 'process',
            title: 'The Two Key Stages',
            subtitle: 'From Sunlight to Sugar',
            content: [
              'Stage 1: Light Reactions (Thylakoids) → Produces ATP, NADPH, and O2.',
              'Stage 2: Calvin Cycle (Stroma) → Synthesizes G3P glucose molecules.',
            ],
            speakerNotes: 'Emphasize that Stage 1 captures energy while Stage 2 builds the actual organic molecule.',
          },
          {
            slideNumber: 5,
            type: 'activity',
            title: 'Quick Classroom Check',
            subtitle: '30-Second Turn & Talk',
            content: [
              'Question: If stomata close during a drought, which stage stops first and why?',
              'Discuss with your partner for 30 seconds.',
            ],
            speakerNotes: 'Circulate around the room and listen for mentions of carbon dioxide starvation.',
          },
          {
            slideNumber: 6,
            type: 'summary',
            title: 'Key Takeaways & Exit Ticket',
            subtitle: 'Summary of Understanding',
            content: [
              'Photosynthesis powers planetary food webs.',
              'Light reactions release oxygen; dark reactions produce glucose.',
              'Exit Ticket: Write the chemical word equation on your slip before leaving.',
            ],
            speakerNotes: 'Collect exit tickets at the door to assess mastery before next class.',
          },
        ],
      };

    case 'video':
      return {
        title: `Educational Video Script: ${topic}`,
        subject,
        grade,
        duration: form.videoDuration || '3 min',
        style: form.videoStyle || 'Explainer',
        audience: form.videoAudience || 'Middle school students',
        scenes: [
          {
            sceneNumber: 1,
            time: '0:00 - 0:30',
            visual: 'Close-up slow-motion shot of a green leaf soaking in morning sunlight. Water droplets glisten.',
            onScreenText: `How Plants Eat Sunlight: ${topic}`,
            narration: `Have you ever wondered why leaves are green, or how a giant oak tree grows out of nothing but thin air and sunlight? Today, we unlock the secret engine of life on Earth.`,
            sound: 'Gentle upbeat acoustic background score fades in.',
          },
          {
            sceneNumber: 2,
            time: '0:30 - 1:15',
            visual: 'Smooth 3D camera zoom through leaf cross-section into a vibrant chloroplast with glowing thylakoid discs.',
            onScreenText: 'Inside the Solar Cell of the Plant: Chloroplast',
            narration: `Deep inside every plant cell are microscopic solar generators called chloroplasts. Packed with green chlorophyll pigments, they trap energetic photons from the Sun.`,
            sound: 'Soft whoosh sound effect transitioning to animated soundscapes.',
          },
          {
            sceneNumber: 3,
            time: '1:15 - 2:15',
            visual: 'Animated split-screen diagram showing water splitting on the left and CO2 molecules assembling into glucose on the right.',
            onScreenText: 'H2O + CO2 + Light → Glucose + Oxygen',
            narration: `Water enters from the roots, carbon dioxide from the air. Using sunlight, the plant splits water, releases oxygen for us to breathe, and crafts sweet glucose for energy!`,
            sound: 'Engaging chime sound effect highlighting key molecule labels.',
          },
          {
            sceneNumber: 4,
            time: '2:15 - 3:00',
            visual: "Wide cinematic drone shot of Earth's lush forests and oceans. Summary cards appear.",
            onScreenText: 'Summary: 1. Absorbs Light 2. Makes Oxygen 3. Feeds the Planet',
            narration: "Without this incredible biological process, Earth's atmosphere wouldn't have oxygen, and food chains would collapse. Next time you see a leaf, thank it for the breath you take!",
            sound: 'Triumphant musical swell leading to outro.',
          },
        ],
      };

    case 'assignment':
      return {
        title: form.assignmentTitle || `Assignment: Comprehensive Exploration of ${topic}`,
        subject,
        grade,
        assignmentType: form.assignmentType || 'Homework',
        difficulty: form.difficulty || 'Medium',
        totalMarks: Number(form.totalMarks) || 25,
        instructions: [
          'Read all questions carefully before answering.',
          'Show all diagrams and reasoning where requested.',
          'Submit your completed paper before the designated deadline.',
        ],
        questions: [
          {
            id: 'q1',
            number: 1,
            type: 'Short answer',
            marks: 3,
            text: `Define ${topic} and write the balanced or word chemical equation.`,
          },
          {
            id: 'q2',
            number: 2,
            type: 'Multiple Choice',
            marks: 2,
            text: `Which organelle is primarily responsible for light harvesting in plant cells?`,
            options: ['A) Mitochondria', 'B) Chloroplast', 'C) Endoplasmic Reticulum', 'D) Golgi Apparatus'],
            correctAnswer: 'B) Chloroplast',
          },
          {
            id: 'q3',
            number: 3,
            type: 'Long answer / Application',
            marks: 5,
            text: `An experimenter placed an aquatic plant in water under varying light distances (10cm, 30cm, 50cm). Predict and explain how oxygen bubble production changes with distance.`,
          },
          {
            id: 'q4',
            number: 4,
            type: 'Diagram & Label',
            marks: 5,
            text: `Draw a simplified chloroplast diagram. Clearly label the outer membrane, thylakoid, grana, and stroma.`,
          },
          {
            id: 'q5',
            number: 5,
            type: 'Critical Thinking',
            marks: 10,
            text: `Compare and contrast light-dependent reactions with the Calvin cycle in terms of location, input requirements, and generated products.`,
          },
        ],
        rubric: [
          { criteria: 'Scientific Accuracy', excellent: 'All terms, equations, and organelles defined correctly (4-5 pts)', satisfactory: 'Minor inaccuracies in formulas or definitions (2-3 pts)', needsImprovement: 'Significant scientific errors (0-1 pt)' },
          { criteria: 'Explanations & Reasoning', excellent: 'Thorough logical explanations with clear causality (4-5 pts)', satisfactory: 'Basic explanations with partial reasoning (2-3 pts)', needsImprovement: 'Incomplete or unclear answers (0-1 pt)' },
        ],
        answerKey: [
          { q: 1, answer: 'Chemical process converting carbon dioxide and water into glucose and oxygen in the presence of sunlight and chlorophyll.' },
          { q: 2, answer: 'B) Chloroplast (chlorophyll pigments absorb light photons).' },
          { q: 3, answer: 'As distance increases, light intensity drops following the inverse-square law, leading to a reduced rate of photolysis and fewer oxygen bubbles.' },
        ],
      };

    case 'worksheet':
      return {
        title: `Classroom Practice Worksheet: ${topic}`,
        subject,
        grade,
        style: form.worksheetStyle || 'Classroom',
        difficulty: form.difficulty || 'Medium',
        instructions: 'Complete each section. Write your answers neatly in the spaces provided.',
        sections: [
          {
            title: 'Part 1: Key Vocabulary Match',
            items: [
              { prompt: '1. Thylakoid', match: 'A. Fluid chamber where sugar synthesis takes place' },
              { prompt: '2. Stroma', match: 'B. Green pigment that absorbs red and blue wavelengths' },
              { prompt: '3. Chlorophyll', match: 'C. Membrane discs where light energy is harvested' },
            ],
          },
          {
            title: 'Part 2: Fill in the Blanks',
            items: [
              { sentence: 'During the light reactions, water is split into ________ gas and hydrogen ions.' },
              { sentence: 'The microscopic pores on leaves that allow carbon dioxide intake are called ________.' },
              { sentence: 'The sugar molecule synthesized during the Calvin cycle is ________.' },
            ],
          },
          {
            title: 'Part 3: Short Analysis Questions',
            items: [
              { sentence: 'Why do leaves change color in autumn when chlorophyll breaks down?' },
              { sentence: 'Explain how temperature affects the rate of enzyme activity in photosynthesis.' },
            ],
          },
        ],
        hints: [
          'Remember: Chlorophyll absorbs blue and red light, but reflects green light.',
          'Enzymes operate at an optimal temperature range before becoming denatured.',
        ],
      };

    case 'activity':
      return {
        title: `Interactive Activity: ${topic}`,
        subject,
        grade,
        activityType: form.activityType || 'Group',
        duration: form.duration || '30 min',
        difficulty: form.difficulty || 'Intermediate',
        objective: form.activityObjective || `To simulate and observe how environmental variables govern biological rates.`,
        materials: [
          '4 Beakers with water per team',
          'Fresh sprigs of *Elodea* or spinach leaves',
          'Adjustable desk lamps with metric rulers',
          'Sodium bicarbonate powder (carbon source)',
          'Stopwatch & data recording sheets',
        ],
        teacherSteps: [
          'Pre-set lab stations with fresh leafy material and dissolved bicarbonate solution.',
          'Instruct students to place the lamp at 10cm, 20cm, and 40cm intervals from their beaker.',
          'Demonstrate how to count ascending oxygen gas bubbles per 60-second window.',
          'Lead a whole-group discussion plotting class averages on the main board.',
        ],
        studentSteps: [
          'Step 1: Set up beaker with 1 sprig of aquatic plant in bicarbonate solution.',
          'Step 2: Position the lamp exactly 10cm away. Wait 2 minutes for equilibrium.',
          'Step 3: Count and record the number of oxygen bubbles released over 1 minute. Repeat 3 times.',
          'Step 4: Move lamp to 20cm and 40cm, repeating your counts for each trial.',
          'Step 5: Calculate mean bubble rates and construct a rate vs distance line graph.',
        ],
        reflectionQuestions: [
          'What was the independent variable in your investigation?',
          'Why did the bubble rate decrease as the light moved further away?',
          "What potential experimental errors might have affected your team's bubble count?",
        ],
      };

    case 'flashcards':
      return {
        title: `Flashcard Study Deck: ${topic}`,
        subject,
        grade,
        cardCount: Number(form.flashcardCount) || 12,
        cardType: form.flashcardType || 'Term → Definition',
        cards: [
          { id: 1, front: 'Chlorophyll', back: 'The primary green photosynthetic pigment that absorbs solar light energy.', category: 'Pigments', mnemonic: 'Chloro = Green, Phyll = Leaf' },
          { id: 2, front: 'Stomata', back: 'Microscopic pores on leaf surfaces that regulate CO2 influx and water vapor release.', category: 'Leaf Anatomy', mnemonic: 'Stoma = Mouth / Pore' },
          { id: 3, front: 'Photolysis', back: 'The light-driven splitting of water molecules into oxygen, protons, and electrons.', category: 'Reactions', mnemonic: 'Photo = Light, Lysis = Split' },
          { id: 4, front: 'Stroma', back: 'The fluid-filled inner space of the chloroplast surrounding the thylakoids where the Calvin cycle occurs.', category: 'Organelles', mnemonic: 'Stroma = Space / Soup' },
          { id: 5, front: 'Thylakoid', back: 'Membrane-bound compartments inside chloroplasts where light-dependent reactions take place.', category: 'Organelles', mnemonic: 'Thylakoid = Tiny Green Coin' },
          { id: 6, front: 'RuBisCO', back: 'The primary enzyme responsible for fixing atmospheric CO2 during the Calvin cycle.', category: 'Enzymes', mnemonic: 'The Carbon Fixer' },
        ],
      };

    case 'quiz':
      return {
        title: `Assessment Quiz: ${topic}`,
        subject,
        grade,
        timeLimit: form.quizTimeLimit || '15 min',
        difficulty: form.difficulty || 'Medium',
        totalQuestions: 5,
        totalMarks: 10,
        questions: [
          {
            id: 'qz1',
            number: 1,
            question: `Which molecule provides the oxygen atoms released during photosynthesis?`,
            type: 'MCQ',
            options: ['A) Carbon Dioxide (CO2)', 'B) Water (H2O)', 'C) Glucose (C6H12O6)', 'D) Ozone (O3)'],
            correctIndex: 1,
            correctAnswer: 'B) Water (H2O)',
            explanation: 'Water molecules undergo photolysis during the light reactions, splitting into hydrogen ions and releasing diatomic oxygen gas.',
            marks: 2,
          },
          {
            id: 'qz2',
            number: 2,
            question: `The Calvin cycle occurs in which part of the chloroplast?`,
            type: 'MCQ',
            options: ['A) Thylakoid Lumen', 'B) Outer Membrane', 'C) Stroma', 'D) Intermembrane space'],
            correctIndex: 2,
            correctAnswer: 'C) Stroma',
            explanation: 'The stroma contains the enzymes (including RuBisCO) required for light-independent carbon fixation.',
            marks: 2,
          },
          {
            id: 'qz3',
            number: 3,
            question: `True or False: Plant cells carry out cellular respiration only during nighttime.`,
            type: 'True/False',
            options: ['A) True', 'B) False'],
            correctIndex: 1,
            correctAnswer: 'B) False',
            explanation: 'Plant cells carry out cellular respiration continuously 24 hours a day to provide ATP for cellular maintenance.',
            marks: 2,
          },
          {
            id: 'qz4',
            number: 4,
            question: `What are the two high-energy energy carriers produced in light reactions that fuel the Calvin cycle?`,
            type: 'Short answer',
            options: ['A) ATP and NADPH', 'B) ADP and NADP+', 'C) Glucose and Pyruvate', 'D) FADH2 and NADH'],
            correctIndex: 0,
            correctAnswer: 'A) ATP and NADPH',
            explanation: 'ATP provides phosphate bond energy while NADPH provides reducing electrons to assemble carbohydrates.',
            marks: 2,
          },
          {
            id: 'qz5',
            number: 5,
            question: `Which factor is a primary rate-limiting variable for photosynthetic yield?`,
            type: 'MCQ',
            options: ['A) Soil Nitrogen', 'B) Light Intensity', 'C) Atmospheric Nitrogen', 'D) Gravitational Pull'],
            correctIndex: 1,
            correctAnswer: 'B) Light Intensity',
            explanation: 'Light intensity directly governs photon capture rate up until enzyme saturation points.',
            marks: 2,
          },
        ],
      };

    case 'mock-test':
      return {
        title: `Timed Mock Test: ${topic}`,
        subject,
        grade,
        duration: form.mockDuration || '60 min',
        totalMarks: Number(form.mockTotalMarks) || 50,
        distribution: {
          easy: form.easyPercentage || 30,
          medium: form.mediumPercentage || 50,
          hard: form.hardPercentage || 20,
        },
        sections: [
          {
            name: 'Section 1: Objective & Conceptual Foundations (Easy 30%)',
            marks: 15,
            questionCount: 15,
            questions: [
              { q: '1. State the organelle where photosynthesis occurs.', marks: 1 },
              { q: '2. Name the green pigment that absorbs light energy.', marks: 1 },
              { q: '3. Identify the byproduct gas released into the atmosphere.', marks: 1 },
            ],
          },
          {
            name: 'Section 2: Analytical & Chemical Mechanisms (Medium 50%)',
            marks: 25,
            questionCount: 5,
            questions: [
              { q: '4. Describe the sequence of electron transport in thylakoid membranes (5 marks).', marks: 5 },
              { q: '5. Differentiate between cyclic and non-cyclic photophosphorylation (5 marks).', marks: 5 },
            ],
          },
          {
            name: 'Section 3: Experimental Analysis & Case Studies (Hard 20%)',
            marks: 10,
            questionCount: 2,
            questions: [
              { q: '6. Analyze a graph of CO2 concentration vs net carbon fixation rate. Interpret the plateau region (5 marks).', marks: 5 },
              { q: '7. Formulate a hypothesis for why C4 plants have higher photosynthetic efficiency in arid tropical climates (5 marks).', marks: 5 },
            ],
          },
        ],
      };

    case 'question-paper':
    case 'exam':
      return {
        title: form.examName || `${subject} Term Examination: ${topic}`,
        subject,
        grade,
        duration: form.examDuration || '90 min',
        totalMarks: Number(form.examTotalMarks) || 80,
        generalInstructions: [
          'All questions are compulsory unless internal choice is provided.',
          'Write answers in clear, legible handwriting.',
          'Draw neat, labeled diagrams wherever required.',
          'Calculators and electronic devices are strictly prohibited.',
        ],
        sections: form.sections && form.sections.length > 0 ? form.sections : [
          { id: '1', name: 'Section A: Multiple Choice Questions', questionType: 'MCQ', questionCount: 10, marksPerQuestion: 1, instructions: 'Choose the correct option.' },
          { id: '2', name: 'Section B: Short Answer Questions', questionType: 'Short answer', questionCount: 6, marksPerQuestion: 3, instructions: 'Answer in 30-50 words.' },
          { id: '3', name: 'Section C: Long Answer & Diagrams', questionType: 'Long answer', questionCount: 4, marksPerQuestion: 5, instructions: 'Answer in 80-120 words with diagrams.' },
        ],
        sampleQuestions: [
          { sec: 'Section A', q: 'Q1. The primary photosynthetic pigment in terrestrial green plants is: [1 Mark]' },
          { sec: 'Section A', q: 'Q2. Photolysis of water occurs inside: [1 Mark]' },
          { sec: 'Section B', q: 'Q11. Explain why plants appear green to the human eye. [3 Marks]' },
          { sec: 'Section B', q: 'Q12. What role do stomata play during hot, arid weather conditions? [3 Marks]' },
          { sec: 'Section C', q: 'Q17. Draw and label the complete structure of a chloroplast. Explain the Calvin cycle. [5 Marks]' },
        ],
      };

    case 'diagram':
      return {
        title: `Diagram Illustration: ${topic}`,
        subject,
        grade,
        diagramType: form.diagramType || 'Labeled diagram',
        style: form.diagramStyle || 'Academic',
        orientation: form.diagramOrientation || 'Landscape',
        goal: form.diagramGoal || `Illustrate the internal structure of a plant cell chloroplast and the flow of photosynthesis.`,
        labels: [
          { id: 'l1', name: 'Outer Membrane', x: 20, y: 30, desc: 'Permeable phospholipid bilayer containing porin channels.' },
          { id: 'l2', name: 'Inner Membrane', x: 30, y: 40, desc: 'Highly selective barrier regulating metabolite transport.' },
          { id: 'l3', name: 'Thylakoid Disc', x: 50, y: 55, desc: 'Site of light harvesting and photolysis.' },
          { id: 'l4', name: 'Granum (Thylakoid Stack)', x: 60, y: 50, desc: 'Interconnected disc stacks maximizing surface area.' },
          { id: 'l5', name: 'Stroma (Fluid Matrix)', x: 75, y: 65, desc: 'Enzymatic chamber where the Calvin cycle fixes carbon.' },
        ],
      };

    case 'mind-map':
      return {
        title: `Mind Map Concept Hierarchy: ${topic}`,
        subject,
        grade,
        layout: form.mindMapLayout || 'Radial',
        depth: form.mindMapDepth || 'Standard',
        rootNode: {
          id: 'root',
          label: topic,
          children: [
            {
              id: 'c1',
              label: '1. Light Reactions (Thylakoids)',
              color: '#0284c7',
              children: [
                { id: 'c1-1', label: 'Photolysis of H2O' },
                { id: 'c1-2', label: 'Chlorophyll Activation' },
                { id: 'c1-3', label: 'ATP & NADPH Generation' },
                { id: 'c1-4', label: 'Oxygen Released' },
              ],
            },
            {
              id: 'c2',
              label: '2. Calvin Cycle (Stroma)',
              color: '#059669',
              children: [
                { id: 'c2-1', label: 'Carbon Fixation (RuBisCO)' },
                { id: 'c2-2', label: 'Reduction Phase' },
                { id: 'c2-3', label: 'G3P Glucose Synthesis' },
                { id: 'c2-4', label: 'RuBP Regeneration' },
              ],
            },
            {
              id: 'c3',
              label: '3. Limiting Variables',
              color: '#d97706',
              children: [
                { id: 'c3-1', label: 'Light Intensity' },
                { id: 'c3-2', label: 'CO2 Concentration' },
                { id: 'c3-3', label: 'Ambient Temperature' },
              ],
            },
            {
              id: 'c4',
              label: '4. Ecological Role',
              color: '#7c3aed',
              children: [
                { id: 'c4-1', label: 'Primary Producer Biomass' },
                { id: 'c4-2', label: 'Atmospheric O2 Balance' },
                { id: 'c4-3', label: 'Global Carbon Sink' },
              ],
            },
          ],
        },
      };

    case 'chart':
      return {
        title: form.chartTitle || `Chart: ${topic} Performance Metrics`,
        subject,
        grade,
        chartType: form.chartType || 'Bar',
        orientation: form.chartOrientation || 'Vertical',
        purpose: form.chartPurpose || 'Demonstrate student activity metrics',
        data: form.chartData && form.chartData.length > 0 ? form.chartData : [
          { id: '1', label: 'Week 1', value: 45 },
          { id: '2', label: 'Week 2', value: 68 },
          { id: '3', label: 'Week 3', value: 82 },
          { id: '4', label: 'Week 4', value: 95 },
        ],
        includes: form.chartIncludes || ['Legend', 'Axis labels', 'Data labels'],
      };

    case 'infographic':
      return {
        title: `Visual Infographic: ${topic}`,
        subject,
        grade,
        style: form.infographicStyle || 'Modern',
        orientation: form.infographicOrientation || 'Portrait',
        purpose: form.infographicPurpose || 'Concept summary',
        sections: [
          {
            title: '1. What is Photosynthesis?',
            icon: 'Sparkles',
            color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
            content: 'The biological solar engine transforming water, carbon dioxide, and sunlight into oxygen and glucose.',
            stat: '100 Billion Tons of Biomass Created Annually',
          },
          {
            title: '2. The Chemical Recipe',
            icon: 'Flame',
            color: 'bg-blue-50 text-blue-800 border-blue-200',
            content: '6 CO2 + 6 H2O + Light Energy ➔ C6H12O6 + 6 O2',
            stat: '98% Efficiency in Photon Absorption',
          },
          {
            title: '3. The Two Core Stages',
            icon: 'Layers',
            color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
            content: 'Stage 1 (Light Reactions in Thylakoids) harvests solar photons. Stage 2 (Calvin Cycle in Stroma) fixes carbon into carbohydrates.',
            stat: '2 Interconnected Stages',
          },
          {
            title: '4. Planetary Importance',
            icon: 'Globe',
            color: 'bg-amber-50 text-amber-800 border-amber-200',
            content: "Supplies 100% of organic food chains and produces nearly all oxygen in Earth's breathable atmosphere.",
            stat: '21% Planetary Oxygen Maintained',
          },
        ],
      };

    default:
      return {
        title: `${topic}`,
        subject,
        grade,
        content: `Structured teaching material preview for ${topic}.`,
      };
  }
}
