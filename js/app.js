// ═══════════════════════════════════════════════════════════════
//  SignBridge v3 — app.js
//  MediaPipe (JS only) for detection.  PHP for persistence.
// ═══════════════════════════════════════════════════════════════

'use strict';

/* ── API config ──────────────────────────────────────────────── */
const API = {
  analyze:        'api/analyze.php',
  login:          'api/login.php',
  register:       'api/register.php',
  logout:         'api/logout.php',
  profile:        'api/get_profile.php',
  progress:       'api/get_progress.php',
  saveQuiz:       'api/save_quiz.php',
  forgotPassword: 'api/forgot_password.php',
  resetPassword:  'api/reset_password.php',
  admin:          'api/dashboard.php',
};

/* ═══════════════════════════════════════════════════════════════
   DATA: Signs, Lessons, Quiz Questions
═══════════════════════════════════════════════════════════════ */

// Each letter has: word, steps[], img (URL to a reliable hand-sign image)
// Images from Wikimedia Commons ASL alphabet SVGs (public domain)
const IMG_BASE_ALPHA   = 'https://www.lifeprint.com/asl101/fingerspelling/images/';
const IMG_BASE_NUMBERS = 'https://www.lifeprint.com/asl101/gifs/numbers/';
const IMG_BASE_GENERAL = 'https://www.lifeprint.com/asl101/gifs/';

/**
 * Resolves the full URL for a sign instructional image
 */
function getImgUrl(signImg, category) {
  if (!signImg) return '';
  if (category === 'alphabet') return `${IMG_BASE_ALPHA}${signImg}`;
  if (category === 'numbers')  return `${IMG_BASE_NUMBERS}${signImg}`;
  
  // For most general signs, Lifeprint uses [first_letter]/[sign].gif
  const initial = signImg.charAt(0).toLowerCase();
  return `${IMG_BASE_GENERAL}${initial}/${signImg}`;
}

const ASL = {
  A:{word:'Apple',  img:'a.gif', steps:['Make a fist with your dominant hand','Rest your thumb against the side of your index finger','Hold it upright — knuckles face forward']},
  B:{word:'Ball',   img:'b.gif', steps:['Extend all four fingers straight up','Tuck your thumb tightly across your palm','Keep fingers together, palm facing out']},
  C:{word:'Cat',    img:'c.gif', steps:['Curve all fingers and thumb into a C shape','Imagine gripping a large cup','Palm faces to the side']},
  D:{word:'Dog',    img:'d.gif', steps:['Point index finger straight up','Curl middle, ring, pinky fingers to meet your thumb','Creates a circle between index tip and thumb']},
  E:{word:'Elephant',img:'e.gif',steps:['Bend all four fingers at the middle knuckle','Curl fingertips in toward your palm','Thumb tucks under the bent fingers']},
  F:{word:'Fish',   img:'f.gif', steps:['Touch the tip of your index finger to your thumb','Extend middle, ring and pinky fingers outward','Palm faces away from you']},
  G:{word:'Grape',  img:'g.gif', steps:['Point index finger horizontally to the side','Extend thumb parallel to it','Other fingers curl into the palm']},
  H:{word:'Hat',    img:'h.gif', steps:['Extend index and middle fingers together, pointing sideways','Other fingers curl into palm','Thumb rests on ring finger']},
  I:{word:'Igloo',  img:'i.gif', steps:['Raise just your pinky finger','Curl all other three fingers tightly into palm','Thumb can be tucked or resting on fingers']},
  J:{word:'Jungle', img:'j.gif', steps:['Start with the I handshape (pinky raised)','Trace a J-shape in the air with your pinky','Move wrist downward then hook to complete the J']},
  K:{word:'Kite',   img:'k.gif', steps:['Extend index and middle fingers in a V','Touch thumb to middle of middle finger','Point the V upward at a slight angle']},
  L:{word:'Lion',   img:'l.gif', steps:['Extend thumb and index finger at a 90° angle','Curl remaining three fingers into palm','Hold it up — looks like the letter L']},
  M:{word:'Monkey', img:'m.gif', steps:['Place your thumb under the first three fingers','Those three fingers drape down over the thumb','Pinky stays curled — different from N']},
  N:{word:'Night',  img:'n.gif', steps:['Tuck thumb under only the first two fingers','Index and middle fingers curl over the thumb','Ring and pinky stay curled separately']},
  O:{word:'Orange', img:'o.gif', steps:['Bring all five fingertips together to meet your thumb','Form a rounded O shape','The hole in the middle of your hand should be visible']},
  P:{word:'Purple', img:'p.gif', steps:['Start with a K handshape','Rotate your hand so it points downward','Index points down, middle curves under']},
  Q:{word:'Queen',  img:'q.gif', steps:['Form a G handshape (index pointing, thumb out)','Rotate it so it points downward toward the floor','Like drawing a letter Q pointing down']},
  R:{word:'Rainbow',img:'r.gif', steps:['Extend index and middle fingers upward','Cross your index finger over your middle finger','Keep other fingers curled — the cross = R']},
  S:{word:'Sun',    img:'s.gif', steps:['Make a tight fist','Wrap your thumb across the front of your curled fingers','Knuckles face forward — similar to A but thumb position differs']},
  T:{word:'Tree',   img:'t.gif', steps:['Place your thumb between index and middle fingers','Close all other fingers around the thumb','A fist with the thumb peeking between fingers']},
  U:{word:'Umbrella',img:'u.gif',steps:['Extend index and middle fingers straight up together','Keep them touching side-by-side','Other fingers and thumb curl in']},
  V:{word:'Victory',img:'v.gif', steps:['Extend index and middle fingers upward in a V','Spread them apart — peace sign style','Palm faces outward, away from you']},
  W:{word:'Water',  img:'w.gif', steps:['Extend index, middle and ring fingers upward','Spread them into a W shape','Thumb and pinky curl in']},
  X:{word:'X-ray',  img:'x.gif', steps:['Extend only your index finger','Bend it into a hooked shape','Like beckoning someone to come here']},
  Y:{word:'Yellow', img:'y.gif', steps:['Extend thumb and pinky finger outward','Curl your other three fingers in','Looks like a "hang loose" or shaka sign']},
  Z:{word:'Zebra',  img:'z.gif', steps:['Point your index finger forward','Trace a Z-shape in the air','Three strokes: right, diagonal down-left, right again']},
};

// Greetings, Numbers, Common Phrases, Emergency — each as sign objects
const EXTRA_SIGNS = {
  greetings: [
    {id:'hello',     label:'Hello',      img:'hello.gif',    desc:'Open hand, fingers together, wave palm outward from forehead.',   steps:['Hold your dominant hand flat, fingers together','Touch fingertips to your forehead or temple','Move hand outward and slightly downward in a wave']},
    {id:'goodbye',   label:'Goodbye',    img:'goodbye.gif',  desc:'Wave open hand side-to-side, palm facing out.',                   steps:['Hold open hand up, palm facing outward','Wave fingers side to side','Keep wrist loose for natural movement']},
    {id:'thank_you', label:'Thank You',  img:'thankyou.gif', desc:'Flat hand moves from chin outward and down.',                     steps:['Hold dominant hand flat near your chin','Move hand outward and slightly downward','Keep fingers together and palm up']},
    {id:'please',    label:'Please',     img:'please.gif',   desc:'Open hand, palm inward, rubs circular motion on chest.',          steps:['Place open palm flat against your chest','Rub in a circular motion','Keep a gentle, natural movement']},
    {id:'sorry',     label:'Sorry',      img:'sorry.gif',    desc:'Fist circles on chest in an apologetic motion.',                  steps:['Make a fist with your dominant hand','Place fist on your chest','Rub in a slow circular motion']},
    {id:'yes',       label:'Yes',        img:'yes.gif',      desc:'Fist nods up and down like a head nodding yes.',                  steps:['Make a fist with your dominant hand','Move it up and down at the wrist','Like your fist is nodding yes']},
    {id:'no',        label:'No',         img:'no.gif',       desc:'Index and middle fingers tap thumb repeatedly.',                  steps:['Extend index and middle fingers together','Bring them down to tap your thumb','Snap motion at the wrist — two or three times']},
    {id:'nice_meet', label:'Nice to Meet',img:'nice-to-meet-you.gif',desc:'One hand moves over the other in a smooth gesture.',            steps:['Hold both hands out, palms facing each other','Dominant hand moves over back of other hand','Smooth forward motion']},
    {id:'how_are',   label:'How Are You',img:'how-are-you.gif',desc:'Both hands move forward toward person being asked.',              steps:['Hold both bent hands up, palms facing you','Move both hands forward together','Expression matters — raised eyebrows for question']},
    {id:'my_name',   label:'My Name Is', img:'name.gif',     desc:'Two-finger tap on back of opposite hand to spell N-A-M-E.',      steps:['Hold non-dominant hand flat, palm down','Tap index and middle fingers on back of that hand twice','Follow by fingerspelling your name']},
  ],
  numbers: [
    {id:'one',   label:'1', img:'01.gif', desc:'Index finger points straight up, palm facing out.',    steps:['Hold up only your index finger','Keep it pointing straight up','All other fingers and thumb curl in']},
    {id:'two',   label:'2', img:'02.gif', desc:'Index and middle fingers up in a V, palm out.',        steps:['Extend index and middle fingers up','Spread them slightly apart','Palm faces away from you']},
    {id:'three', label:'3', img:'03.gif', desc:'Thumb, index, middle extended — palm out.',             steps:['Extend thumb, index finger, and middle finger','Curl ring and pinky fingers in','Palm faces outward']},
    {id:'four',  label:'4', img:'04.gif', desc:'Four fingers up, thumb tucked, palm out.',             steps:['Extend all four fingers upward','Tuck thumb tightly across palm','Palm faces outward']},
    {id:'five',  label:'5', img:'05.gif', desc:'All five fingers spread open, palm out.',              steps:['Spread all five fingers wide open','Palm facing outward','Natural open-hand position']},
    {id:'six',   label:'6', img:'06.gif', desc:'Pinky and thumb touch, other fingers extended.',       steps:['Extend index, middle, and ring fingers upward','Bring pinky down to touch thumb','Palm faces outward']},
    {id:'seven', label:'7', img:'07.gif', desc:'Ring finger and thumb touch, others extended.',        steps:['Extend index, middle, and pinky fingers up','Bring ring finger down to touch thumb','Palm faces outward']},
    {id:'eight', label:'8', img:'08.gif', desc:'Middle finger and thumb touch, others extended.',      steps:['Extend index, ring, and pinky fingers upward','Bring middle finger down to touch thumb','Palm faces outward']},
    {id:'nine',  label:'9', img:'09.gif', desc:'Index finger and thumb touch (like OK sign).',         steps:['Touch tip of index finger to your thumb','Extend middle, ring, and pinky fingers up','Palm facing outward']},
    {id:'ten',   label:'10', img:'10.gif', desc:'Thumbs up with shake/wiggle.',                        steps:['Make a thumbs-up sign','Shake wrist slightly side to side','Just one hand needed']},
  ],
  phrases: [
    {id:'help',      label:'Help',        img:'help.gif',      desc:'Thumbs-up hand lifts from flat palm of other hand.',          steps:['Hold non-dominant hand flat, palm up','Place dominant hand fist (thumbs up) on it','Lift both hands upward together']},
    {id:'understand',label:'Understand',  img:'understand.gif', desc:'Index finger flicks upward from temple area.',                 steps:['Point index finger at temple','Flick it upward quickly','Like a lightbulb going on in your head']},
    {id:'repeat',    label:'Repeat/Again',img:'again.gif',      desc:'Bent hand taps flat palm of other hand.',                     steps:['Hold non-dominant hand flat, palm up','Curl dominant hand fingers','Tap curled fingertips against palm']},
    {id:'slow',      label:'Slow Down',   img:'slow.gif',      desc:'Dominant hand strokes slowly up back of other arm.',          steps:['Hold non-dominant arm out, palm down','Stroke dominant hand slowly from wrist to elbow','Slow deliberate motion']},
    {id:'bathroom',  label:'Bathroom',    img:'bathroom.gif',  desc:'Letter T shaken at wrist side to side.',                      steps:['Make the T handshape','Shake your wrist from side to side','This is the universal sign for "bathroom"']},
    {id:'water2',    label:'Water',       img:'water.gif',     desc:'W handshape taps chin twice.',                                 steps:['Form the letter W handshape','Tap your chin twice with the W','Front of chin, two light taps']},
    {id:'food',      label:'Food/Eat',    img:'eat.gif',       desc:'Fingertips and thumb touch, move toward mouth.',              steps:['Bring fingertips and thumb together','Move the bundled fingers toward your mouth','As if bringing food to eat']},
    {id:'love',      label:'Love',        img:'love.gif',      desc:'Cross both arms over chest, fists closed.',                   steps:['Cross your arms over your chest','Both hands in fists','Hug yourself — the sign for love/I love you']},
    {id:'family',    label:'Family',      img:'family.gif',    desc:'F handshape on both hands, circle outward.',                  steps:['Form F with both hands','Hold them facing each other','Circle both hands outward until pinky sides touch']},
  ],
};

