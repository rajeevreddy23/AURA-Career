# AURA Learn classroom audit — Phase 0

Date: 2026-10-13. Scope: this local checkout, its live Chrome classroom, classroom components, voice runtime, saved session hook, Python TeacherAgent and API transport. This is a findings report, not a claim that the requested 3D rebuild is implemented.

## Baseline verification

- TypeScript type check: passed.
- Existing frontend runtime tests: 9 passed; reference image tests: 3 passed.
- Python TeacherAgent tests: 11 passed with deprecation warnings. They mock models and mostly check return shapes; they do not prove factual teaching quality or streaming behavior.
- Initial desktop console inspection: no captured errors/warnings. This does not certify all workflows error-free.
- Chrome responsive check: 390 x 844. Exit starts at x=430.67, outside the 390px viewport; controls extend to x=489.09. Screenshot: `scratch/audit-mobile-header.png`.
- Certificate modal opens with Download enabled at lesson 2/7. No certificate was downloaded during audit. Screenshot: `scratch/audit-certificate-before-completion.png`.
- Local backend `/health` at port 8000 timed out after 3 seconds. Live backend SSE connectivity/reconnect not established.
- Public Vercel URL could not be retrieved by the web inspection tool. No deployment was performed or verified.

## Bugs and corrective work

Evidence labels: **UI** = reproduced in Chrome; **code** = directly visible source behavior; **risk** = not reproduced end-to-end and needs a regression test.

