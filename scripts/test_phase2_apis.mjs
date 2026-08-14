import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ikqabwaofdxtfcuwfifd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5COrnvsTtdbDNMChgehmVg_wX-sEpd8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
  console.log('==================================================');
  console.log('TEACHORA PHASE 2 API VERIFICATION TEST SUITE');
  console.log('==================================================\n');

  // 1. Unauthenticated invocation test
  console.log('[1/10] Testing Unauthenticated Rejection (Security check)...');
  try {
    const unauthRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creationType: 'lesson', form: { topic: 'Test' } }),
    });
    if (unauthRes.status === 401) {
      console.log('  ✓ PASS: Unauthenticated request correctly blocked with 401 Unauthorized.');
    } else {
      console.error(`  ✗ FAIL: Expected 401, got status ${unauthRes.status}`);
    }
  } catch (err) {
    console.error('  ✗ Error testing unauth:', err.message);
  }

  // 2. Authentication
  console.log('\n[2/10] Authenticating test teacher...');
  const email = 'testteacher_phase2@example.com';
  const password = 'TestPassword123!';

  let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.log('  Account not found, signing up test teacher...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: 'Dr. Sarah Jenkins', subject: 'Science', grade_level: 'Grade 8' } },
    });
    if (signUpError) {
      console.error('  ✗ Signup failed:', signUpError.message);
      return;
    }
    authData = signUpData;
  }

  const token = authData?.session?.access_token;
  if (!token) {
    console.error('  ✗ No session access token obtained');
    return;
  }
  console.log('  ✓ PASS: Teacher authenticated successfully (ID: ' + authData.user.id + ')');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 3. Search Media (Pexels) Test
  console.log('\n[3/10] Testing search-media Edge Function (Pexels Photos & Videos)...');
  try {
    const photoRes = await fetch(`${SUPABASE_URL}/functions/v1/search-media`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: 'photosynthesis leaf', type: 'photos', perPage: 3 }),
    });
    const photoData = await photoRes.json();
    if (photoData.success && photoData.media?.length > 0) {
      console.log(`  ✓ PASS: Pexels Photo Search returned ${photoData.media.length} photos. (Attribution: "${photoData.media[0].attribution}")`);
    } else {
      console.error('  ✗ Pexels photo search failed:', photoData);
    }

    const videoRes = await fetch(`${SUPABASE_URL}/functions/v1/search-media`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: 'plant cell', type: 'videos', perPage: 2 }),
    });
    const videoData = await videoRes.json();
    if (videoData.success && videoData.media?.length > 0) {
      console.log(`  ✓ PASS: Pexels Video Search returned ${videoData.media.length} video clips.`);
    } else {
      console.error('  ✗ Pexels video search failed:', videoData);
    }
  } catch (err) {
    console.error('  ✗ search-media error:', err.message);
  }

  // Helper to test generate-content with pacing
  async function testType(name, type, form) {
    await new Promise((r) => setTimeout(r, 1500)); // Pacing between batch tests
    const start = Date.now();
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-content`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ creationType: type, form }),
      });
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      const json = await res.json();
      if (json.success && json.result) {
        console.log(`  ✓ PASS [${duration}s]: ${name} generated successfully by Groq (${json.metadata?.model}). Title: "${json.result.title}"`);
        return json.result;
      } else {
        console.error(`  ✗ FAIL [${duration}s]: ${name} failed:`, json.error || json);
        return null;
      }
    } catch (err) {
      console.error(`  ✗ FAIL: ${name} error:`, err.message);
      return null;
    }
  }

  // 4. Test Lesson Generation
  console.log('\n[4/10] Testing Lesson Generation (TEACH)...');
  const lesson = await testType('Lesson', 'lesson', {
    subject: 'Science',
    grade: 'Grade 8',
    topic: 'Photosynthesis and Cellular Respiration',
    language: 'English',
    difficulty: 'Intermediate',
    duration: '45 min',
  });
  if (lesson) {
    console.log(`    - Learning Objectives: ${lesson.learningObjectives?.length}`);
    console.log(`    - Teaching Steps: ${lesson.teachingSteps?.length}`);
  }

  // 5. Test Assignment Generation (Question count & marks)
  console.log('\n[5/10] Testing Assignment Generation (PRACTICE)...');
  const assignment = await testType('Assignment', 'assignment', {
    subject: 'Science',
    grade: 'Grade 8',
    topic: 'Photosynthesis',
    assignmentType: 'Homework',
    totalMarks: 25,
    questionCount: 5,
  });
  if (assignment) {
    console.log(`    - Questions Generated: ${assignment.questions?.length}`);
    console.log(`    - Total Marks: ${assignment.totalMarks}`);
    console.log(`    - Rubric Criteria: ${assignment.rubric?.length}`);
  }

  // 6. Test Quiz Generation
  console.log('\n[6/10] Testing Quiz Generation (ASSESS)...');
  const quiz = await testType('Quiz', 'quiz', {
    subject: 'Science',
    grade: 'Grade 8',
    topic: 'Photosynthesis',
    quizTimeLimit: '15 min',
    questionCount: 5,
  });
  if (quiz) {
    console.log(`    - Questions: ${quiz.questions?.length}`);
    console.log(`    - Q1: "${quiz.questions?.[0]?.question}" -> Correct: "${quiz.questions?.[0]?.correctAnswer}"`);
  }

  // 7. Test Mind Map & Diagram Generation (VISUALIZE)
  console.log('\n[7/10] Testing Mind Map & Diagram (VISUALIZE)...');
  const mindMap = await testType('Mind Map', 'mind-map', {
    subject: 'Science',
    grade: 'Grade 8',
    topic: 'Photosynthesis',
    mindMapLayout: 'Radial',
  });
  if (mindMap) {
    console.log(`    - Mind Map Root: "${mindMap.rootNode?.label}" with ${mindMap.rootNode?.children?.length} branches.`);
  }

  const diagram = await testType('Diagram', 'diagram', {
    subject: 'Science',
    grade: 'Grade 8',
    topic: 'Chloroplast Structure',
    diagramType: 'Labeled diagram',
  });
  if (diagram) {
    console.log(`    - Diagram Labels: ${diagram.labels?.length} callout pins generated.`);
  }

  // 8. Test Presentation with Pexels Media Enhancement
  console.log('\n[8/10] Testing Presentation Generation (TEACH)...');
  const presentation = await testType('Presentation', 'presentation', {
    subject: 'Science',
    grade: 'Grade 8',
    topic: 'Photosynthesis in Plants',
    slideCount: 5,
  });
  if (presentation) {
    console.log(`    - Slides: ${presentation.slides?.length}`);
    const mediaAttached = presentation.slides?.some((s) => s.mediaSuggestions && s.mediaSuggestions.length > 0);
    console.log(`    - Pexels Media Enhancement: ${mediaAttached ? 'Active (Media attached to slides)' : 'Skipped/No visual prompt'}`);
  }

  // 9. Test Video Script & Storyboard
  console.log('\n[9/10] Testing Video Storyboard & Script (TEACH)...');
  const video = await testType('Video', 'video', {
    subject: 'Science',
    grade: 'Grade 8',
    topic: 'How Chloroplasts Capture Sunlight',
    videoDuration: '3 min',
    videoStyle: 'Explainer',
  });
  if (video) {
    console.log(`    - Storyboard Scenes: ${video.scenes?.length}`);
    const vidClips = video.scenes?.some((sc) => sc.videoSuggestions && sc.videoSuggestions.length > 0);
    console.log(`    - Pexels Video Suggestions: ${vidClips ? 'Active (Video clips attached to scenes)' : 'Optional'}`);
  }

  // 10. Test Chart with Authoritative Teacher Data
  console.log('\n[10/10] Testing Chart with Teacher Authoritative Data (VISUALIZE)...');
  const teacherRows = [
    { id: '1', label: 'January', value: 20 },
    { id: '2', label: 'February', value: 30 },
    { id: '3', label: 'March', value: 25 },
  ];
  const chart = await testType('Chart', 'chart', {
    subject: 'Science',
    grade: 'Grade 8',
    topic: 'Classroom Plant Growth Measurements',
    chartType: 'Bar',
    chartData: teacherRows,
  });
  if (chart) {
    const dataMatch = JSON.stringify(chart.data) === JSON.stringify(teacherRows);
    console.log(`    - Teacher Data Preserved Exactly: ${dataMatch ? 'YES (20, 30, 25)' : 'NO'}`);
  }

  console.log('\n==================================================');
  console.log('ALL PHASE 2 API TESTS COMPLETED');
  console.log('==================================================');
}

runTests();