// Lessons definition — ordered, with unlock dependencies
const LESSONS = [
  { id:0, title:'Alphabet A–M',      desc:'First 13 letters of ASL',                     icon:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-spell-check-2"><path d="m6 16 6-12 6 12"/><path d="M8 12h8"/><path d="M4 21c1.1 0 1.1-1 2.1-1s1.1 1 2.1 1 1.1-1 2.1-1 1.1 1 2.1 1 1.1-1 2.1-1 1.1 1 2.1 1"/></svg>', color:'#6ee7b7', category:'alphabet',  items: 'ABCDEFGHIJKLM'.split(''), unlocks:[],    quizCount:5 },
  { id:1, title:'Alphabet N–Z',      desc:'Complete the ASL alphabet',                   icon:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alphabet"><path d="M12 11h.01"/><path d="M16 11h.01"/><path d="M16 15h.01"/><path d="M8 11h.01"/><path d="M8 15h.01"/><path d="M4 11h.01"/><path d="M4 15h.01"/><path d="M20 11h.01"/><path d="M20 15h.01"/><path d="M5 2c0 1.1.9 2 2 2s2-.9 2-2"/><path d="M5 22c0-1.1.9-2 2-2s2 .9 2 2"/><path d="M15 2c0 1.1.9 2 2 2s2-.9 2-2"/><path d="M15 22c0-1.1.9-2 2-2s2 .9 2 2"/><path d="M2 13h20"/><path d="M2 17h20"/><path d="M2 5h20"/><path d="M2 9h20"/></svg>', icon_fallback:'🔤', color:'#818cf8', category:'alphabet',  items: 'NOPQRSTUVWXYZ'.split(''), unlocks:[0],   quizCount:5 },
  { id:2, title:'Numbers 1–10',      desc:'Count from one to ten in ASL',                icon:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-binary"><rect width="8" height="12" x="2" y="10" rx="1"/><path d="M14 14h2"/><path d="M22 17h-1"/><path d="M12 2h8"/><path d="M12 6h8"/><path d="M12 10h8"/><path d="M12 14h8"/><rect width="8" height="12" x="2" y="10" rx="1"/><path d="M7 2h3.1"/><path d="m7 6 3 3"/><path d="m7 14 3-3"/></svg>', color:'#fbbf24', category:'numbers',   items: EXTRA_SIGNS.numbers,      unlocks:[1],   quizCount:5 },
  { id:3, title:'Common Phrases',    desc:'Everyday useful expressions',                 icon:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-text"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/></svg>', color:'#f87171', category:'phrases',   items: EXTRA_SIGNS.phrases,      unlocks:[2],   quizCount:5 },
];

/* ═══════════════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════════════ */
let currentUser     = null;
let lessonProgress  = {};    // { lessonId: { completed, score } }
let masteredSigns   = [];    // Array of {id, category}
let completedAlphabets = []; // Deprecated but kept for compatibility
let currentLesson   = 0;
let currentSignIdx  = 0;

// Quiz state
let quizLessonId    = 0;
let quizQuestions   = [];
let quizCurrent     = 0;
let quizAnswered    = false;
let quizResults     = [];

// Practice state
let targetLetterIdx  = 0;
let practiceMode     = 'alphabet';
let currentWord      = 'HELLO';
let currentLetterIdx = 0;
const WORDS = ['HELLO','LOVE','SIGN','LEARN','GREAT','ASL'];
let sessionStats     = { correct:0, wrong:0, streak:0 };

// MediaPipe state
let mpHands      = null;
let mpCamera     = null;
let liveDetect   = false;
let overlayCanvas= null;
let overlayCtx   = null;
let lastLandmarks= null;

/* ═══════════════════════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════════════════════ */

function showToast(msg, type='success', duration=3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'show ' + type;
  setTimeout(() => { t.className = ''; }, duration);
}

function $(id) { return document.getElementById(id); }

function signImg(src, alt, category, cls='') {
  if (!src) return `<div class="sign-img-placeholder ${cls}" title="${alt}"><span>${alt.charAt(0)}</span></div>`;
  const fullUrl = getImgUrl(src, category);
  return `<img src="${fullUrl}" alt="${alt}" class="${cls}" onerror="this.outerHTML='<div class=sign-img-ph>${alt}</div>'">`;
}

function getSignForItem(lessonId, item) {
  const lesson = LESSONS[lessonId];
  if (lesson.category === 'alphabet') {
    return ASL[item] || null;
  }
  return item; // already an object
}

/* ═══════════════════════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════════════════════ */

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const pg = $('page-' + id);
  if (pg) pg.classList.add('active');

  // Hide/Show Hero based on Auth + Page
  const hero = document.querySelector('.hero');
  if (hero) {
    if (id === 'home' && !currentUser) {
      hero.style.display = 'block';
    } else {
      hero.style.display = 'none';
    }
  }

  const tabMap = {
    'home': 0, 'learn': 1, 'practice': 2, 'profile': 3, 'admin': 4
  };
  const idx = tabMap[id];
  if (idx !== undefined) {
    document.querySelectorAll('.nav-tab')[idx]?.classList.add('active');
  }

  if (id === 'learn')    renderLearn();
  if (id === 'practice') { 
    setTimeout(initMediaPipe, 300); 
    renderPracticeTarget(); 
    setPracticeMode(practiceMode); // Ensure UI syncs
  }
  if (id === 'profile')  loadProfile();
  if (id === 'admin')    loadAdmin();
  window.scrollTo(0, 0);
}

/* ═══════════════════════════════════════════════════════════════
   AUTH  — Fixed toggle + forgot password
═══════════════════════════════════════════════════════════════ */

// Tab switching — this was the broken logic, now properly fixed
function openAuthModal(tab) {
  tab = tab || 'login';
  const modal = $('auth-modal');
  if (modal) {
    modal.classList.add('open');
    switchAuthTab(tab);
  }
}

function closeAuthModal() {
  const modal = $('auth-modal');
  if (modal) modal.classList.remove('open');
  // Reset to login tab when closing
  switchAuthTab('login');
}

function switchAuthTab(tab) {
  // Hide all panels
  const panels = ['auth-panel-login','auth-panel-register','auth-panel-forgot','auth-panel-reset'];
  panels.forEach(id => { const el=$(id); if(el) el.style.display='none'; });

  // Show selected panel
  const target = $('auth-panel-' + tab);
  if (target) target.style.display = 'block';

  // Update tab button states (only login/register have tab buttons)
  document.querySelectorAll('.auth-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function showForgotPassword() { switchAuthTab('forgot'); }
function backToLogin()        { switchAuthTab('login');  }

async function doLogin() {
  const email = $('li-email')?.value.trim();
  const pass  = $('li-pass')?.value;
  const err   = $('li-err');
  if (err) err.textContent = '';

  if (!email || !pass) { if(err) err.textContent = 'Please enter email and password.'; return; }

  try {
    const r = await fetch(API.login, {
      method:'POST', headers:{'Content-Type':'application/json'},
      credentials:'include', body: JSON.stringify({email, password:pass})
    });
    const d = await r.json();
    if (!d.success) { if(err) err.textContent = d.error; return; }
    currentUser = d;
    applyUserToUI();
    closeAuthModal();
    showToast('Welcome back, ' + d.name + '!');
    loadProgress();
  } catch(e) {
    if(err) err.textContent = 'Connection error. Is XAMPP running?';
  }
}

async function doRegister() {
  const name  = $('rg-name')?.value.trim();
  const email = $('rg-email')?.value.trim();
  const pass  = $('rg-pass')?.value;
  const err   = $('rg-err');
  if(err) err.textContent = '';

  try {
    const r = await fetch(API.register, {
      method:'POST', headers:{'Content-Type':'application/json'},
      credentials:'include', body: JSON.stringify({name, email, password:pass})
    });
    const d = await r.json();
    if (!d.success) { if(err) err.textContent = d.error; return; }
    currentUser = d;
    applyUserToUI();
    closeAuthModal();
    showToast('Account created! Welcome, ' + d.name + '!');
  } catch(e) {
    if(err) err.textContent = 'Connection error. Is XAMPP running?';
  }
}

async function doForgotPassword() {
  const email = $('fp-email')?.value.trim();
  const msg   = $('fp-msg');
  if(msg) msg.textContent = '';

  if (!email) { if(msg) msg.textContent = 'Please enter your email address.'; return; }

  try {
    const r = await fetch(API.forgotPassword, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email})
    });
    const d = await r.json();
    if (d.success) {
      if(msg) {
        msg.style.color = 'var(--accent)';
        if (d.token) {
          // Demo mode — show token directly
          msg.innerHTML = `Reset token generated! (Demo mode)<br><br>
            <input value="${d.token}" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--text);font-size:0.8rem;font-family:monospace" readonly onclick="this.select()">
            <br><button class="form-link" onclick="prefillReset('${d.token}')">→ Use this token to reset password</button>`;
        } else {
          msg.textContent = 'If that email exists, reset instructions have been sent. Check your inbox!';
          setTimeout(() => switchAuthTab('reset'), 2500);
        }
      }
    } else {
      if(msg) { msg.style.color='var(--danger)'; msg.textContent = d.error; }
    }
  } catch(e) {
    if(msg) msg.textContent = 'Connection error.';
  }
}

function prefillReset(token) {
  switchAuthTab('reset');
  const el = $('rs-token');
  if (el) el.value = token;
}

async function doResetPassword() {
  const token = $('rs-token')?.value.trim();
  const pass  = $('rs-pass')?.value;
  const msg   = $('rs-msg');
  if(msg) msg.textContent = '';

  if (!token || !pass) { if(msg) msg.textContent = 'Token and new password required.'; return; }

  try {
    const r = await fetch(API.resetPassword, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({token, password:pass})
    });
    const d = await r.json();
    if (d.success) {
      if(msg) { msg.style.color='var(--accent)'; msg.textContent = 'Password updated! You can now log in.'; }
      setTimeout(() => switchAuthTab('login'), 2000);
    } else {
      if(msg) { msg.style.color='var(--danger)'; msg.textContent = d.error; }
    }
  } catch(e) {
    if(msg) msg.textContent = 'Connection error.';
  }
}

async function doLogout() {
  await fetch(API.logout, {method:'POST', credentials:'include'});
  currentUser   = null;
  lessonProgress= {};
  const logoutBtn = $('btn-logout');
  const loginBtn  = $('btn-login-nav');
  if(logoutBtn) logoutBtn.style.display = 'none';
  if(loginBtn)  loginBtn.style.display  = 'inline-flex';
  if($('nav-level'))  $('nav-level').textContent  = '—';
  if($('nav-streak')) $('nav-streak').textContent = '0';
  if($('nav-admin'))  $('nav-admin').style.display = 'none';
  showToast('Logged out.', 'success');
  showPage('home');
}

async function checkAuth() {
  try {
    const r = await fetch(API.profile, {credentials:'include'});
    const d = await r.json();
    if (d.success) {
      currentUser = d.user;
      applyUserToUI();
      loadProgress();
      return true;
    }
  } catch(e) {}
  return false;
}

function applyUserToUI() {
  if (!currentUser) return;
  const isAdmin = currentUser.role === 'admin';

  // Hide XP/streak/level for admins
  if (isAdmin) {
    if($('nav-level'))  $('nav-level').style.display  = 'none';
    if($('nav-streak')) document.querySelector('.streak').style.display = 'none';
  } else {
    if($('nav-level'))  { $('nav-level').style.display = ''; $('nav-level').textContent = `Lv ${currentUser.level}`; }
    if($('nav-streak')) { document.querySelector('.streak').style.display = ''; $('nav-streak').textContent = currentUser.streak || 0; }
  }
  
  const logoutBtn = $('btn-logout');
  const loginBtn  = $('btn-login-nav');
  if(logoutBtn) logoutBtn.style.display = 'inline-flex';
  if(loginBtn)  loginBtn.style.display  = 'none';

  // Enable pfp in navbar
  const navPfp = $('nav-pfp');
  if (navPfp) navPfp.style.display = 'flex';

  // Profile Picture Rendering
  const pfpEls = document.querySelectorAll('.avatar');
  pfpEls.forEach(el => {
    if (currentUser.pfp_path) {
      el.innerHTML = `<img src="${currentUser.pfp_path}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      const initials = currentUser.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);
      el.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--accent);color:white;border-radius:50%;font-weight:700">${initials || '?'}</div>`;
    }
  });

  // Role-based Nav Isolation & Admin Redirection
  const adminTab = $('nav-admin');
  if (adminTab) adminTab.style.display = isAdmin ? 'inline-flex' : 'none';

  // Hide learner tabs for admins, hide profile tab for admins
  const learnerTabs = ['home', 'learn', 'practice', 'profile'].map(id => document.querySelector(`.nav-tab[onclick*="showPage('${id}')"]`));
  learnerTabs.forEach(tab => {
    if (tab) {
      tab.style.display = isAdmin ? 'none' : 'inline-flex';
    }
  });

  // Auto-redirect admin to dashboard
  if (isAdmin) {
     showPage('admin');
  }
}

async function uploadPfp(input) {
  if (!input.files || !input.files[0]) return;
  const formData = new FormData();
  formData.append('pfp', input.files[0]);

  try {
    const r = await fetch('api/upload_pfp.php', {
      method: 'POST',
      body: formData
    });
    const d = await r.json();
    if (d.success) {
      currentUser.pfp_path = d.pfp_path;
      applyUserToUI();
      showToast('Profile picture updated!');
    } else {
      showToast(d.error || 'Upload failed', 'error');
    }
  } catch(e) {
    showToast('Failed to connect to server', 'error');
  }
}

async function loadProgress() {
  if (!currentUser) return;
  try {
    const r = await fetch(API.progress, {credentials:'include'});
    const d = await r.json();
    if (d.success) {
      lessonProgress = d.progress;
      masteredSigns  = d.mastered_signs || [];
      // Backward compatibility
      completedAlphabets = masteredSigns.filter(s=>s.category==='alphabet').map(s=>s.id);
    }
    renderLearnSidebar(); // update lock states
    buildAlphaGrid();
    buildExtraGrids();
    buildHomeTracks();
  } catch(e) {}
}

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════════ */

function buildHome() {
  buildAlphaGrid();
  buildExtraGrids();
  buildHomeTracks();
}

function buildAlphaGrid() {
  const grid = $('alpha-grid');
  if (!grid) return;
  grid.innerHTML = '';
  Object.keys(ASL).forEach((letter, i) => {
    const isMastered = masteredSigns.some(s => s.id === letter && s.category === 'alphabet');
    const card = document.createElement('div');
    card.className = 'alpha-card' + (isMastered ? ' completed' : '');
    card.innerHTML = `
      ${isMastered ? '<span class="check" title="Mastered (3+ correct)">✓</span>' : ''}
      <div class="letter">${letter}</div>
      <img src="${getImgUrl(ASL[letter].img, 'alphabet')}" alt="${letter}" class="sign-img"
           onerror="this.style.display='none'">
      <div class="word-hint">${ASL[letter].word}</div>`;
    card.onclick = () => { practiceMode='alphabet'; targetLetterIdx=i; showPage('practice'); setTarget(targetLetterIdx); };
    grid.appendChild(card);
  });
}

function buildExtraGrids() {
  const numGrid = $('numbers-grid');
  if (numGrid) {
    numGrid.innerHTML = '';
    EXTRA_SIGNS.numbers.forEach((item, i) => {
      const isMastered = masteredSigns.some(s => s.id === item.id && s.category === 'numbers');
      const card = document.createElement('div');
      card.className = 'alpha-card' + (isMastered ? ' completed' : '');
      card.innerHTML = `
        ${isMastered ? '<span class="check" title="Mastered">✓</span>' : ''}
        <div class="letter">${item.label}</div>
        <img src="${getImgUrl(item.img, 'numbers')}" alt="${item.label}" class="sign-img" onerror="this.style.display='none'">
      `;
      card.onclick = () => { practiceMode='numbers'; targetLetterIdx=i; showPage('practice'); setTarget(targetLetterIdx); };
      numGrid.appendChild(card);
    });
  }

  const phrGrid = $('phrases-grid');
  if (phrGrid) {
    phrGrid.innerHTML = '';
    EXTRA_SIGNS.phrases.forEach((item, i) => {
      const isMastered = masteredSigns.some(s => s.id === item.id && s.category === 'phrases');
      const card = document.createElement('div');
      card.className = 'alpha-card' + (isMastered ? ' completed' : '');
      card.innerHTML = `
        ${isMastered ? '<span class="check" title="Mastered">✓</span>' : ''}
        <div class="letter">${item.label}</div>
        <img src="${getImgUrl(item.img, 'phrases')}" alt="${item.label}" class="sign-img" onerror="this.style.display='none'">
      `;
      card.onclick = () => { practiceMode='phrases'; targetLetterIdx=i; showPage('practice'); setTarget(targetLetterIdx); };
      phrGrid.appendChild(card);
    });
  }
}

function buildHomeTracks() {
  const grid = $('track-grid');
  if (!grid) return;
  grid.className = 'track-timeline';
  grid.innerHTML = '';
  LESSONS.forEach((lesson, i) => {
    const unlocked = isLessonUnlocked(lesson.id);
    const prog     = lessonProgress[lesson.id];
    const pct      = prog ? (prog.completed ? 100 : Math.min(99, prog.score)) : 0;
    const completed = prog?.completed;
    
    // Check if ALL signs in this lesson are mastered
    const lessonItems = Array.isArray(lesson.items) ? lesson.items : [];
    const masteredAll = lessonItems.length > 0 && lessonItems.every(item => {
        const signId = (typeof item === 'string') ? item : item.id;
        return masteredSigns.some(s => s.id === signId && s.category === lesson.category);
    });

    const isDone = completed || masteredAll;

    const div = document.createElement('div');
    div.className = 'timeline-node' + (unlocked ? ' unlocked' : '') + (isDone ? ' completed' : '');
    div.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="track-card ${!unlocked ? 'locked' : ''}">
        ${!unlocked ? '<span class="lock-badge">🔒 Locked</span>' : ''}
        <div class="track-icon">${lesson.icon}</div>
        <div class="track-info">
          <div class="track-name">${lesson.title}</div>
          <div class="track-count">${lessonItems.length} signs</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          ${isDone ? '<div style="margin-top:6px"><span class="badge badge-green">Mastered ✓</span></div>' : ''}
        </div>
      </div>
    `;
    if (unlocked) {
      div.querySelector('.track-card').onclick = () => { currentLesson = i; showPage('learn'); };
    }
    grid.appendChild(div);
  });
}

function isLessonUnlocked(lessonId) {
  const lesson = LESSONS[lessonId];
  if (!lesson.unlocks || lesson.unlocks.length === 0) return true;
  return lesson.unlocks.every(depId => {
    // Unlock if lesson_progress says completed OR all signs mastered
    if (lessonProgress[depId]?.completed) return true;
    const depLesson = LESSONS[depId];
    const depItems = Array.isArray(depLesson.items) ? depLesson.items : [];
    return depItems.length > 0 && depItems.every(item => {
      const signId = (typeof item === 'string') ? item : item.id;
      return masteredSigns.some(s => s.id === signId && s.category === depLesson.category);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   LEARN PAGE
═══════════════════════════════════════════════════════════════ */

function renderLearn() {
  renderLearnSidebar();
  renderLessonContent(currentLesson);
}

function renderLearnSidebar() {
  const list = $('lesson-list');
  if (!list) return;
  list.innerHTML = '';
  LESSONS.forEach((lesson, i) => {
    const unlocked  = isLessonUnlocked(lesson.id);
    const prog      = lessonProgress[lesson.id];
    const completed = prog?.completed;

    // Check mastery per-sign in this lesson
    const lessonItems = Array.isArray(lesson.items) ? lesson.items : [];
    let masteredCount = 0;
    lessonItems.forEach(item => {
        const signId = (typeof item === 'string') ? item : item.id;
        if (masteredSigns.some(s => s.id === signId && s.category === lesson.category)) masteredCount++;
    });
    const masteredAll = lessonItems.length > 0 && masteredCount === lessonItems.length;
    const isDone = completed || masteredAll;
    const pct = isDone ? 100 : (lessonItems.length > 0 ? Math.round(masteredCount / lessonItems.length * 100) : 0);

    const item = document.createElement('div');
    item.className = 'lesson-item'
      + (i === currentLesson ? ' active' : '')
      + (isDone ? ' completed' : '')
      + (!unlocked ? ' locked' : '');
    item.innerHTML = `
      <div class="lesson-icon" style="background:${lesson.color}22">${lesson.icon}</div>
      <div class="lesson-info">
        <div class="lesson-name">${lesson.title}</div>
        <div class="lesson-desc">${lesson.desc}</div>
        <div class="progress-bar" style="margin-top:6px;height:4px"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div style="font-size:0.65rem;color:var(--muted);margin-top:2px">${masteredCount}/${lessonItems.length} signs${isDone ? ' · Mastered ✓' : ''}</div>
      </div>
      <div class="lesson-status">
        ${isDone ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>' : 
          !unlocked ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' : ''}
      </div>`;
    if (unlocked) {
      item.onclick = () => { currentLesson = i; currentSignIdx = 0; renderLearn(); };
    }
    list.appendChild(item);
  });
}

function renderLessonContent(lessonId) {
  const el = $('lesson-content');
  if (!el) return;

  const lesson   = LESSONS[lessonId];
  const unlocked = isLessonUnlocked(lessonId);
  if (!unlocked) {
    el.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem">
        <div style="font-size:3rem;margin-bottom:1rem">🔒</div>
        <div class="section-title">Lesson Locked</div>
        <p style="color:var(--muted);margin-top:0.5rem">Complete the required previous lessons to unlock this one.</p>
        <div style="margin-top:1rem;color:var(--muted);font-size:0.88rem">Requires: ${lesson.unlocks.map(id=>LESSONS[id].title).join(', ')}</div>
      </div>`;
    return;
  }

  const prog = lessonProgress[lessonId];

  // Calculate mastery for this lesson
  const lItems = Array.isArray(lesson.items) ? lesson.items : [];
  let mCount = 0;
  lItems.forEach(item => {
    const sid = (typeof item === 'string') ? item : item.id;
    if (masteredSigns.some(s => s.id === sid && s.category === lesson.category)) mCount++;
  });
  const allMastered = lItems.length > 0 && mCount === lItems.length;
  const isDone = prog?.completed || allMastered;
  const pct = isDone ? 100 : (lItems.length > 0 ? Math.round(mCount / lItems.length * 100) : 0);

  el.innerHTML = `
    <div class="fade-in">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:1.5rem">
        <div>
          <h2 style="font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800">${lesson.title}</h2>
          <p style="color:var(--muted);font-size:0.9rem;margin-top:4px">${lesson.desc}</p>
          <div class="progress-bar" style="margin-top:8px;height:6px;max-width:300px"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div style="font-size:0.75rem;color:var(--muted);margin-top:4px">${mCount}/${lItems.length} signs mastered${isDone ? ' · Lesson Complete ✓' : ''}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          ${isDone ? '<span class="badge badge-green" style="font-size:0.85rem;padding:6px 14px">Completed ✓</span>' : ''}
          ${prog?.score > 0 ? `<span class="badge badge-purple">Best: ${prog.score}%</span>` : ''}
          <button class="btn-primary" onclick="startQuiz(${lessonId})" style="font-size:0.85rem;padding:8px 18px">📝 Take Quiz</button>
        </div>
      </div>

      ${allMastered && !prog?.completed ? `
        <div style="background:rgba(110,231,183,0.1);border:1px solid rgba(110,231,183,0.3);border-radius:var(--r-md);padding:1rem 1.25rem;margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-weight:700;color:var(--accent)">🎉 All signs mastered!</div>
            <div style="font-size:0.82rem;color:var(--muted)">Take the quiz to complete this lesson and unlock the next one.</div>
          </div>
          <button class="btn-primary" onclick="startQuiz(${lessonId})" style="font-size:0.85rem;padding:8px 18px">Take Quiz Now →</button>
        </div>` : ''}

      <div class="sign-cards-grid" id="sign-cards-grid"></div>

      <div id="sign-detail" style="margin-top:1rem"></div>
    </div>`;

  buildSignCards(lesson);
  showSignDetail(lesson, 0);
}

function buildSignCards(lesson) {
  const grid = $('sign-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  lesson.items.forEach((item, i) => {
    const sign = getSignForItem(lesson.id, item);
    const signId = (typeof item === 'string') ? item : item.id;
    const isMastered = masteredSigns.some(s => s.id === signId && s.category === lesson.category);
    
    const letter = lesson.category === 'alphabet' ? item : sign.label;
    const word   = lesson.category === 'alphabet' ? sign.word : sign.label;
    const imgSrc = getImgUrl(sign.img, lesson.category);

    const card = document.createElement('div');
    card.className = 'sign-card' + (i === currentSignIdx ? ' active' : '') + (isMastered ? ' mastered' : '');
    card.id = `sc-${i}`;
    card.innerHTML = `
      ${imgSrc
        ? `<img src="${imgSrc}" alt="${letter}" class="sign-card-img" onerror="this.style.display='none'">`
        : `<div style="width:70px;height:70px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 8px">${lesson.icon}</div>`}
      <div class="sign-card-letter">${letter}</div>
      ${isMastered ? '<div class="card-mastery-badge">✓</div>' : ''}
      <div class="sign-card-word">${lesson.category === 'alphabet' ? word : ''}</div>`;
    card.onclick = () => {
      currentSignIdx = i;
      document.querySelectorAll('.sign-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      showSignDetail(lesson, i);
    };
    grid.appendChild(card);
  });
}

function showSignDetail(lesson, idx) {
  const el     = $('sign-detail');
  if (!el) return;
  const item   = lesson.items[idx];
  const sign   = getSignForItem(lesson.id, item);
  const signId = (typeof item === 'string') ? item : item.id;
  const letter = lesson.category === 'alphabet' ? item : sign.label;
  const word   = lesson.category === 'alphabet' ? sign.word : '';
  const desc   = lesson.category === 'alphabet' ? 'ASL Fingerspelling' : (sign.desc || '');
  const steps  = sign.steps || [];
  const imgSrc = getImgUrl(sign.img, lesson.category);

  el.innerHTML = `
    <div class="sign-detail-area">
      ${imgSrc
        ? `<img src="${imgSrc}" alt="${letter}" class="sign-detail-img" onerror="this.style.display='none'">`
        : `<div class="sign-detail-img" style="display:flex;align-items:center;justify-content:center;font-size:3rem">${lesson.icon}</div>`}
      <div class="sign-detail-info">
        <div class="sign-detail-name">${letter}${word ? ' — ' + word : ''}</div>
        <div class="sign-detail-sub">${desc}</div>
        <div class="steps-list">
          ${steps.map((s,i) => `<div class="step-item"><div class="step-num">${i+1}</div><div class="step-text">${s}</div></div>`).join('')}
        </div>
        <button class="btn-primary" style="margin-top:1rem;font-size:0.85rem;padding:8px 18px"
          onclick="goToPractice('${signId}', '${lesson.category}')">Practice this sign →</button>
      </div>
    </div>`;
}

function goToPractice(signId, category) {
  if (category === 'numbers') {
    practiceMode = 'numbers';
    targetLetterIdx = Math.max(0, EXTRA_SIGNS.numbers.findIndex(s => s.id === signId));
  } else if (category === 'phrases') {
    practiceMode = 'phrases';
    targetLetterIdx = Math.max(0, EXTRA_SIGNS.phrases.findIndex(s => s.id === signId));
  } else {
    practiceMode = 'alphabet';
    targetLetterIdx = Math.max(0, Object.keys(ASL).indexOf(signId));
  }
  
  // Update select if it exists
  const modeSelect = $('practice-mode');
  if (modeSelect) {
      if (!Array.from(modeSelect.options).some(o => o.value === practiceMode)) {
          modeSelect.add(new Option(practiceMode.charAt(0).toUpperCase() + practiceMode.slice(1), practiceMode));
      }
      modeSelect.value = practiceMode;
  }

  showPage('practice');
  setTarget(targetLetterIdx);
}

/* ═══════════════════════════════════════════════════════════════
   QUIZ SYSTEM
═══════════════════════════════════════════════════════════════ */

function startQuiz(lessonId) {
  quizLessonId  = lessonId;
  quizResults   = [];
  quizCurrent   = 0;
  quizAnswered  = false;
  quizQuestions = buildQuizQuestions(lessonId);

  const el = $('lesson-content');
  if (!el) return;

  el.innerHTML = `
    <div class="fade-in">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:1.5rem">
        <button onclick="renderLessonContent(${lessonId})" class="btn-secondary" style="padding:7px 14px;font-size:0.82rem">← Back</button>
        <h2 style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800">${LESSONS[lessonId].title} — Quiz</h2>
      </div>
      <div class="quiz-wrap">
        <div class="quiz-progress-bar"><div class="quiz-progress-fill" id="q-prog" style="width:0%"></div></div>
        <div id="quiz-body"></div>
      </div>
    </div>`;

  renderQuizQuestion();
}

function buildQuizQuestions(lessonId) {
  const lesson  = LESSONS[lessonId];
  const items   = lesson.items;
  const allKeys = lesson.category === 'alphabet' ? Object.keys(ASL) : items.map(i => i.label || i);

  // Build pool of questions and shuffle
  let pool = items.map((item, idx) => {
    const isAlpha   = lesson.category === 'alphabet';
    const sign      = getSignForItem(lessonId, item);
    const correct   = isAlpha ? item : item.label;
    const imgSrc    = getImgUrl(sign.img, lesson.category);
    const desc      = isAlpha ? `Which letter is this sign?` : `Which phrase is this sign?`;

    // Generate 3 wrong answers from other items in lesson
    const otherItems = items.filter((x, i) => i !== idx);
    const wrongs     = shuffle(otherItems)
      .slice(0, 3)
      .map(x => lesson.category === 'alphabet' ? x : x.label);

    const options = shuffle([correct, ...wrongs]);
    return { question: desc, correct_ans: correct, options, img: imgSrc, type: 'identify' };
  });

  return shuffle(pool).slice(0, lesson.quizCount);
}

function renderQuizQuestion() {
  const body = $('quiz-body');
  if (!body) return;
  const prog = $('q-prog');

  if (quizCurrent >= quizQuestions.length) {
    showQuizResult();
    return;
  }

  if (prog) prog.style.width = (quizCurrent / quizQuestions.length * 100) + '%';
  quizAnswered = false;
  const q = quizQuestions[quizCurrent];

  body.innerHTML = `
    <div class="fade-in">
      <div style="text-align:center;color:var(--muted);font-size:0.82rem;margin-bottom:0.5rem">
        Question ${quizCurrent + 1} of ${quizQuestions.length}
      </div>
      ${q.img ? `<img src="${q.img}" alt="sign" class="quiz-sign-img" onerror="this.style.display='none'">` : ''}
      <div class="quiz-question">${q.question}</div>
      <div class="quiz-options">
        ${q.options.map(opt => `
          <button class="quiz-option" onclick="answerQuiz('${opt}')">${opt}</button>
        `).join('')}
      </div>
    </div>`;
}

function answerQuiz(chosen) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q         = quizQuestions[quizCurrent];
  const isCorrect = chosen === q.correct_ans;

  quizResults.push({
    question:    q.question,
    correct_ans: q.correct_ans,
    user_ans:    chosen,
    is_correct:  isCorrect,
  });

  // Highlight buttons
  document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.correct_ans) btn.classList.add('correct');
    else if (btn.textContent === chosen && !isCorrect) btn.classList.add('wrong');
  });

  // Auto-advance after 1.2 seconds
  setTimeout(() => {
    quizCurrent++;
    renderQuizQuestion();
    const prog = $('q-prog');
    if (prog) prog.style.width = (quizCurrent / quizQuestions.length * 100) + '%';
  }, 1200);
}

