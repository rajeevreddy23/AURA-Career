const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(relative, context = {}, requireModule = require) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', relative), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: requireModule, console, ...context });
  return exports;
}
const teachers = load('src/lib/ai/teachers.ts');
const classroomSafety = load('src/lib/classroom/safety.ts');
function voiceRuntime(fetchImpl = async () => ({ ok: false })) {
  const spoken = [];
  const voices = ['Zira', 'Aria', 'Hazel', 'David', 'George'].map(name => ({ name, lang: 'en-US' }));
  const synth = { getVoices: () => voices, cancel: () => {}, speak: u => { spoken.push(u); u.onstart(); } };
  let endCount = 0;
  const runtime = load('src/lib/ai/voice.ts', {
    window: { speechSynthesis: synth, setTimeout, clearTimeout },
    SpeechSynthesisUtterance: function(text) { this.text = text; },
    fetch: fetchImpl, AbortController, AbortSignal, performance,
    requestAnimationFrame: () => 1, cancelAnimationFrame: () => {},
  }, name => name === './teachers' ? teachers : require(name));
  return { runtime, spoken, options: { onEnd: () => endCount++ }, endCount: () => endCount };
}
const flush = async () => { await new Promise(setImmediate); await new Promise(setImmediate); };

test('five identities have the required initials, genders and distinct neural voices', () => {
  assert.deepEqual(Array.from(teachers.TEACHERS, t => t.initial), ['P', 'N', 'S', 'M', 'R']);
  assert.equal(teachers.TEACHERS.filter(t => t.gender === 'female').length, 3);
  assert.equal(teachers.TEACHERS.filter(t => t.gender === 'male').length, 2);
  assert.equal(new Set(teachers.TEACHERS.map(t => t.voice)).size, 5);
  for (const teacher of teachers.TEACHERS) assert.equal(teachers.getTeacher(teacher.name).id, teacher.id);
});
test('each teacher selects the intended fallback voice and narration lifecycle resets lip sync', async () => {
  for (const teacher of teachers.TEACHERS) {
    const { runtime, spoken, options, endCount } = voiceRuntime();
    runtime.playAuraVoice({ ...options, text: 'Hello there. Let us learn together.', teacherId: teacher.id });
    await flush();
    assert.equal(spoken.length, 1);
    assert.equal(spoken[0].voice.name, teacher.browserVoices[0]);
    assert.equal(spoken[0].pitch, teacher.pitch);
    assert.equal(runtime.getSpeechFrame().active, true);
    spoken[0].onboundary({ name: 'word', charIndex: 6 });
    assert.equal(runtime.getSpeechFrame().word, 'there.');
    runtime.stopAllVoicePlayback();
    assert.equal(runtime.getSpeechFrame().mouth, 0);
    assert.equal(runtime.getSpeechFrame().active, false);
    assert.equal(endCount(), 1);
    spoken[0].onend();
    assert.equal(endCount(), 1);
  }
});
test('a stopped pending voice request never starts a fallback or restarts the avatar', async () => {
  let resolveFetch;
  const { runtime, spoken, options, endCount } = voiceRuntime(() => new Promise(resolve => { resolveFetch = resolve; }));
  const handle = runtime.playAuraVoice({ ...options, teacherId: 'expert', text: 'Pending speech.' });
  handle.stop();
  resolveFetch({ ok: false });
  await flush();
  assert.equal(spoken.length, 0);
  assert.equal(runtime.getSpeechFrame().active, false);
  assert.equal(endCount(), 1);
});
test('switching teacher stops previous narration before selecting a new voice', async () => {
  const { runtime, spoken } = voiceRuntime();
  runtime.playAuraVoice({ teacherId: 'friend', text: 'Hello from Navya.' }); await flush();
  runtime.playAuraVoice({ teacherId: 'coach', text: 'Hello from Madhu.' }); await flush();
  assert.equal(spoken.length, 2);
  assert.equal(spoken[0].voice.name, 'Aria');
  assert.equal(spoken[1].voice.name, 'David');
  assert.equal(runtime.getSpeechFrame().active, true);
  runtime.stopAllVoicePlayback();
});

test('voice selection from the shared audio player resolves to the same teacher profile', async () => {
  const { runtime, spoken } = voiceRuntime();
  runtime.playAuraVoice({ voice: teachers.TEACHERS[2].voice, text: 'A clear step by step explanation.' });
  await flush();
  assert.equal(spoken[0].voice.name, 'Hazel');
  assert.equal(spoken[0].pitch, teachers.TEACHERS[2].pitch);
  runtime.stopAllVoicePlayback();
});

