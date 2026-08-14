async function checkPollinations() {
  const prompt = encodeURIComponent('educational illustration of a plant cell');
  
  // Endpoint 1: https://image.pollinations.ai/prompt/{prompt}
  console.log('Testing https://image.pollinations.ai/prompt/...');
  try {
    const res1 = await fetch(`https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true`);
    console.log('Endpoint 1 status:', res1.status, res1.headers.get('content-type'));
  } catch (e) {
    console.error('Endpoint 1 error:', e.message);
  }

  // Endpoint 2: https://gen.pollinations.ai/image/{prompt}
  console.log('\nTesting https://gen.pollinations.ai/image/...');
  try {
    const res2 = await fetch(`https://gen.pollinations.ai/image/${prompt}?width=512&height=512&nologo=true`);
    console.log('Endpoint 2 status:', res2.status, res2.headers.get('content-type'));
  } catch (e) {
    console.error('Endpoint 2 error:', e.message);
  }
}

checkPollinations();