| ID | Evidence | Issue and cause | Fix / affected files |
|---|---|---|---|
| B01 | UI/code | Classroom certificate export bypasses completion; hard-coded honors grade, verification ID, and fallback student name misrepresent learning results. | Guard completion, remove invented honors/ID/name, use saved credential data; `src/app/classroom/page.tsx`, `src/hooks/useClassroomState.ts`. |
| B02 | code | Notes/progress are restored from `aura_enrollment_<course>` rather than student-scoped storage. Changing course with no saved notes can reuse `prev.notes`. | Student-scoped session key, reset on student/course change, guest-only legacy compatibility; `src/hooks/useClassroomState.ts`. Firestore synchronization belongs to Phase 6. |
| B03 | UI/code | Header controls overflow mobile width and hide Exit/settings. Difficulty has no mobile alternative; Code Lab is hidden on mobile. | Replace header with responsive control bar/drawer, preserve every action; `src/app/classroom/page.tsx` and new ControlBar. |
| B04 | code | Notes export interpolates student/model content directly into executable HTML; certificate names/course titles are also unescaped. | Escape HTML interpolation or use a document renderer; `src/app/classroom/page.tsx`. |
| B05 | code | “PDF notes” actually downloads HTML. It exports Q&A only, not all taught board content. | Actual PDF and Markdown export from unified board/transcript history; page + new notes pipeline. |
| B06 | code | Microphone remains active when replay/explanation starts; recognition errors do not restore AI state, and `start()` exceptions are not caught. | Single owner for STT/TTS; abort recognition before speech, catch start errors and restore idle; page. Physical mic recognition not tested. |
| B07 | code | Input is disabled during generation, so the student cannot interrupt a pending answer. Pause button cancels rather than resumes. | Abort generation/audio/queued events on raise-hand, retain resumable lesson checkpoint; page + eventQueue/speechClock. |
| B08 | code | Quiz requests are not canceled on exit/close and not validated. Failed retry may retain old questions. Server accepts 10 questions while UI promises 20; options/correctIndex are unchecked. | Abortable lifecycle, explicit error state, schema validation, accurate counts; page and `src/app/api/generate-quiz/route.ts`. |
| B09 | code | Python endpoint `ask_professor_endpoint` drops history even though TeacherAgent accepts it. | Forward request history; `backend/app/api/agent_routes.py`. |
| B10 | code + official docs | Tuple lesson incorrectly says contained elements cannot mutate and implies all tuples are hashable/thread-safe. Version-specific free-list details are presented as universal language rules. | Explain immutable slots versus mutable referenced objects; hashability requires hashable elements; qualify implementation details; `src/lib/constants/syllabi.ts`. |
| B11 | code | “Learning map” repeats identical key points below; regex-derived list visuals can confuse unrelated bracket syntax with a Python list. | Use validated semantic board events rather than regex, remove repeated cards; TeachingBoard/LessonVisual. |
| B12 | code | AI-generated gestures are ignored by the current reference renderer; it cannot walk, point, blink or write with articulated limbs. | Replace portrait renderer with skeletal GLB/visemes in Phases 2–3; AIProfessorAvatar/ReferenceTeacher. |
| B13 | code | Portrait load failure leaves an empty canvas; requestAnimationFrame continues even when reduced motion is enabled or tab hidden. | Explicit load/error fallback; render-on-demand/visibility lifecycle; ReferenceTeacher or its replacement. No heap leak measured. |
| B14 | code | Neural captions advance by estimated 550ms-per-word, not audio timestamps. Browser fallback names are best-effort and can reuse voices or select wrong gender when none is installed. | HeadTTS timestamp/viseme clock, capability disclosure, fallback captions; `src/lib/ai/voice.ts`. Long-sentence drift not quantified. |
| B15 | code | ChatPanel SSE parser flattens/trims chunks, supports only LF framing and one data line, lacks event IDs/reconnect/typed JSON, and discards unfinished tail data. Server embeds raw multiline chunks in one `data:` field. | Compatible structured JSON SSE framing/parser with event IDs and abort policy; ChatPanel, agent_routes and new sseClient. |
| B16 | code | ChatPanel can accumulate `speechSynthesis` “end” listeners (completion belongs to utterances), leaves mic/timers/audio running on unmount, and does not always stop speech before listening. | Shared audio owner and cleanup via actual narration completion; ChatPanel. Currently not mounted by classroom. |
| B17 | code | Generic Python fallbacks fabricate explanations, code/results and performance advice unrelated to the actual doubt. Mandatory flowcharts make simple answers awkward. | Honest offline response grounded in saved lesson, adaptive staged pedagogy and wait-for-student; TeacherAgent/base. |
| B18 | code | Tutoring engine sends every snippet to Python regardless of course/language; verification result is not clearly distinguished from predicted output. | Carry language and explicit verified/predicted/failed provenance; `src/lib/ai/tutoringEngine.ts`. |
| B19 | code/risk | Compiler Explorer parser assumes a text format and can report “no output” success for an unrecognized response. | Negotiate/validate documented response, compile/run status and stderr; `src/lib/tools/dataGathering.ts`, CodingLab. External compiler test still required. |
| B20 | code | Legacy CodingLabModal reports every test Passed after a timeout without executing user code. | Remove unused fake runner; reuse actual execution subsystem. No imports found in `src`; not a current visible button. |
| B21 | code | Active CodingLab runs JS on main window via `new Function`; errors can leave global console functions replaced, and infinite loops freeze the page. Python fallback is an incomplete JS evaluator. | Worker/iframe isolated execution, deadlines, honest unsupported-runtime errors, guaranteed cleanup; `src/components/coding/CodingLab.tsx`. |
| B22 | code | Inline snippet + any fenced block suppresses separate code/lab link, even if the only fence is Mermaid. Links force Python. Snippet URL is decoded twice in coding page. | Per-snippet language-aware actions, one decoding step; classroom and coding-lab pages. |
| B23 | code | Modals lack dialog semantics, focus trap/Escape behavior and named close buttons; mic has no accessible name; clickable answer headers are non-keyboard divs. | Accessible dialog primitives, keyboard controls and named actions; page/ExitClassModal/TeacherSelectModal. |
| B24 | code | Session mastery output is ignored; quiz scores/time/streaks/board checkpoints are not persisted; connection badge is initialized connected without network evidence. | Unified lesson state, real measured outcomes, Firestore rules and explicit offline state; hook/page/new lessonState. |
| B25 | code | Speed/difficulty/teacher state is duplicated; difficulty UI does not update the hook's enrollment level and navigation wipes conversation. | Single state owner; preserve per-lesson memory and consistent resume preferences. |

