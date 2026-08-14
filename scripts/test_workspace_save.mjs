import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ikqabwaofdxtfcuwfifd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5COrnvsTtdbDNMChgehmVg_wX-sEpd8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testWorkspaceSave() {
  console.log('Testing Workspace Project Persistence...');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'testteacher_phase2@example.com',
    password: 'TestPassword123!',
  });

  if (authErr || !auth.user) {
    console.error('Auth error:', authErr);
    return;
  }

  const { data: proj, error: projErr } = await supabase
    .from('projects')
    .insert({
      user_id: auth.user.id,
      title: 'Assessment Quiz: Photosynthesis',
      project_type: 'quiz',
      subject: 'Science',
      grade_level: 'Grade 8',
      status: 'completed',
      metadata: {
        total_questions: 5,
        content: { title: 'Photosynthesis Quiz', questions: [{ q: 'What is chlorophyll?' }] },
      },
    })
    .select()
    .single();

  if (projErr) {
    console.error('✗ FAIL inserting project:', projErr);
  } else {
    console.log('✓ PASS: Project inserted successfully! ID:', proj.id);
  }
}

testWorkspaceSave();
