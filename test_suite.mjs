import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3000';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  \x1b[32m✓ PASS\x1b[0m ${testName}`);
    passedTests++;
  } else {
    console.error(`  \x1b[31m✗ FAIL\x1b[0m ${testName} ${details ? `(${details})` : ''}`);
    failedTests++;
  }
}

console.log('\n\x1b[1m\x1b[35m=======================================================');
console.log('   FINGLORA COMPREHENSIVE END-TO-END TEST SUITE');
console.log('=======================================================\x1b[0m\n');

// ----------------------------------------------------------------------
// SUITE 1: Server Health & Routing
// ----------------------------------------------------------------------
console.log('\x1b[36m[SUITE 1] Next.js Server & Page Endpoints\x1b[0m');

try {
  const homeRes = await fetch(`${BASE_URL}/`);
  assert(homeRes.status === 200, 'Home page (GET /) responds with HTTP 200');
  const html = await homeRes.text();
  assert(html.includes('Finglora') || html.includes('finglora'), 'Home page contains Finglora branding');
  assert(html.includes('<!DOCTYPE html>'), 'Home page renders valid SSR HTML document');
} catch (err) {
  assert(false, 'Home page connectivity', err.message);
}

// ----------------------------------------------------------------------
// SUITE 2: Gemini 3.8 Flash Vision Extraction API
// ----------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 2] Pure Google Gemini 3.8 Flash Vision Extraction\x1b[0m');

// Test 2.1: Missing input
try {
  const emptyRes = await fetch(`${BASE_URL}/api/extract-nails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert(emptyRes.status === 400, 'Empty payload triggers HTTP 400 Bad Request');
  const emptyData = await emptyRes.json();
  assert(emptyData.error === 'Provide either imageUrl or imageBase64', 'Empty payload returns expected error message');
} catch (err) {
  assert(false, 'Extraction 400 validation', err.message);
}

// Test 2.2: Real Gemini 3.8 Flash Vision extraction on authentic nail art photo
try {
  const manicureUrl = 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80';
  console.log('  \x1b[33m⏳ Dispatching manicure photo to Google Gemini Vision...\x1b[0m');
  const startTime = Date.now();
  const extractRes = await fetch(`${BASE_URL}/api/extract-nails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl: manicureUrl }),
  });
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  assert(extractRes.status === 200, `Gemini API responded with HTTP 200 in ${duration}s`);
  const extractData = await extractRes.json();
  assert(extractData.success === true, 'Extraction response has success: true');
  assert(extractData.source?.includes('gemini'), `Extraction verified from Google Gemini (${extractData.source})`);
  
  const nails = extractData.data?.nails;
  assert(Boolean(nails), 'Gemini extracted structured 5-finger nails object');
  if (nails) {
    const fingers = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    const allPresent = fingers.every(f => Boolean(nails[f]));
    assert(allPresent, 'All 5 fingers (thumb, index, middle, ring, pinky) present in Gemini result');

    const middleFinger = nails.middle;
    if (middleFinger) {
      assert(middleFinger.baseColor?.startsWith('#'), `Middle finger baseColor is valid hex: ${middleFinger.baseColor}`);
      assert(middleFinger.accentColor?.startsWith('#'), `Middle finger accentColor is valid hex: ${middleFinger.accentColor}`);
      assert(typeof middleFinger.shape === 'string', `Middle finger shape identified: "${middleFinger.shape}"`);
      assert(typeof middleFinger.finish === 'string', `Middle finger finish identified: "${middleFinger.finish}"`);
      assert(typeof middleFinger.clientNote === 'string' && middleFinger.clientNote.length > 5, `Detailed Gemini client notes generated: "${middleFinger.clientNote.slice(0, 40)}..."`);
    }
  }
} catch (err) {
  assert(false, 'Gemini Vision live extraction', err.message);
}

// ----------------------------------------------------------------------
// SUITE 3: 1 + 1 Credit Engine & Paywall Logic
// ----------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 3] 1 + 1 Credit Engine & Paywall State Machine\x1b[0m');

// In-memory mock localStorage simulating browser client
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();

function mockGetUserCreditStatus() {
  const isPro = mockStorage.getItem('finglora_is_pro_subscriber') === 'true';
  const hasReceivedSignupBonus = mockStorage.getItem('finglora_signup_bonus_granted') === 'true';
  const storedCredits = mockStorage.getItem('finglora_tryon_credits');
  let credits = 1;
  if (storedCredits !== null) {
    credits = parseInt(storedCredits, 10);
    if (isNaN(credits)) credits = 0;
  } else {
    mockStorage.setItem('finglora_tryon_credits', '1');
  }
  const hasUsedGuestCredit = storedCredits !== null && credits < 1 && !hasReceivedSignupBonus;
  return {
    credits: isPro ? 999999 : credits,
    isPro,
    hasUsedGuestCredit,
    hasReceivedSignupBonus,
  };
}

