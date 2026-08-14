import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ikqabwaofdxtfcuwfifd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5COrnvsTtdbDNMChgehmVg_wX-sEpd8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testImageGeneration() {
  console.log('==================================================');
  console.log('TEACHORA PHASE 2A: POLLINATIONS AI IMAGE TEST');
  console.log('==================================================\n');

  // 1. Unauthenticated test
  console.log('[1/4] Testing Unauthenticated Request...');
  const unauthRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Photosynthesis' }),
  });
  if (unauthRes.status === 401) {
    console.log('  ✓ PASS: Blocked unauthenticated request (401 Unauthorized)');
  } else {
    console.error('  ✗ FAIL: Expected 401, got', unauthRes.status);
  }

  // 2. Authenticate test teacher
  console.log('\n[2/4] Authenticating test teacher...');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'testteacher_phase2@example.com',
    password: 'TestPassword123!',
  });
  if (authErr || !auth.session) {
    console.error('  ✗ Auth error:', authErr);
    return;
  }
  const token = auth.session.access_token;
  console.log('  ✓ PASS: Authenticated user ID:', auth.user.id);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 3. Test Pollinations AI Image Generation
  console.log('\n[3/4] Testing Pollinations AI Image Generation (visualSource: "ai")...');
  const start = Date.now();
  const aiRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      topic: 'Photosynthesis in Plant Leaves',
      subject: 'Biology',
      grade: 'Grade 8',
      style: 'educational vector illustration',
      aspectRatio: 'landscape',
      visualSource: 'ai',
    }),
  });

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  const aiData = await aiRes.json();
  if (aiData.success && aiData.image?.url) {
    console.log(`  ✓ PASS [${duration}s]: Pollinations AI image generated!`);
    console.log(`    - Provider: ${aiData.provider} (${aiData.source})`);
    console.log(`    - Dimensions: ${aiData.image.width}x${aiData.image.height}`);
    console.log(`    - Model: ${aiData.image.model}`);
    console.log(`    - Attribution: ${aiData.image.attribution}`);
    console.log(`    - URL length: ${aiData.image.url.length} chars (starts with ${aiData.image.url.slice(0, 45)}...)`);
  } else {
    console.error(`  ✗ FAIL [${duration}s]: AI generation failed:`, aiData);
  }

  // 4. Test Stock Visual Mode (Pexels)
  console.log('\n[4/4] Testing Stock Mode (visualSource: "stock")...');
  const stockRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      topic: 'Volcano eruption',
      visualSource: 'stock',
    }),
  });
  const stockData = await stockRes.json();
  if (stockData.success && stockData.found && stockData.media?.length > 0) {
    console.log(`  ✓ PASS: Stock image search returned ${stockData.media.length} photos from Pexels.`);
    console.log(`    - Attribution: ${stockData.media[0].attribution}`);
  } else {
    console.error('  ✗ Stock search failed:', stockData);
  }

  console.log('\n==================================================');
  console.log('POLLINATIONS & MEDIA TESTS COMPLETE');
  console.log('==================================================');
}

testImageGeneration();