function classroomRuntime(courseId, initialStorage = new Map(), initialStudentId = 'guest') {
  const slots = []; let cursor = 0, effects = [];
  const React = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
    useCallback(fn) { return fn; },
    useEffect(fn, deps) { const i = cursor++; const old = slots[i]; if (!old || deps.some((v, j) => v !== old[j])) { slots[i] = deps; effects.push(fn); } },
  };
  const syllabi = load('src/lib/constants/syllabi.ts');
  const storage = { getItem: key => initialStorage.get(key) || null, setItem: (key, value) => initialStorage.set(key, value) };
  const userData = load('src/lib/utils/userData.ts', { window: {}, localStorage: storage }, () => ({ auth: {currentUser: null} }));
  const noop = () => {};
  let credentialsIssued = 0;
  const hook = load('src/hooks/useClassroomState.ts', {
    window: { location: { search: '?courseId=' + courseId }, speechSynthesis: { cancel: noop } },
    localStorage: storage, URLSearchParams, AbortController,
  }, name => name === 'react' ? React : name.includes('classroom/safety') ? classroomSafety : name.includes('syllabi') ? syllabi : name.includes('firebase') ? { auth: { currentUser: null } } : { getUserEnrollments: userData.getUserEnrollments, saveUserEnrollment: noop, saveUserCourseProgress: noop, issueCredentialForStudent: () => credentialsIssued++ });
  const render = (studentId = initialStudentId) => { cursor = 0; const result = hook.useClassroomState(courseId, studentId); const pending = effects; effects = []; pending.forEach(fn => fn()); return result; };
  render();
  return { render, storage: initialStorage, syllabus: syllabi.getCourseSyllabus(courseId), credentialsIssued: () => credentialsIssued };
}

test('student sessions cannot restore another account or unowned legacy notes', () => {
  const storage = new Map([
    ['aura_enrollment_1', JSON.stringify({ notes: [{ id: 'legacy', bullets: ['Unowned legacy note'] }] })],
    [classroomSafety.classroomStorageKey('alice', '1'), JSON.stringify({ notes: [{ id: 'alice-note', bullets: ['Alice private note'] }] })],
  ]);
  const { render } = classroomRuntime('1', storage, 'alice');
  assert.equal(render().session.notes[0].id, 'alice-note');
  render('bob');
  const bob = render('bob');
  assert.equal(bob.session.notes.length, 0);
  bob.addAutoLiveNote('Module', 'Bob lesson', ['Bob private note']);
  assert.equal(JSON.parse(storage.get(classroomSafety.classroomStorageKey('bob', '1'))).notes[0].bullets[0], 'Bob private note');
  assert.equal(JSON.parse(storage.get(classroomSafety.classroomStorageKey('alice', '1'))).notes[0].id, 'alice-note');
  assert.equal(JSON.parse(storage.get('aura_enrollment_1')).notes[0].id, 'legacy');
});

test('completed course status survives reload rather than reverting to in-progress', () => {
  const { render, storage, syllabus } = classroomRuntime('1');
  let result = render();
  const lastModule = syllabus.modules.length - 1;
  result.goToSlideInModule(lastModule, syllabus.modules[lastModule].slides.length - 1);
  result = render(); result.nextSlideOrModule();
  const restored = classroomRuntime('1', storage).render();
  assert.equal(classroomSafety.hasCompletedCourse(restored.session.modules), true);
  assert.equal(restored.session.aiState, 'lesson_completed');
});

test('auth hydration does not expose legacy notes or write an unowned session', () => {
  const storage = new Map([['aura_enrollment_1', JSON.stringify({notes: [{id:'legacy-private', bullets:['Private']}], progress: 100})]]);
  const { render } = classroomRuntime('1', storage, 'pending');
  const result = render();
  assert.equal(result.session.notes.length, 0);
  assert.equal(classroomSafety.hasCompletedCourse(result.session.modules), false);
  result.addAutoLiveNote('Test', 'Pending', ['Should not persist']);
  assert.equal(storage.has(classroomSafety.classroomStorageKey('pending', '1')), false);
  assert.equal(JSON.parse(storage.get('aura_enrollment_1')).notes[0].id, 'legacy-private');
});