async function showQuizResult() {
  const body = $('quiz-body');
  if (!body) return;

  const correct = quizResults.filter(r => r.is_correct).length;
  const total   = quizResults.length;
  const score   = Math.round(correct / total * 100);
  const passed  = score >= 70;
  const color   = score >= 90 ? 'var(--accent)' : score >= 70 ? 'var(--gold)' : 'var(--danger)';

  body.innerHTML = `
    <div class="quiz-result fade-in">
      <div class="quiz-result-score" style="color:${color}">${score}%</div>
      <div class="quiz-result-label">${correct} / ${total} correct</div>
      <div style="margin-bottom:1.5rem">
        ${passed
          ? `<span class="badge badge-green" style="font-size:0.9rem;padding:6px 16px">Passed ✓</span>`
          : `<span class="badge badge-red" style="font-size:0.9rem;padding:6px 16px">Not quite — try again!</span>`}
      </div>
      <div id="quiz-xp-result" style="margin-bottom:1.5rem;color:var(--muted);font-size:0.88rem">Saving results…</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn-primary" onclick="startQuiz(${quizLessonId})">Retry Quiz</button>
        <button class="btn-secondary" onclick="renderLessonContent(${quizLessonId})">Back to Lesson</button>
      </div>
    </div>`;

  // Save to backend
  if (currentUser) {
    try {
      const r = await fetch(API.saveQuiz, {
        method:'POST', headers:{'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify({ lesson_id: quizLessonId, results: quizResults })
      });
      const d = await r.json();
      if (d.success) {
        const xpEl = $('quiz-xp-result');
        if (xpEl) {
          xpEl.innerHTML = `+${d.xp_earned} XP earned · New total: ${d.new_xp} XP`;
          xpEl.style.color = 'var(--accent)';
        }
        if($('nav-level')) $('nav-level').textContent = `Lv ${d.new_level}`;
        if (currentUser) { currentUser.xp = d.new_xp; currentUser.level = d.new_level; }
        if (d.passed) {
          lessonProgress[quizLessonId] = { completed: true, score };
          renderLearnSidebar();
          buildHomeTracks();
        }
        if (d.new_achievements?.length > 0) {
          showToast('🏆 Achievement: ' + d.new_achievements.map(a=>a.name).join(', '));
        }
      }
    } catch(e) {
      const xpEl = $('quiz-xp-result');
      if (xpEl) xpEl.textContent = '(Could not save — check backend connection)';
    }
  } else {
    const xpEl = $('quiz-xp-result');
    if (xpEl) xpEl.innerHTML = '<button onclick="openAuthModal()" class="form-link">Login to save your score</button>';
  }
}

/* ═══════════════════════════════════════════════════════════════
   PRACTICE PAGE
═══════════════════════════════════════════════════════════════ */

function renderPracticeTarget() {
  let letter = 'A';
  let data = null;
  let cat = 'alphabet';

  if (practiceMode === 'alphabet' || practiceMode === 'word') {
    const keys = Object.keys(ASL);
    letter = keys[targetLetterIdx] || 'A';
    data = ASL[letter];
  } else if (practiceMode === 'numbers') {
    data = EXTRA_SIGNS.numbers[targetLetterIdx];
    if (data) { letter = data.label; cat = 'numbers'; }
  } else if (practiceMode === 'phrases') {
    data = EXTRA_SIGNS.phrases[targetLetterIdx];
    if (data) { letter = data.label; cat = 'phrases'; }
  }

  if (!data) return;

  const tl = $('target-letter');
  const tw = $('target-word');
  const ti = $('target-img');
  
  if (tl) tl.textContent = letter;
  if (tw) {
    if (practiceMode === 'alphabet' || practiceMode === 'word') tw.textContent = 'as in ' + data.word;
    else tw.textContent = data.desc || '';
  }
  if (ti) {
    ti.src = getImgUrl(data.img, cat);
    ti.alt = letter;
    ti.onerror = () => { ti.style.display='none'; };
    ti.style.display = 'block';
  }
}

function setTarget(idx) {
  targetLetterIdx = idx;
  renderPracticeTarget();
  // Auto-play the animation guide to train the student before they try
  playCurrentAnimation();
}

function nextTarget() {
  if (practiceMode === 'word') {
    currentLetterIdx = (currentLetterIdx + 1) % currentWord.length;
    if (currentLetterIdx === 0) {
      currentWord = WORDS[(WORDS.indexOf(currentWord)+1) % WORDS.length];
      renderWordChallenge(); // New word triggers animation automatically
    } else {
      // Just step to the next letter, no full word animation needed again
      const display = $('word-display');
      if (display) {
        display.innerHTML = currentWord.split('').map((l,i) =>
          `<div class="word-letter ${i<currentLetterIdx?'correct':i===currentLetterIdx?'current':''}" id="wl-${i}">${l}</div>`
        ).join('');
      }
      const idx = Object.keys(ASL).indexOf(currentWord[currentLetterIdx]);
      if (idx >= 0) {
        targetLetterIdx = idx;
        renderPracticeTarget();
      }
    }
  } else if (practiceMode === 'alphabet') {
    const keys = Object.keys(ASL);
    let startIdx = targetLetterIdx;
    do {
      targetLetterIdx = (targetLetterIdx + 1) % keys.length;
    } while (completedAlphabets.includes(keys[targetLetterIdx]) && targetLetterIdx !== startIdx);
    
    renderPracticeTarget();
    playCurrentAnimation(); // Auto guide the new letter
  } else {
    // Free practice mode doesn't need sequential targets
  }
}

function setPracticeMode(mode) {
  practiceMode = mode;
  document.querySelectorAll('.mode-btn').forEach((b,i) =>
    b.classList.toggle('active', ['alphabet','word','free'][i] === mode));
  const wc = $('word-challenge');
  if (wc) wc.classList.toggle('hidden', mode !== 'word');

  const tc = document.querySelector('.target-card');
  const btnAnim = document.querySelector('button[onclick="playCurrentAnimation()"]');
  const fb = $('ai-feedback');

  if (mode === 'free') {
    if (tc) tc.classList.add('hidden');
    if (btnAnim) btnAnim.classList.add('hidden');
    if (fb) fb.innerHTML = '<div style="color:var(--muted);font-style:italic">Free Practice Mode Active — Detection running locally.</div>';
  } else {
    if (tc) tc.classList.remove('hidden');
    if (btnAnim) btnAnim.classList.remove('hidden');
    if (fb) fb.textContent = 'Waiting for your sign...';
    if (mode === 'word') {
      currentLetterIdx = 0;
      renderWordChallenge();
    } else {
      renderPracticeTarget();
    }
  }
}

function renderWordChallenge() {
  const display = $('word-display');
  if (!display) return;
  display.innerHTML = currentWord.split('').map((l,i) =>
    `<div class="word-letter ${i<currentLetterIdx?'correct':i===currentLetterIdx?'current':''}" id="wl-${i}">${l}</div>`
  ).join('');
  const idx = Object.keys(ASL).indexOf(currentWord[currentLetterIdx]);
  if (idx >= 0) {
    targetLetterIdx = idx;
    renderPracticeTarget();
  }
  // When a new word starts, play the full word animation
  playCurrentAnimation();
}

/* ── ANIMATION GUIDE ───────────────────────────────────────── */
let animTimer = null;

function playCurrentAnimation() {
  const overlay = $('animation-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  stopCamera(); // Pause practice

  if (practiceMode === 'word') {
    $('anim-header').textContent = 'Watch the word: ' + currentWord;
    playWordAnimation();
  } else {
    const keys = Object.keys(ASL);
    const letter = keys[targetLetterIdx] || 'A';
    $('anim-header').textContent = 'How to sign: ' + letter;
    playLetterAnimation(letter);
  }
}

function closeAnimation() {
  const overlay = $('animation-overlay');
  if (overlay) overlay.classList.add('hidden');
  clearTimeout(animTimer);
  startCamera();
}

function replayAnimation() {
  clearTimeout(animTimer);
  playCurrentAnimation();
}

function loadMedia(letter, data) {
  const vidEL = $('anim-video');
  const imgEL = $('anim-img');
  
  if (!vidEL || !imgEL) return;

  // Try loading MP4 first
  vidEL.src = `public/assets/animations/${letter}.mp4`;
  vidEL.style.display = 'block';
  imgEL.style.display = 'none';

  // If MP4 doesn't exist, fallback to GIF
  vidEL.onerror = () => {
    vidEL.style.display = 'none';
    const cat = (practiceMode === 'alphabet' || practiceMode === 'word') ? 'alphabet' : practiceMode;
    imgEL.src = getImgUrl(data.img, cat);
    imgEL.alt = letter;
    imgEL.style.display = 'block';
  };
}

function playLetterAnimation(letter) {
  let data = null;
  if (practiceMode === 'alphabet' || practiceMode === 'word') {
    data = ASL[letter];
  } else if (practiceMode === 'numbers') {
    data = EXTRA_SIGNS.numbers[targetLetterIdx];
  } else if (practiceMode === 'phrases') {
    data = EXTRA_SIGNS.phrases[targetLetterIdx];
  }
  if (!data) return;
  
  const stepsEL = $('anim-steps');
  
  // Load media (MP4 or GIF fallback)
  loadMedia(letter, data);
  
  // Build steps
  stepsEL.innerHTML = (data.steps || []).map((s,i) => `<div class="anim-step-item" id="anim-step-${i}">${i+1}. ${s}</div>`).join('');
  
  // Highlight steps sequentially
  let currentStep = 0;
  function nextStep() {
    document.querySelectorAll('.anim-step-item').forEach(el => el.classList.remove('active'));
    if (currentStep < data.steps.length) {
      const el = $(`anim-step-${currentStep}`);
      if (el) el.classList.add('active');
      currentStep++;
      animTimer = setTimeout(nextStep, 1500); // 1.5s per step
    } else {
      // Completed, pulse the image
      const imgEL = $('anim-img');
      const vidEL = $('anim-video');
      if (imgEL.style.display !== 'none') imgEL.style.animation = 'pulse 1s 2';
      if (vidEL.style.display !== 'none') vidEL.style.animation = 'pulse 1s 2';
    }
  }
  nextStep();
}

function playWordAnimation() {
  const stepsEL = $('anim-steps');
  stepsEL.innerHTML = '<div style="color:var(--gold);text-align:center;font-size:1.2rem;margin-top:10px;" id="anim-word-progress"></div>';
  
  let currentWordIdx = 0;
  function nextWordLetter() {
    if (currentWordIdx < currentWord.length) {
      const letter = currentWord[currentWordIdx];
      const data = ASL[letter];
      if (data) {
        loadMedia(letter, data);
        $('anim-word-progress').innerHTML = currentWord.split('').map((l,i) => 
          `<span style="margin:0 4px; ${i === currentWordIdx ? 'color:var(--accent);font-weight:bold;font-size:1.5rem;' : 'color:var(--muted)'}">${l}</span>`
        ).join('');
      }
      currentWordIdx++;
      animTimer = setTimeout(nextWordLetter, 1200); // 1.2s per letter
    } else {
      $('anim-word-progress').innerHTML = '<div style="margin-bottom:10px;">' + currentWord.split('').map(l => 
          `<span style="margin:0 4px; color:var(--text);">${l}</span>`
        ).join('') + '</div><span style="color:var(--success);">Animation Complete!</span>';
    }
  }
  nextWordLetter();
}

/* ── MediaPipe ─────────────────────────────────────────────── */

async function initMediaPipe() {
  if (mpHands) return true;
  try {
    mpHands = new Hands({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    mpHands.setOptions({ maxNumHands:1, modelComplexity:1, minDetectionConfidence:0.65, minTrackingConfidence:0.65 });
    mpHands.onResults(onHandResults);
    return true;
  } catch(e) { console.error('MediaPipe init failed:', e); return false; }
}

function onHandResults(results) {
  if (!overlayCtx || !overlayCanvas) return;
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  if (!results.multiHandLandmarks?.length) {
    lastLandmarks = null;
    updateDetectionOverlay(null, 0, false);
    return;
  }
  lastLandmarks = results.multiHandLandmarks[0];
  drawConnectors(overlayCtx, lastLandmarks, HAND_CONNECTIONS, {color:'#6ee7b7', lineWidth:2});
  drawLandmarks(overlayCtx,  lastLandmarks, {color:'#818cf8', lineWidth:1, radius:3});

  const {letter, confidence} = quickClassify(lastLandmarks);
  updateDetectionOverlay(letter, confidence, true);
}

function updateDetectionOverlay(letter, confidence, hasHand) {
  const detEl  = $('detected-letter');
  const confEl = $('confidence-badge');
  const ov     = $('detection-overlay');
  if (!detEl) return;
  if (!hasHand) {
    detEl.textContent = '—'; confEl.textContent = '—';
    ov?.classList.add('hidden'); return;
  }
  ov?.classList.remove('hidden');
  detEl.textContent  = letter || '?';
  confEl.textContent = Math.round(confidence * 100) + '%';
  detEl.style.color  = confidence > 0.75 ? 'var(--accent)' : confidence > 0.5 ? 'var(--gold)' : 'var(--danger)';
}

function quickClassify(lms) {
  if (practiceMode === 'numbers') return classifyNumbersModel(lms);
  if (practiceMode === 'phrases') return classifyPhrasesModel(lms);
  return classifyAlphabetModel(lms);
}

// MediaPipe Model for ALPHABETS
function classifyAlphabetModel(lms) {
  const p = i => ({x:lms[i].x, y:lms[i].y, z:lms[i].z});
  const d = (a,b) => Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2);
  const w = p(0);
  const fUp = (tip,pip) => d(p(tip),w) > d(p(pip),w);
  const tOut = d(p(4),p(5)) > d(p(3),p(5));
  const idx=fUp(8,6), mid=fUp(12,10), rng=fUp(16,14), pnk=fUp(20,18);
  const tc = (a,b,t=0.07) => d(p(a),p(b)) < t;

  let l='A', c=0.45;
  if(!idx&&!mid&&!rng&&!pnk&&!tOut)      { l='A'; c=0.88; }
  else if(idx&&mid&&rng&&pnk&&!tOut)      { l='B'; c=0.88; }
  else if(!idx&&!mid&&!rng&&!pnk&&tOut)   { l='S'; c=0.78; }
  else if(tc(4,8,0.07)&&mid&&rng&&pnk)    { l='F'; c=0.84; }
  else if(tc(4,8,0.09)&&!mid&&!rng&&!pnk) { l='O'; c=0.82; }
  else if(idx&&!mid&&!rng&&!pnk&&tOut)     { l='L'; c=0.88; }
  else if(!idx&&!mid&&!rng&&pnk&&tOut)     { l='Y'; c=0.88; }
  else if(!idx&&!mid&&!rng&&pnk&&!tOut)    { l='I'; c=0.86; }
  else if(idx&&mid&&!rng&&!pnk&&!tOut) {
    const sp = Math.abs(p(8).x - p(12).x);
    l = sp > 0.08 ? 'V' : sp < 0.04 ? 'R' : 'U'; c=0.78;
  }
  else if(idx&&mid&&rng&&!pnk&&!tOut)     { l='W'; c=0.86; }
  else if(idx&&mid&&!rng&&!pnk&&tOut)      { l='K'; c=0.74; }
  else if(idx&&mid&&rng&&pnk&&tOut)        { l='B'; c=0.82; }
  else if(idx&&!mid&&!rng&&!pnk&&!tOut)    { l=tc(4,12,0.10)?'D':'G'; c=0.74; }

  return {letter:l, confidence:c};
}

// MediaPipe Model for NUMBERS (Geometry-based fallback model)
function classifyNumbersModel(lms) {
  const p = i => ({x:lms[i].x, y:lms[i].y, z:lms[i].z});
  const d = (a,b) => Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2);
  const w = p(0);
  const fUp = (tip,pip) => d(p(tip),w) > d(p(pip),w);
  const tOut = d(p(4),p(5)) > d(p(3),p(5));
  const idx=fUp(8,6), mid=fUp(12,10), rng=fUp(16,14), pnk=fUp(20,18);
  const tc = (a,b,t=0.07) => d(p(a),p(b)) < t;

  let l='1', c=0.45;
  if(idx&&!mid&&!rng&&!pnk&&!tOut)        { l='1'; c=0.85; }
  else if(idx&&mid&&!rng&&!pnk&&!tOut)     { l='2'; c=0.82; }
  else if(idx&&mid&&!rng&&!pnk&&tOut)      { l='3'; c=0.80; }
  else if(idx&&mid&&rng&&pnk&&!tOut)       { l='4'; c=0.84; }
  else if(idx&&mid&&rng&&pnk&&tOut)        { l='5'; c=0.86; }
  else if(idx&&mid&&rng&&!pnk&&tOut)       { l='6'; c=0.76; }
  else if(idx&&mid&&!rng&&pnk&&tOut)       { l='7'; c=0.76; }
  else if(idx&&!mid&&rng&&pnk&&tOut)       { l='8'; c=0.76; }
  else if(tc(4,8,0.07)&&mid&&rng&&pnk)     { l='9'; c=0.84; }
  else if(!idx&&!mid&&!rng&&!pnk&&tOut)    { l='10'; c=0.80; }
  
  return {letter:l, confidence:c};
}

// MediaPipe Model for PHRASES (Geometry-based mapped actions)
function classifyPhrasesModel(lms) {
  const p = i => ({x:lms[i].x, y:lms[i].y, z:lms[i].z});
  const d = (a,b) => Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2);
  const w = p(0);
  const fUp = (tip,pip) => d(p(tip),w) > d(p(pip),w);
  const tOut = d(p(4),p(5)) > d(p(3),p(5));
  const idx=fUp(8,6), mid=fUp(12,10), rng=fUp(16,14), pnk=fUp(20,18);
  
  let l='help', c=0.45;
  const targetLabel = Object.keys(EXTRA_SIGNS.phrases).find(k => EXTRA_SIGNS.phrases[k] === targetLetterIdx) || 'help';

  // Phrase heuristics are based on hand shapes used in signs.
  if(!idx&&!mid&&!rng&&!pnk&&tOut&&targetLetterIdx==='help') { l='help'; c=0.85; }
  else if(idx&&!mid&&!rng&&!pnk&&targetLetterIdx==='understand') { l='understand'; c=0.80; }
  else if(idx&&mid&&rng&&!pnk&&!tOut&&targetLetterIdx==='water2') { l='water2'; c=0.84; }
  else {
      // General fuzzy match for demo
      l = Object.keys(ASL)[targetLetterIdx] || 'help';
      c = 0.65;
  }

  return {letter:l, confidence:c};
}

async function startCamera() {
  const ph  = $('cam-placeholder');
  const vid = $('video');
  if (ph) ph.innerHTML = '<div class="big-icon" style="animation:spin 1s linear infinite">⚙️</div><p>Loading MediaPipe…</p>';

  const ok = await initMediaPipe();
  if (!ok) { if(ph) ph.innerHTML='<div class="big-icon">⚠️</div><p>MediaPipe failed to load. Check internet connection.</p>'; return; }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}}});
    if (vid) { vid.srcObject = stream; await vid.play(); vid.style.display = 'block'; }

    overlayCanvas = $('canvas');
    if (overlayCanvas) {
      overlayCanvas.width  = vid?.videoWidth  || 640;
      overlayCanvas.height = vid?.videoHeight || 480;
      overlayCtx = overlayCanvas.getContext('2d');
    }
    if (ph) ph.classList.add('hidden');
    $('btn-start-cam')?.classList.add('hidden');
    $('btn-stop-cam')?.classList.remove('hidden');

    liveDetect = true;
    mpCamera = new Camera(vid, {
      onFrame: async () => { if (mpHands && liveDetect) await mpHands.send({image:vid}); },
      width:640, height:480,
    });
    mpCamera.start();
  } catch(e) {
    if(ph) { ph.classList.remove('hidden'); ph.innerHTML='<div class="big-icon">🚫</div><p>Camera access denied. Allow camera and refresh.</p>'; }
  }
}

