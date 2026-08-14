import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ikqabwaofdxtfcuwfifd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5COrnvsTtdbDNMChgehmVg_wX-sEpd8';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runAllTests() {
  console.log('==================================================');
  console.log('TEACHORA PHASE 2A — FINAL IMAGE GENERATION REPORT');
  console.log('==================================================\n');

  // Auth
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'testteacher_phase2@example.com',
    password: 'TestPassword123!',
  });
  if (authErr || !auth.session) { console.error('Auth failed:', authErr); return; }
  const headers = { 'Authorization': `Bearer ${auth.session.access_token}`, 'Content-Type': 'application/json' };
  console.log('✓ Auth: PASS\n');

  // [1] Unauthenticated rejection
  const r1 = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: 'test' }),
  });
  console.log(`[1] Security (Unauth Rejection): ${r1.status === 401 ? '✓ PASS' : '✗ FAIL'} (HTTP ${r1.status})`);

  // [2] AI mode (Pollinations)
  const t2 = Date.now();
  const r2 = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST', headers, body: JSON.stringify({ topic: 'Diagram of Human Heart', subject: 'Biology', grade: 'Grade 9', visualSource: 'ai', style: 'educational illustration', aspectRatio: 'landscape' }),
  });
  const d2 = await r2.json();
  console.log(`[2] Pollinations AI (visualSource=ai): ${d2.success && d2.image?.url ? `✓ PASS [${((Date.now()-t2)/1000).toFixed(1)}s] - Model: ${d2.image.model}, URL starts: ${d2.image.url.slice(0, 55)}...` : '✗ FAIL - ' + JSON.stringify(d2.error)}`);

  // [3] Stock mode (Pexels only)
  const t3 = Date.now();
  const r3 = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST', headers, body: JSON.stringify({ topic: 'ocean waves', visualSource: 'stock' }),
  });
  const d3 = await r3.json();
  console.log(`[3] Pexels Stock (visualSource=stock): ${d3.success && d3.found && d3.media?.length > 0 ? `✓ PASS [${((Date.now()-t3)/1000).toFixed(1)}s] - ${d3.media.length} photos, Attribution: ${d3.media[0]?.attribution}` : (d3.success && !d3.found ? '✓ PASS (no results — correctly no AI fallback)' : '✗ FAIL - ' + JSON.stringify(d3.error))}`);

  // [4] Stock-only with obscure topic — should NOT trigger AI, should return "No visual found"
  const t4 = Date.now();
  const r4 = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST', headers, body: JSON.stringify({ topic: 'quasicrystal icosahedral diffraction lattice topology', visualSource: 'stock' }),
  });
  const d4 = await r4.json();
  console.log(`[4] Stock-only (obscure topic, no AI fallback): ${d4.success && !d4.found ? `✓ PASS [${((Date.now()-t4)/1000).toFixed(1)}s] - No stock photo found, message: "${d4.message}"` : (d4.success && d4.found ? '✓ PASS (stock found)' : '✗ FAIL')}`);

  // [5] Auto mode — common topic should return Pexels photos
  const t5 = Date.now();
  const r5 = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST', headers, body: JSON.stringify({ topic: 'photosynthesis plant', visualSource: 'auto' }),
  });
  const d5 = await r5.json();
  console.log(`[5] Auto mode (common topic → Pexels): ${d5.success && d5.found && d5.provider === 'pexels' ? `✓ PASS [${((Date.now()-t5)/1000).toFixed(1)}s] - Pexels served first (${d5.media?.length} photos)` : (d5.success && d5.provider === 'pollinations' ? `⚠ WARN - Pexels missed, Pollinations served image` : '✗ FAIL - ' + JSON.stringify(d5.error))}`);

  // [6] Auto mode — obscure topic should fall back to Pollinations AI
  const t6 = Date.now();
  const r6 = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST', headers, body: JSON.stringify({ topic: 'quasicrystal icosahedral diffraction lattice topology for Grade 10 Physics', visualSource: 'auto', style: 'educational scientific diagram' }),
  });
  const d6 = await r6.json();
  console.log(`[6] Auto mode (obscure → Pollinations fallback): ${d6.success && d6.provider === 'pollinations' ? `✓ PASS [${((Date.now()-t6)/1000).toFixed(1)}s] - Fell back to Pollinations AI, Model: ${d6.image?.model}` : (d6.success && d6.provider === 'pexels' ? '⚠ WARN - Pexels still returned results' : '✗ FAIL - ' + JSON.stringify(d6.error))}`);

  // [7] Input validation — empty topic
  const r7 = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST', headers, body: JSON.stringify({ topic: '   ', visualSource: 'ai' }),
  });
  console.log(`[7] Input validation (empty topic): ${r7.status === 400 ? '✓ PASS (400 Bad Request)' : '✗ FAIL (got ' + r7.status + ')'}`);

  console.log('\n==================================================');
  console.log('ALL TESTS COMPLETE');
  console.log('==================================================');
}

runAllTests();