test('known account-scoped enrollments preserve progress without importing legacy notes', () => {
  const storage = new Map([
    ['aura_enrollment_1', JSON.stringify({currentModuleIndex: 0, currentSlideIndex: 0, notes:[{id:'unowned-secret'}]})],
    ['aura_user_alice_enrollments', JSON.stringify({'1': {courseId:'1', level:'beginner', currentModuleIndex: 1, currentSlideIndex: 1, progress:50}})],
  ]);
  const result = classroomRuntime('1', storage, 'alice').render();
  assert.equal(result.session.currentModuleIndex, 1);
  assert.equal(result.session.currentSlideIndex, 1);
  assert.equal(result.session.notes.length, 0);
});

test('certificate gate rejects empty and unfinished courses and HTML exports escape markup', () => {
  assert.equal(classroomSafety.hasCompletedCourse([]), false);
  assert.equal(classroomSafety.hasCompletedCourse([{status:'completed'}, {status:'in_progress'}]), false);
  assert.equal(classroomSafety.hasCompletedCourse([{status:'completed'}]), true);
  const escaped = classroomSafety.escapeExportHtml('<img src=x onerror="alert(1)"> & <script>run()</script>');
  assert.ok(!escaped.includes('<'));
  assert.ok(escaped.includes('&lt;script&gt;'));
  assert.ok(escaped.includes('&quot;'));
  assert.equal(classroomSafety.escapeExportHtml(null), '');
});
test('every saved course module and slide supports next, previous and direct navigation', () => {
  const syllabi = load('src/lib/constants/syllabi.ts');
  for (const courseId of Object.keys(syllabi.COURSE_SYLLABI)) {
    const { render, syllabus } = classroomRuntime(courseId);
    let result = render();
    assert.equal(result.session.courseId, courseId);
    for (let mi = 0; mi < syllabus.modules.length; mi++) {
      for (let si = 0; si < syllabus.modules[mi].slides.length; si++) {
        result.goToSlideInModule(mi, si); result = render();
        assert.equal(result.currentSlide.slideId, syllabus.modules[mi].slides[si].slideId);
        assert.equal(result.session.currentModuleIndex, mi);
        assert.equal(result.session.currentSlideIndex, si);
      }
    }
    const total = result.totalSlides;
    for (let i = total; i > 1; i--) { result.prevSlideOrModule(); result = render(); assert.equal(result.currentOverallSlideNumber, i - 1); }
    for (let i = 1; i < total; i++) { result.nextSlideOrModule(); result = render(); assert.equal(result.currentOverallSlideNumber, i + 1); }
    result.nextSlideOrModule(); result = render(); assert.equal(result.session.aiState, 'lesson_completed');
  }
});
test('old out-of-range saved progress is clamped and subsequent navigation persists for reload', () => {
  const storage = new Map([['aura_enrollment_1', JSON.stringify({ currentModuleIndex: 999, currentSlideIndex: 999 })]]);
  const { render, syllabus } = classroomRuntime('1', storage);
  let result = render();
  assert.equal(result.session.currentModuleIndex, syllabus.modules.length - 1);
  assert.equal(result.session.currentSlideIndex, syllabus.modules[syllabus.modules.length - 1].slides.length - 1);
  result.goToSlideInModule(1, 0); result = render();
  const reloaded = classroomRuntime('1', storage).render();
  assert.equal(reloaded.session.currentModuleIndex, 1);
  assert.equal(reloaded.session.currentSlideIndex, 0);
});

test('jumping to the last lesson does not issue a certificate; explicit completion does', () => {
  const testRuntime = classroomRuntime('1');
  let result = testRuntime.render();
  const last = testRuntime.syllabus.modules.length - 1;
  result.goToSlideInModule(last, 0); result = testRuntime.render();
  assert.equal(testRuntime.credentialsIssued(), 0);
  assert.equal(JSON.parse(testRuntime.storage.get('aura_enrollment_1')).progress, 99);
  result.nextSlideOrModule(); result = testRuntime.render();
  assert.equal(result.session.aiState, 'lesson_completed');
  assert.equal(testRuntime.credentialsIssued(), 1);
});
test('live explanation notes and code are restored with the saved classroom session', () => {
  const testRuntime = classroomRuntime('1');
  let result = testRuntime.render();
  result.addAutoLiveNote('Lists', 'An explanation', ['Lists can grow.'], 'items.append(1)');
  result = testRuntime.render();
  const reloaded = classroomRuntime('1', testRuntime.storage).render();
  assert.equal(reloaded.session.notes[0].slideTitle, 'An explanation');
  assert.equal(reloaded.session.notes[0].code, 'items.append(1)');
  assert.equal(reloaded.session.notes[0].bullets[0], 'Lists can grow.');
});