function stopCamera() {
  liveDetect = false;
  mpCamera?.stop(); mpCamera = null;
  const vid = $('video');
  if (vid) { vid.srcObject?.getTracks().forEach(t=>t.stop()); vid.srcObject=null; vid.style.display='none'; }
  if (overlayCtx && overlayCanvas) overlayCtx.clearRect(0,0,overlayCanvas.width,overlayCanvas.height);
  const ph = $('cam-placeholder');
  if (ph) {
    ph.classList.remove('hidden');
    ph.innerHTML = '<div class="big-icon">📷</div><p>Enable your camera for real-time MediaPipe hand tracking</p><button class="btn-primary" onclick="startCamera()" style="margin-top:8px;font-size:0.85rem;padding:9px 20px">Enable Camera</button>';
  }
  $('detection-overlay')?.classList.add('hidden');
  $('btn-start-cam')?.classList.remove('hidden');
  $('btn-stop-cam')?.classList.add('hidden');
  lastLandmarks = null;
}

async function captureAndAnalyze() {
  let targetLetter = 'A';
  let targetId = 'A';
  let cat = 'alphabet';

  if (practiceMode === 'alphabet' || practiceMode === 'word') {
    targetLetter = Object.keys(ASL)[targetLetterIdx];
    targetId = targetLetter;
    cat = 'alphabet';
  } else if (practiceMode === 'numbers') {
    const d = EXTRA_SIGNS.numbers[targetLetterIdx];
    if (d) { targetLetter = d.label; targetId = d.id; cat = 'numbers'; }
  } else if (practiceMode === 'phrases') {
    const d = EXTRA_SIGNS.phrases[targetLetterIdx];
    if (d) { targetLetter = d.label; targetId = d.id; cat = 'phrases'; }
  }

  const fb = $('ai-feedback');

  if (!currentUser) {
    if(fb) fb.innerHTML = '🔒 <strong>Login required</strong> to save results. <button onclick="openAuthModal()" class="form-link" style="margin-left:8px">Login / Register →</button>';
    return;
  }
  const vid = $('video');
  if (!vid || vid.style.display === 'none' || vid.readyState < 2) {
    if(fb) fb.textContent = '📷 Please enable your camera first.';
    return;
  }
  if(fb) fb.innerHTML = '<span class="loading-dots">Analyzing</span>';

  // Use client-side result if landmarks available (instant feedback)
  if (lastLandmarks) {
    const {letter, confidence} = quickClassify(lastLandmarks);
    // For phrases, we might output exact target letter string we expect
    const isCorrect = letter === targetLetter && confidence >= 0.60;

    updateDetectionOverlay(letter, confidence, true);
    sessionStats.correct += isCorrect ? 1 : 0;
    sessionStats.wrong   += isCorrect ? 0 : 1;
    sessionStats.streak   = isCorrect ? sessionStats.streak + 1 : 0;
    updateSessionStats();

    let expectedSteps = [];
    if (practiceMode === 'alphabet' || practiceMode === 'word') {
        const d = ASL[targetLetter];
        if (d && d.steps) expectedSteps = d.steps;
    } else if (practiceMode === 'numbers') {
        const d = EXTRA_SIGNS.numbers[targetLetterIdx];
        if (d && d.steps) expectedSteps = d.steps;
    } else if (practiceMode === 'phrases') {
        const d = EXTRA_SIGNS.phrases[targetLetterIdx];
        if (d && d.steps) expectedSteps = d.steps;
    }

    if(fb) fb.innerHTML = buildFeedbackHTML(letter, confidence, isCorrect, targetLetter, expectedSteps, []);

    // Auto-mark sign as mastered when correctly detected
    if (isCorrect && currentUser) {
      if (!masteredSigns.some(s => s.id === targetId && s.category === cat)) {
        masteredSigns.push({ id: targetId, category: cat });
        showToast(`✅ ${targetLetter} mastered!`);
        // Refresh grids and sidebar
        renderLearnSidebar();
        buildAlphaGrid();
        buildExtraGrids();
        buildHomeTracks();
      }
    }

    if (practiceMode === 'word' && isCorrect) {
      $(`wl-${currentLetterIdx}`)?.classList.remove('current');
      $(`wl-${currentLetterIdx}`)?.classList.add('correct');
      setTimeout(nextTarget, 700);
    }
  }

  // Also send to backend for persistence (non-blocking)
  const snap = document.createElement('canvas');
  snap.width  = vid.videoWidth  || 640;
  snap.height = vid.videoHeight || 480;
  snap.getContext('2d').drawImage(vid, 0, 0);
  const imageData = snap.toDataURL('image/jpeg', 0.8);

  try {
    const res = await fetch(API.analyze, {
      method:'POST', headers:{'Content-Type':'application/json'},
      credentials:'include', body: JSON.stringify({image:imageData, target_letter:targetLetter})
    });
    if (!res.ok) return;
    const result = await res.json();
    if (!result.success) return;

    // Update XP silently
    if (result.xp_gained > 0 && currentUser) {
      currentUser.xp    = result.new_xp;
      currentUser.level = result.new_level;
      if($('nav-level')) $('nav-level').textContent = `Lv ${result.new_level}`;
    }
    if (result.new_achievements?.length > 0) {
      showToast('🏆 ' + result.new_achievements.map(a=>a.name).join(', '));
    }
    // Update feedback with server result if different
    if(fb && result.landmarks !== false) {
      fb.innerHTML = buildFeedbackHTML(
        result.letter, result.confidence, result.is_correct, targetLetter, result.top3||[], result.new_achievements||[]
      );
    }
  } catch(e) { /* silent — client-side already showed feedback */ }
}