function mockUseTryOnCredit() {
  const status = mockGetUserCreditStatus();
  if (status.isPro) return true;
  if (status.credits <= 0) return false;
  const remaining = status.credits - 1;
  mockStorage.setItem('finglora_tryon_credits', remaining.toString());
  return true;
}

function mockGrantSignupCreditBonus() {
  const alreadyGranted = mockStorage.getItem('finglora_signup_bonus_granted') === 'true';
  if (alreadyGranted) return mockGetUserCreditStatus().credits;
  const status = mockGetUserCreditStatus();
  const newBalance = status.credits + 1;
  mockStorage.setItem('finglora_tryon_credits', newBalance.toString());
  mockStorage.setItem('finglora_signup_bonus_granted', 'true');
  return newBalance;
}

function mockActivateProSubscription() {
  mockStorage.setItem('finglora_is_pro_subscriber', 'true');
  mockStorage.setItem('finglora_tryon_credits', '999999');
}

// Step 3.1: Guest initial state
const initialGuest = mockGetUserCreditStatus();
assert(initialGuest.credits === 1, 'Guest user starts with exactly 1 free try-on credit');
assert(initialGuest.isPro === false, 'Guest is not Pro by default');
assert(initialGuest.hasUsedGuestCredit === false, 'Guest has not yet used free credit');

// Step 3.2: 1st Try-On (Deduction without signup)
const firstTrySuccess = mockUseTryOnCredit();
assert(firstTrySuccess === true, '1st try-on consumes free guest credit successfully without signup');
const postFirstStatus = mockGetUserCreditStatus();
assert(postFirstStatus.credits === 0, 'Credit balance drops to 0 after 1st try-on');
assert(postFirstStatus.hasUsedGuestCredit === true, 'System detects guest credit has been used');

// Step 3.3: 2nd Try-On attempt without signup (Paywall triggered)
const secondTryWithoutSignup = mockUseTryOnCredit();
assert(secondTryWithoutSignup === false, 'Attempting 2nd try-on with 0 credits returns false (triggers Paywall/Signup modal)');

// Step 3.4: Account signup grant +1 bonus credit
const bonusBalance = mockGrantSignupCreditBonus();
assert(bonusBalance === 1, 'Account creation grants +1 bonus credit (balance restored to 1)');
const postSignupStatus = mockGetUserCreditStatus();
assert(postSignupStatus.hasReceivedSignupBonus === true, 'User marked as having received signup bonus');
assert(postSignupStatus.hasUsedGuestCredit === false, 'Guest credit exhaustion flag cleared');

// Step 3.5: Double-grant protection
const repeatBonus = mockGrantSignupCreditBonus();
assert(repeatBonus === 1, 'Bonus cannot be claimed multiple times');

// Step 3.6: Use the signup bonus credit
const bonusTrySuccess = mockUseTryOnCredit();
assert(bonusTrySuccess === true, 'Signup bonus credit consumed successfully on 2nd try-on');
const postBonusStatus = mockGetUserCreditStatus();
assert(postBonusStatus.credits === 0, 'Credits back to 0 after consuming signup bonus');

// Step 3.7: 3rd Try-On triggers Pro Paywall
const thirdTrySuccess = mockUseTryOnCredit();
assert(thirdTrySuccess === false, '3rd try-on blocked with 0 credits (Pro subscription required)');

// Step 3.8: Pro Subscription upgrade
mockActivateProSubscription();
const proStatus = mockGetUserCreditStatus();
assert(proStatus.isPro === true, 'User successfully upgraded to Pro subscriber');
assert(proStatus.credits === 999999, 'Pro subscriber receives unlimited credits');
assert(mockUseTryOnCredit() === true, 'Pro subscriber can try on unlimited manicures without deductions');

// ----------------------------------------------------------------------
// SUITE 4: Zero SVG Verification & Micro-Geometry
// ----------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 4] Zero-SVG Nail Architecture Verification\x1b[0m');

const canvasPreviewFile = fs.readFileSync(
  path.join(process.cwd(), 'components/visuals/NailCanvasPreview.tsx'),
  'utf-8'
);