Official sources for B10: [Python tutorial](https://docs.python.org/3.15/tutorial/datastructures.html) and [Python data model](https://docs.python.org/3/reference/datamodel.html).

## Missing capabilities (not pre-existing bugs)

No rigged GLB/FBX assets, TalkingHead/HeadTTS integration, react-three-fiber scene, emotion/gesture/movement engines, cinematic director, live whiteboard texture, phoneme clock, staged lesson controller or structured classroom SSE event contract are present in this checkout. The main page calls Next.js JSON Q&A; Python provides a separate generic streaming chat endpoint, not the requested timed classroom event pipeline. Reuse and extend that SSE transport rather than claim it is already connected.

## Safe reuse and dead-code boundaries

Reuse: voice cancellation behavior, browser TTS fallback, real course navigation, Mermaid strict rendering, existing Auth/Firebase setup, stored notes, actual CodingLab component, and SSE ChatPanel functionality after transport/lifecycle repairs.

Source import search finds no external consumers for TeacherAvatar, HumanTeacher3D, InteractiveDiagram, ConceptDiagram, CodingLabModal, AudioPlayer, CalendarIntegration, PomodoroTimer, StudentDashboard, NotesGenerator and ChatPanel. This does not justify removing their functionality: ChatPanel must become Ask AURA; export and sandbox features must be retained. Remove obsolete avatar/fake-runner implementations only after the replacements are connected and tested. Do not delete user assets or unrelated resume work.

## Phase gates

0. Audit + narrowly scoped safety fixes. Preserve all existing features; add regression tests.
1. Single scene-owned R3F canvas, room themes, board, cinematic/orbit camera, loading and WebGL failure fallback. No portrait-as-3D claim.
2. Licensed female/male rigged GLBs, named skeleton/morph validation, living idle, emotions, HeadTTS speech timestamps. Keep five identities as profiles; exact portrait likeness requires matching authored models.
3. Retargeted gesture clips, masks/priority/crossfade, locomotion waypoints and debug panel. Verify feet do not slide.
4. Live canvas board, staged writing/highlight/erase and captions tied to the speech clock.
5. TeacherAgent hook/goal/chunks/example/check/adapt/practice/recap, typed JSON SSE, cancellation, rate-limit/offline handling and robotState compatibility.
6. Stage-first UI, Ask AURA drawer, responsive controls, Firestore scoped progress and real PDF/Markdown notes, accessibility.
7. Regression and actual performance checks, Chrome/Edge/mobile Chrome, long-audio drift, WebGL/model failures, Vercel build/deploy verification. Never report FPS targets as measured without measurements.

Primary references: [TalkingHead](https://github.com/met4citizen/TalkingHead) and [HeadTTS](https://github.com/met4citizen/HeadTTS). Verify model/clip licensing separately from library licensing. HeadTTS browser model inference should not be assumed to fit a Vercel serverless function.

## What cannot yet be certified

No real-device mic test, Edge/mobile Chrome runtime test, live SSE reconnect test, long-audio viseme drift measurement, heap profile, production Firestore rule verification, GPU FPS measurement or successful production deployment. Existing passing tests are baseline checks, not acceptance certification.

## Phase 0 corrections made after the audit checkpoint

- B01: completion guard enforced for modal and download; removed invented student name, honors label and fixed record ID; new completions use a completion grade rather than an invented mastery score. Reload preserves completed status. This remains a local completion record, not cryptographically verified certification.
- B02: student/course-scoped session key; authenticated students never restore unowned legacy notes; course/account changes clear notes and current feed. Guest legacy compatibility retained without deleting old data. Firestore synchronization is not yet implemented.
- B04: model/student strings escaped before HTML note/certificate export. Export format remains HTML pending Phase 6.
- B06: STT aborted before narration/questions; recognition error/start failures restore idle; mic button named. Physical-device recognition remains unverified.
- B09: valid history forwarded to backend teacher; malformed non-list history becomes empty context.
- B10: tuple teaching corrected; implementation details are qualified.

Files: `src/lib/classroom/safety.ts`, `src/hooks/useClassroomState.ts`, `src/app/classroom/page.tsx`, `src/lib/constants/syllabi.ts`, `src/lib/utils/userData.ts`, `backend/app/api/agent_routes.py`, `scripts/test-teacher-runtime.cjs`, `backend/tests/test_teacher_history_route.py`.

Verification: production build passed; TypeScript passed; 14 runtime tests + 3 image-source tests + 13 backend tests passed. Additional tests verify auth hydration does not expose legacy notes and known user-scoped enrollments retain progress. Chrome at lesson 2/7 shows a completion-required message and no certificate dialog. Screenshot: `scratch/phase-0-safety-check.png`.

How to test: open `/classroom?course=1`; before finishing, click Certificate (must refuse export). Read the tuple lesson (must distinguish tuple slots from mutable contents). Run the two Node test scripts and `pytest backend/tests/test_teacher_agent.py backend/tests/test_teacher_history_route.py`. Account isolation is covered with two simulated students; signed-in Firestore integration still needs real-account testing.

## Phase 1 room foundation

New files: `src/components/classroom/stage/Scene.tsx`, `src/components/classroom/stage/Stage.tsx`, `src/app/classroom/studio/page.tsx`. Added React-18-compatible `@react-three/fiber@8.18.0` ([official React/Fiber pairing guidance](https://r3f.docs.pmnd.rs/getting-started/introduction)); pinned Three.js and its types to 0.180.0 to avoid the Clock deprecation emitted by 0.186 with Fiber 8. Install scripts blocked by the environment were not approved or bypassed; the production build works without enabling them.

Preview URL: `/classroom/studio?course=1`. One WebGL canvas renders a procedural room, smartboard texture, desk/chairs/windows/books/globe, directional shadows, four theme palettes with library/lab props, demand rendering, cinematic camera positions, free orbit and explicit low/medium/high quality. Static accessible board fallback and context-loss handling preserve lesson content. Audio replay and the actual coding-lab link remain available. Current live classroom is not replaced prematurely.

How to test: switch all four room themes; choose Wide/Board/Teacher/Shoulder camera and Free orbit; use quality control; choose another lesson and check smartboard content; toggle Accessible board view; load `?course=1&fallback=1` for fallback QA; replay/stop the saved lesson; return to live class. Verify narrow viewport controls and keyboard operation.

Still pending in Phase 1: measured auto FPS scaling, postprocessing depth of field/ambient occlusion and real-device WebGL-loss recovery QA. Rigged teachers, speech-clock cues, live writing and the staged teaching flow are Phases 2–5, not features of this room preview. No FPS or photorealism guarantee is made.

Final Phase 1 foundation verification: production build passed with the new route; Chrome verified four themes, five camera selections, real orbit dragging, Low-to-Medium quality switching, accessible fallback content and one DOM rendering canvas. At 390 x 844 the preview page did not overflow horizontally and Return to live class remained within the viewport. Temporary viewport override was reset. A fresh room preview tab had no captured console errors/warnings on initial render. Screenshot: `scratch/phase-1-classroom-room.png`.

An earlier tab captured an asynchronous browser message-channel error while the tab was subsequently used for the live classroom. Its origin is not established and it did not reproduce on the fresh room tab; do not interpret the fresh-tab check as global zero-error certification. The user's active live lesson was not navigated away from; a separate final preview tab was opened.