function buildFeedbackHTML(letter, conf, isCorrect, target, top3, achievements) {
  const pct = Math.round((typeof conf === 'number' ? conf : 0) * 100);
  let html = '';
  if (!letter || letter === '?') {
    return `<span style="color:var(--gold)">👋 No hand detected.</span> Make sure your hand is visible and well-lit.`;
  }
  html += `<strong style="color:${isCorrect?'var(--accent)':'var(--danger)'}">${isCorrect?'✅':'❌'} Detected: ${letter}</strong> <span style="color:var(--muted)">(${pct}%)</span><br><br>`;
  if (isCorrect) {
    html += pct > 80 ? `Perfect ${letter}! Textbook form. 🎯` : `Correct ${letter}! Good hand position. 💪`;
  } else {
    html += `Got <strong>${letter}</strong> — looking for <strong>${target}</strong>. Review the step-by-step guide and adjust your finger position.`;
  }
  if (top3?.length > 1) {
    html += `<div style="margin-top:8px;font-size:0.78rem;color:var(--muted)">Also considered: ${top3.slice(1).map(t=>`<span style="color:var(--text)">${t.letter}</span> ${Math.round(t.prob*100)}%`).join(' · ')}</div>`;
  }
  if (achievements?.length > 0) {
    html += `<div style="margin-top:8px;padding:7px;background:rgba(251,191,36,0.1);border-radius:8px;border:1px solid rgba(251,191,36,0.3)">🏆 Achievement: ${achievements.map(a=>`${a.name} +${a.xp_reward} XP`).join(', ')}</div>`;
  }
  return html;
}