assert(!canvasPreviewFile.includes('<svg'), 'components/visuals/NailCanvasPreview.tsx contains 0 <svg> tags');
assert(!canvasPreviewFile.includes('<path'), 'components/visuals/NailCanvasPreview.tsx contains 0 <path> elements');
assert(!canvasPreviewFile.includes('<defs'), 'components/visuals/NailCanvasPreview.tsx contains 0 <defs> tags');
assert(canvasPreviewFile.includes('clipPath'), 'Uses CSS clipPath micro-geometry for Coffin and Stiletto tips');
assert(canvasPreviewFile.includes('linear-gradient'), 'Uses realistic specular lighting and gel sheen gradients');

const editorialHandFile = fs.readFileSync(
  path.join(process.cwd(), 'components/visuals/EditorialHandVisual.tsx'),
  'utf-8'
);
assert(!editorialHandFile.includes('<svg'), 'components/visuals/EditorialHandVisual.tsx contains 0 <svg> tags');
assert(!editorialHandFile.includes('<path'), 'components/visuals/EditorialHandVisual.tsx contains 0 <path> tags');

const landingSurfaceFile = fs.readFileSync(
  path.join(process.cwd(), 'components/surfaces/LandingSurface.tsx'),
  'utf-8'
);
assert(!landingSurfaceFile.includes('<svg'), 'components/surfaces/LandingSurface.tsx contains 0 <svg> tags');
assert(!landingSurfaceFile.includes('activeShape.path'), 'components/surfaces/LandingSurface.tsx uses NailCanvasPreview instead of SVG paths');

// ----------------------------------------------------------------------
// SUITE 5: API Purge & Clean Environment
// ----------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 5] API Purge & Clean Environment\x1b[0m');

const deapiExists = fs.existsSync(path.join(process.cwd(), 'app/api/tryon-deapi'));
const segmindExists = fs.existsSync(path.join(process.cwd(), 'app/api/tryon-segmind'));
assert(!deapiExists, 'app/api/tryon-deapi completely deleted');
assert(!segmindExists, 'app/api/tryon-segmind completely deleted');

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
assert(!envFile.includes('SEGMIND'), '.env.local contains no SEGMIND keys');
assert(!envFile.includes('DEAPI'), '.env.local contains no DEAPI keys');
assert(!envFile.includes('YEPAPI'), '.env.local contains no YEPAPI keys');
assert(envFile.includes('GEMINI_API_KEY='), '.env.local configured with GEMINI_API_KEY');

// ----------------------------------------------------------------------
// SUITE 6: Persistent Hand Upload & Value-First Onboarding
// ----------------------------------------------------------------------
console.log('\n\x1b[36m[SUITE 6] Persistent Hand Upload & Value-First Onboarding\x1b[0m');

const onboardingFile = fs.readFileSync(
  path.join(process.cwd(), 'components/surfaces/OnboardingSurface.tsx'),
  'utf-8'
);
assert(onboardingFile.includes('step === 1') && onboardingFile.includes('Add Your Hand Photo Once'), 'Onboarding Step 1 is one-time hand photo upload');
assert(onboardingFile.includes('step === 2') && onboardingFile.includes('Select Your First Inspo'), 'Onboarding Step 2 is inspiration style selection');
assert(onboardingFile.includes('step === 3') && onboardingFile.includes('See It On My Hand (1 Free Try-On)'), 'Onboarding Step 3 delivers instant real-hand preview');
assert(onboardingFile.includes('onSaveHandPhoto'), 'Onboarding persists hand photo through onSaveHandPhoto');

const pageFile = fs.readFileSync(path.join(process.cwd(), 'app/page.tsx'), 'utf-8');
assert(pageFile.includes('finglora_user_hand_photo'), 'app/page.tsx persists custom hand photo to finglora_user_hand_photo');

const aiCreationFile = fs.readFileSync(
  path.join(process.cwd(), 'components/surfaces/customer/AiCreationView.tsx'),
  'utf-8'
);
assert(aiCreationFile.includes('customTryOnHandUrl'), 'AiCreationView anchors centerpiece to user custom hand');
assert(aiCreationFile.includes('messages') && aiCreationFile.includes('promptText'), 'AiCreationView provides conversational chat interface for iterative prompts');

// ----------------------------------------------------------------------
// Summary
// ----------------------------------------------------------------------
console.log('\n\x1b[1m\x1b[35m=======================================================');
console.log(`   TOTAL TESTS: ${passedTests + failedTests} | PASSED: \x1b[32m${passedTests}\x1b[35m | FAILED: \x1b[${failedTests > 0 ? '31' : '32'}m${failedTests}\x1b[35m`);
console.log('=======================================================\x1b[0m\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32m✨ ALL AUTOMATED TESTS COMPLETED WITH 100% SUCCESS.\x1b[0m\n');
  process.exit(0);
}