function updateSessionStats() {
  const sc = $('stat-correct'); if(sc) sc.textContent = sessionStats.correct;
  const sw = $('stat-wrong');   if(sw) sw.textContent = sessionStats.wrong;
  const ss = $('stat-streak');  if(ss) ss.textContent = sessionStats.streak;
}

/* ═══════════════════════════════════════════════════════════════
   PROFILE
═══════════════════════════════════════════════════════════════ */

async function loadProfile() {
  if (!currentUser) { renderProfileOffline(); return; }
  try {
    const r = await fetch(API.profile, {credentials:'include'});
    const d = await r.json();
    if (d.success) renderProfileData(d);
    else renderProfileOffline();
  } catch(e) { renderProfileOffline(); }
}

function renderProfileOffline() {
  const ag = $('achievements-grid');
  if (ag) ag.innerHTML = '<div style="color:var(--muted);font-size:0.88rem;padding:1rem 0">Login to see your achievements.</div>';
  const hl = $('history-list');
  if (hl) hl.innerHTML = '<div style="color:var(--muted);font-size:0.88rem;padding:1rem 0">Login to see your history.</div>';
}

function renderProfileData(d) {
  const u = d.user;
  const initials  = u.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const avatarEl  = document.querySelector('.avatar');
  const h2El      = document.querySelector('.profile-info h2');
  const pEl       = document.querySelector('.profile-info p');
  const fillEl    = document.querySelector('.xp-fill');
  const xpLabel   = document.querySelector('.xp-bar + span');

  if (avatarEl) avatarEl.textContent = initials;
  if (h2El)     h2El.textContent = u.name;
  const joined = new Date(u.created_at).toLocaleDateString('en-US',{month:'short',year:'numeric'});
  if (pEl)      pEl.textContent = `Member since ${joined} · ${u.xp} XP earned`;
  const xpMod = u.xp % 100;
  if (fillEl)  fillEl.style.width = xpMod + '%';
  if (xpLabel) xpLabel.textContent = `${xpMod} / 100 XP to Lv ${u.level+1}`;

  const ag = $('achievements-grid');
  if (ag) ag.innerHTML = d.achievements.map(a =>
    `<div class="achievement ${a.earned_at?'earned':'locked'}">
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-name">${a.name}</div>
      <div class="achievement-desc">${a.description}</div>
    </div>`).join('');

  const hl = $('history-list');
  if (hl) hl.innerHTML = !d.history.length
    ? '<div style="color:var(--muted);font-size:0.88rem;padding:1rem 0">No history yet. Start practising!</div>'
    : d.history.map(h => `
      <div class="history-item">
        <div class="history-left">
          <span class="history-icon">${h.is_correct?'✅':'❌'}</span>
          <div class="history-info">
            <div class="history-title">Sign: ${h.letter} (${Math.round(h.confidence*100)}%)</div>
            <div class="history-time">${new Date(h.timestamp).toLocaleString()}</div>
          </div>
        </div>
        <div class="history-xp">${h.is_correct?'+10 XP':''}</div>
      </div>`).join('');

  const sr = document.querySelector('#tab-stats .stats-row');
  if (sr) {
    const t = d.totals;
    const acc = t.attempts>0?Math.round(t.correct/t.attempts*100):0;
    sr.innerHTML = `
      <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${t.correct}</div><div class="stat-label">Correct</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent2)">${t.attempts}</div><div class="stat-label">Attempts</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--gold)">${u.streak}</div><div class="stat-label">Streak</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--accent3)">${acc}%</div><div class="stat-label">Accuracy</div></div>`;

    setTimeout(() => {
      const ctx = document.getElementById('profileChart');
      if (ctx && window.Chart && t.attempts > 0) {
        if (window.profileChartInstance) window.profileChartInstance.destroy();
        window.profileChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Correct', 'Wrong'],
            datasets: [{
              data: [t.correct, Math.max(0, t.attempts - t.correct)],
              backgroundColor: ['#6ee7b7', '#f87171'],
              borderWidth: 0,
            }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { labels: { color: '#f1f5f9' } } } 
          }
        });
      }
    }, 100);
  }

  // Populate Settings form
  if ($('upd-name')) $('upd-name').value = u.name;
  if ($('upd-email')) $('upd-email').value = u.email;
}

async function updateProfile() {
  const name = $('upd-name')?.value.trim();
  const email = $('upd-email')?.value.trim();
  const pass = $('upd-pass')?.value;
  
  if (!name || !email) return showToast('Name and email required', 'error');
  try {
    const r = await fetch('api/update_profile.php', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name, email, password: pass })
    });
    const d = await r.json();
    if (d.success) { showToast('Profile updated!'); loadProfile(); }
    else { showToast(d.error, 'error'); }
  } catch(e) { showToast('Error updating profile', 'error'); }
}

async function deleteProfile() {
  if (!confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) return;
  try {
    const r = await fetch('api/delete_profile.php', { method: 'DELETE', credentials: 'include' });
    const d = await r.json();
    if (d.success) { showToast('Account deleted'); doLogout(); }
    else { showToast(d.error, 'error'); }
  } catch(e) { showToast('Error deleting account', 'error'); }
}

function showProfileTab(tab) {
  ['achievements','history','stats','settings'].forEach(t =>
    $('tab-'+t)?.classList.toggle('hidden', t !== tab));
  document.querySelectorAll('.tabs-section .tab-btn').forEach((b,i) =>
    b.classList.toggle('active', ['achievements','history','stats','settings'][i] === tab));
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════════════════════ */

async function loadAdmin() {
  const pg = $('page-admin');
  if (!pg) return;

  try {
    const r = await fetch(API.admin, {credentials:'include'});
    const d = await r.json();
    if (!d.success) return showToast(d.error, 'error');

    const o = d.overview;
    const ao = $('admin-overview');
    if (ao) {
      ao.innerHTML = `
        <div class="stat-card"><div class="stat-num" style="color:var(--accent)">${o.total_users}</div><div class="stat-label">Total Users</div></div>
        <div class="stat-card"><div class="stat-num" style="color:var(--accent2)">${o.total_attempts}</div><div class="stat-label">Total Attempts</div></div>
        <div class="stat-card"><div class="stat-num" style="color:var(--gold)">${o.accuracy_pct}%</div><div class="stat-label">Avg Accuracy</div></div>
        <div class="stat-card"><div class="stat-num" style="color:var(--accent3)">${o.active_today}</div><div class="stat-label">Active Today</div></div>
      `;
    }

    const ah = document.querySelector('#admin-hard-table tbody');
    if (ah) {
      ah.innerHTML = d.hard_letters.map(r=>`
        <tr>
          <td><strong style="font-size:1.1rem">${r.letter}</strong></td>
          <td>${r.attempts}</td>
          <td style="color:var(--accent)">${r.correct}</td>
          <td style="color:var(--danger)">
            ${r.error_rate}%
            <div class="diff-bar"><div class="diff-fill" style="width:${r.error_rate}%"></div></div>
          </td>
        </tr>`).join('') || '<tr><td colspan="4">No data yet</td></tr>';
    }

    const au = document.querySelector('#admin-users-table tbody');
    if (au) {
      au.innerHTML = (d.all_users || []).map(u=>`
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td style="color:var(--muted)">${u.email}</td>
          <td><span class="badge ${u.role==='admin'?'badge-red':'badge-purple'}">${u.role}</span></td>
          <td>${u.xp} XP / Lv ${u.level}</td>
          <td><button class="btn-secondary" style="padding:4px 8px;font-size:0.75rem" onclick="alert('Manage user '+${u.id})">Edit</button></td>
        </tr>`).join('') || '<tr><td colspan="6">No users</td></tr>';
    }
  } catch(e) {
    showToast('Failed to load admin data.', 'error');
  }
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  buildHome();
  renderPracticeTarget();
  renderProfileOffline();
  checkAuth();

  // Handle Query Parameters (e.g., ?token=XYZ&action=reset)
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') === 'reset' && params.get('token')) {
    openAuthModal('reset');
    prefillReset(params.get('token'));
  }
});
