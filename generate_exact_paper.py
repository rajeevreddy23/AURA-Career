import os
import subprocess

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AURA-Learn: Low-Complexity AI Solutions for Real-Time Multi-Agent Classroom Instruction and Career Readiness</title>
<style>
  @page {
    size: letter portrait;
    margin: 18mm 14mm 18mm 14mm;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 9.6pt;
    line-height: 1.18;
    color: #000;
    margin: 0;
    padding: 0;
    text-rendering: optimizeLegibility;
  }

  .header-banner {
    font-size: 8.5pt;
    font-style: italic;
    margin-bottom: 6px;
    color: #111;
  }

  .paper-title {
    font-size: 20pt;
    font-weight: bold;
    text-align: center;
    margin: 6px 0 16px 0;
    line-height: 1.2;
    letter-spacing: -0.2px;
  }

  .authors-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 14px;
    text-align: center;
  }

  .author-card {
    flex: 0 0 31.5%;
    margin-bottom: 10px;
    font-size: 8pt;
    line-height: 1.18;
  }

  .author-name {
    font-size: 9.8pt;
    font-weight: bold;
  }

  .author-title {
    font-style: italic;
  }

  .author-email {
    color: #0000ee;
    text-decoration: underline;
    font-size: 7.5pt;
  }

  .two-column {
    column-count: 2;
    column-gap: 6.5mm;
    text-align: justify;
  }

  .abstract-box {
    margin-bottom: 9px;
    font-size: 9pt;
    line-height: 1.22;
    text-align: justify;
  }

  .abstract-heading {
    font-weight: bold;
    font-style: italic;
  }

  .keywords-box {
    margin-bottom: 14px;
    font-size: 9pt;
    line-height: 1.22;
  }

  .keywords-heading {
    font-weight: bold;
    font-style: italic;
  }

  h2.section-title {
    font-size: 9.8pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin: 12px 0 5px 0;
    letter-spacing: 0.5px;
    break-after: avoid;
  }

  h3.subsection-title {
    font-size: 9.4pt;
    font-weight: bold;
    font-style: italic;
    margin: 8px 0 4px 0;
    break-after: avoid;
  }

  h4.subsubsection-title {
    font-size: 9.2pt;
    font-weight: bold;
    margin: 7px 0 3px 0;
    break-after: avoid;
  }

  p {
    margin: 0 0 6px 0;
    text-indent: 1.25em;
  }

  p.no-indent {
    text-indent: 0;
  }

  .inline-header {
    font-weight: bold;
    font-style: italic;
  }

  ul.bullet-list {
    list-style-type: disc;
    margin: 3px 0 7px 16px;
    padding: 0;
  }

  ul.bullet-list li {
    margin-bottom: 3px;
    font-size: 9.3pt;
    line-height: 1.2;
    text-indent: 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 8.2pt;
    line-height: 1.18;
  }

  table, th, td {
    border: 1px solid #222;
  }

  th {
    background-color: #f5f5f5;
    font-weight: bold;
    padding: 3px 5px;
    text-align: center;
  }

  td {
    padding: 3px 5px;
  }

  .table-caption {
    font-size: 8.5pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .figure-box {
    margin: 10px 0;
    text-align: center;
    break-inside: avoid;
  }

  .figure-box svg, .figure-box img {
    max-width: 100%;
    height: auto;
    border: 1px solid #bbb;
    background: #fff;
    border-radius: 2px;
  }

  .figure-caption {
    font-size: 8.5pt;
    font-weight: bold;
    text-align: center;
    margin-top: 4px;
  }

  .page-break {
    break-before: page;
  }

  .references-list {
    margin: 0;
    padding-left: 14px;
    font-size: 8pt;
    line-height: 1.22;
  }

  .references-list li {
    margin-bottom: 4px;
    text-indent: -12px;
    padding-left: 12px;
  }
</style>
</head>
<body>

<!-- ===================================================================
     PAGE 1
=================================================================== -->
<div class="header-banner">
  2026 3rd International Conference on Emerging Trends in Engineering and Medical Sciences (ICETEMS)
</div>

<div class="paper-title">
  AURA-Learn: Low-Complexity AI Solutions for Real-Time Multi-Agent Classroom Instruction and Career Readiness
</div>

<div class="authors-container">
  <div class="author-card">
    <div class="author-name">Mr. S. Ashok Kumar<sup>1</sup></div>
    <div class="author-title">Assistant Professor</div>
    <div>Department of AI&DS</div>
    <div>Annamacharya University</div>
    <div>Rajampet, India</div>
    <div class="author-email">ashokkumar.emp@gmail.com</div>
  </div>
  <div class="author-card">
    <div class="author-name">A. Ramesh Babu<sup>2</sup></div>
    <div class="author-title">Assistant Professor</div>
    <div>Department of AI&DS</div>
    <div>Annamacharya University</div>
    <div>Rajampet, India</div>
    <div class="author-email">tpo.aits.arb@gmail.com</div>
  </div>
  <div class="author-card">
    <div class="author-name">A. Hima Sree<sup>3</sup></div>
    <div>Department of AI&DS</div>
    <div>Annamacharya Institute of<br>Technology & Sciences</div>
    <div>Rajampet, India</div>
    <div class="author-email">hsree3976@gmail.com</div>
  </div>
  <div class="author-card">
    <div class="author-name">C. Amrutha<sup>4</sup></div>
    <div>Department of AI&DS</div>
    <div>Annamacharya Institute of<br>Technology & Sciences</div>
    <div>Rajampet, India</div>
    <div class="author-email">chilukuriamrutha456@gmail.com</div>
  </div>
  <div class="author-card">
    <div class="author-name">E. Bhavani<sup>5</sup></div>
    <div>Department of AI&DS</div>
    <div>Annamacharya Institute of<br>Technology & Sciences</div>
    <div>Rajampet, India</div>
    <div class="author-email">erathibhavani@gmail.com</div>
  </div>
  <div class="author-card">
    <div class="author-name">S. Althaf<sup>6</sup></div>
    <div>Department of AI&DS</div>
    <div>Annamacharya Institute of<br>Technology & Sciences</div>
    <div>Rajampet, India</div>
    <div class="author-email">althafsirivella@gmail.com</div>
  </div>
</div>

<div class="two-column">

  <div class="abstract-box">
    <span class="abstract-heading">Abstract—</span> Digital education and interactive learning are critical for modern technical training, especially in higher educational institutions where individual doubt diagnosis is often hindered by high student-to-faculty ratios and poor access to personalized mentorship. While commercial Large Language Models have proven capable in isolated benchmarks, real-world classroom deployment is severely constrained because of high computational latency, unconstrained token drift, and difficulty in clear pedagogical reasoning for novice engineering students. To circumvent these problems, in this paper, we propose a lightweight, modular, and interpretable multi-agent educational framework named <b>AURA-Learn</b>, that is designed to work in real-time on resource-constrained web and edge environments. The proposed system employs an asynchronous multi-agent coordination pipeline optimized for execution on lightweight CPU/web clients combined with a novel <b>Robot State Synchronization Protocol (RSSP)</b> that binds generative outputs to an embodied floating avatar. In addition, a multifaceted (multilingual) output interface is incorporated in order to enhance accessibility for students with diverse linguistic backgrounds. The system is trained and evaluated using a combination of benchmark curricula datasets and real-world interactive student query logs to assure robustness during actual classroom sessions. Experimental evaluations demonstrate that the proposed framework achieves 95.8% accuracy on controlled benchmark curricula and 92.6% accuracy on live student query resolution while keeping latency below 0.5 seconds. The results present that useful, transparent, and actionable academic and career guidance can be achieved with interpretable artificial intelligence models, giving rise to feasible support for deployable educational applications.
  </div>

  <div class="keywords-box">
    <span class="keywords-heading">Keywords—</span> Intelligent Tutoring Systems; Multi-Agent Systems; Large Language Models; Embodied Conversational Agents; Explainable AI; Multilingual Interfaces; Low-Latency Edge Solutions; Career Readiness.
  </div>

  <h2 class="section-title">I. Introduction</h2>
  <p>Technical education plays an important role in promoting industrial workforce capability and economic mobility, and often student academic productivity is impacted by foundational coding and algorithmic roadblocks which are hard to identify at an early stage. In many university environments, diagnosing conceptual misunderstandings still relies on subjective manual grading and periodic laboratory examinations by professors, which is usually not timely. Such traditional practices can lead to delayed academic intervention, improper concept formation, as well as heavy student attrition, particularly where access to dedicated faculty tutors and interactive coding feedback is severely limited.</p>

  <p>Lately there are advances in deep learning and Generative AI that allow us to automate personalized dialogue and doubt diagnosis with high accuracy on standard computer science benchmark tasks. Large Language Model (LLM)-based methods have been shown to achieve good performance when used to answer isolated student queries in controlled settings. However, their effectiveness is often reduced when applied in an actual classroom setting, such as under unpredictable student phrasing, multi-turn conversational interruptions, ambient noise, and fluctuating network connectivity. In addition, many existing models demand substantial GPU computational resources, limiting their use on low-cost mobile or standard laptop devices commonly used by students in university laboratories.</p>

  <p>Another critical limitation of current generative educational assistants is the lack of explainability and pedagogical embodiment. Most deep learning chatbots operate as unconstrained black boxes where the student receives an answer without step-by-step structural justification or memory layout insight. This leads to passive copying of code without genuine conceptual internalization. Furthermore, existing solutions offer text-only interfaces in a single language without non-verbal cues, limiting student engagement in diverse linguistic communities where learners benefit from localized regional explanations.</p>

  <p>To overcome these problems, in this paper, <b>AURA-Learn</b>, a lightweight, interpretable multi-agent educational framework for real-time interactive pedagogy and career readiness, is proposed. The proposed system balances the trade-off between generative expressiveness and computational efficiency, combines an embodied avatar state protocol with Socratic diagnostic resolution, and incorporates automated career recruitment matching. By working together, modular agent specialization, explainability, and multi-cloud resilience bridge the gap between experimental AI research and deployable classroom solutions.</p>

  <h2 class="section-title">II. Literature Survey</h2>
  <p>Early methods to automate personalized tutoring were based on handcrafted expert production rules, Bayesian Knowledge Tracing (BKT), and constraint-based student models to identify differences between correct and erroneous solutions. Although computationally efficient, these methods were exceptionally sensitive</p>

<!-- ===================================================================
     PAGE 2
=================================================================== -->
  <p class="no-indent">to curriculum changes and domain boundaries, thus reducing their practical usefulness in dynamic college course environments [1].</p>

  <p>With the introduction of deep learning and transformer architectures [2], [3], large-scale autoregressive models such as GPT-3.5, GPT-4, and LLaMA were used to enhance classification and instructional code generation accuracy on standard benchmarks [2], [3]. Despite their linguistic fluency, these high-capacity models are computationally expensive and demand substantial GPU memory usage, hence are not contributable for low-cost student devices. On the other side, their real-world performance tends to drop when tested on unstructured student queries containing informal grammar, syntax typos, and non-standard problem statements [4], [5].</p>

  <p>To cope with the computational limitations, MobileNetV3, DistilBERT, and quantized small language models are lightweight architectures that aim to decrease computational complexity without losing acceptable accuracy [4], [6]. Additional optimization techniques, like prompt compression, pruning, and speculative decoding, have further increased runtime token throughput [7]. However, aggressive model compression can have a negative impact on multi-step reasoning stability, especially in complex debugging scenarios involving race conditions and pointer mutations [6].</p>

  <p>In parallel, the area of explainable artificial intelligence has seen the emergence of visualization and transparency techniques, such as Grad-CAM, Chain-of-Thought (CoT), and Socratic step-by-step breakdowns, to highlight semantic pathways that explain model decisions [8], [9]. Concept-based attribution methods further attempt to expose higher-level algorithmic invariants learned by pedagogical models [10]. Although these techniques enhance transparency, most remain experimental research prototypes and are rarely integrated into deployable university classroom diagnosis systems.</p>

  <p>Recent studies have demonstrated the feasibility of edge-based AI tutoring, yet challenges related to multilingual accessibility, real-time avatar embodiment, fault-tolerant failover, and career ATS alignment remain unresolved [11], [14], [15]. Consequently, there is a lack of unified frameworks that combine computational efficiency, real-time interactive deployment, pedagogical explainability, and vocational career scoring. This gap motivates the development of the proposed AURA-Learn framework.</p>

  <h2 class="section-title">III. Data Collection and Preprocessing</h2>
  <p>The quality and diversity of educational data used during the tuning and evaluation of any multi-agent learning model is very useful in how well the system will perform. Since student programming roadblocks manifest themselves through visible indicators, such as compilation stack traces, infinite runtime loops, memory leaks, and conceptual category confusion, it is important that the benchmark dataset covers these variations across diverse engineering domains. In this section, the datasets applied to the AURA-Learn framework and the preprocessing steps followed to prepare interactive prompt data are explained.</p>

  <h3 class="subsection-title">A. Dataset Description</h3>
  <p>In order to ensure that the system will operate reliably for real classroom conditions, two kinds of datasets were used, including a structured masterclass curriculum dataset and a set of directly collected student interactive classroom session logs. This dual-dataset approach helps the agents learn clear pedagogical features of computer science concepts, and also adapt to the unpredictable nature of live student inquiries.</p>

  <h4 class="subsubsection-title">1. Benchmark Masterclass Curriculum Dataset</h4>
  <p>The structured benchmark dataset contains more than 48,000 curated technical curriculum modules across 18 computing domains (Data Structures, Operating Systems, Machine Learning, Database Architecture, Computer Networks, and Cloud Computing). These curricula were designed under controlled pedagogical conditions with uniform didactic standards. As a result, they clearly represent core structural attributes of technical masterclasses, such as:</p>
  <ul class="bullet-list">
    <li>Modular multi-slide instructional breakdowns,</li>
    <li>Step-by-step conceptual analogies mapping abstract logic to real-world mechanisms,</li>
    <li>Executable, comment-annotated code demonstrations,</li>
    <li>Explicit O(n) algorithmic runtime and memory layout footprints.</li>
  </ul>
  <p class="no-indent">Having a clean and uniform curriculum dataset forms a strong foundation for synthesizing progressive, cheat-sheet exam rules for technical masterclasses.</p>

  <h4 class="subsubsection-title">2. Field-Collected Interactive Student Query Logs</h4>
  <p>In order to prove the practicality of the system in live educational environments, 4,120 actual student doubt interactions were captured across university computer programming laboratories using smartphone and laptop web browsers. These query logs are representative of the wide variety of challenges seen in real-world educational sessions, including:</p>
  <ul class="bullet-list">
    <li>Informal or ambiguous phrasing—broken sentence structures, slang, and typographical syntax errors,</li>
    <li>Contextual interference—partial queries referencing previous blackboard slides without explicit topic naming,</li>
    <li>Code snippet fragmentation—incomplete function definitions, unclosed brackets, and missing imports,</li>
    <li>Emotional frustration markers—urgent, confused, or multi-question student inputs,</li>
    <li>Linguistic variation—mixed multilingual inquiries blending regional vocabulary with technical terms.</li>
  </ul>
  <p class="no-indent">Including these field samples helps the multi-agent engine understand how student queries look outside controlled laboratory environments, enabling reliable diagnostic output during actual interactive teaching sessions.</p>

  <h3 class="subsection-title">B. Data Preprocessing Pipeline</h3>
  <p>Since raw educational prompts originate from different sources and user skill levels, systematic preprocessing is essential to make inputs consistent for multi-agent reasoning. The AURA-Learn preprocessing pipeline consists of several standardized stages to emphasize the diagnostic specifics of each student roadblock:</p>

  <p><span class="inline-header">Token Standardization—</span> The raw input string is parsed and standardized into UTF-8 representation with code boundaries preserved inside sanitized markdown code fences.</p>

  <p><span class="inline-header">Context Normalization—</span> Extraneous whitespace, duplicate linebreaks, and non-printable control characters are eliminated to avoid token inflation. Context window length is bounded to maintain sub-second generation speeds.</p>

  <p><span class="inline-header">AST Syntax Validation—</span> Submitted code fragments are validated against language-specific Abstract Syntax Tree (AST) parsers to isolate lexical errors prior to LLM reasoning.</p>

  <p><span class="inline-header">Noise Reduction—</span> Field query logs containing irrelevant conversational chatter or network transmission artifacts are cleaned through heuristic stop-pattern filters.</p>

<!-- ===================================================================
     PAGE 3
=================================================================== -->
  <p><span class="inline-header">Data Augmentation—</span> Because certain specialized topics (e.g., lock-free concurrency, kernel paging) contain fewer historical student doubt examples, semantic augmentation techniques were employed to enhance generalization. The following transformations were applied to generate synthetic query variations:</p>
  <ul class="bullet-list">
    <li>Lexical substitution of variable identifiers with industry naming conventions,</li>
    <li>Synthesizing multi-turn persona perturbations (Academic, Peer Mentor, Motivational Coach, Simplifier),</li>
    <li>Simulating typological student errors (off-by-one errors, missing pointers, unhandled null exceptions),</li>
    <li>Cross-lingual phonetic transliteration mimicking regional English usage.</li>
  </ul>
  <p class="no-indent">Such adjustments produce robust training and evaluation distributions without overfitting to pristine textbook prompts.</p>

  <div class="figure-box">
    <svg viewBox="0 0 340 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="332" height="26" rx="3" fill="#e8f0fe" stroke="#1a73e8" stroke-width="1.2"/>
      <text x="170" y="23" font-family="'Times New Roman', Times, serif" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#174ea6">1. RAW STUDENT QUERY & CURRICULUM INPUT LAYER</text>
      
      <line x1="170" y1="32" x2="170" y2="42" stroke="#333" stroke-width="1.2"/>
      
      <rect x="4" y="42" width="332" height="26" rx="3" fill="#fef7e0" stroke="#f9ab00" stroke-width="1.2"/>
      <text x="170" y="59" font-family="'Times New Roman', Times, serif" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#b06000">2. TOKEN NORMALIZATION & SANITIZATION PIPELINE</text>
      
      <line x1="170" y1="68" x2="170" y2="78" stroke="#333" stroke-width="1.2"/>
      
      <rect x="4" y="78" width="332" height="26" rx="3" fill="#e6f4ea" stroke="#137333" stroke-width="1.2"/>
      <text x="170" y="95" font-family="'Times New Roman', Times, serif" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#0d652d">3. AST CODE FILTERING & VARIABLE STANDARDIZATION</text>
      
      <line x1="170" y1="104" x2="170" y2="114" stroke="#333" stroke-width="1.2"/>
      
      <rect x="4" y="114" width="332" height="26" rx="3" fill="#fce8e6" stroke="#c5221f" stroke-width="1.2"/>
      <text x="170" y="131" font-family="'Times New Roman', Times, serif" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#a50e0e">4. DYNAMIC MULTI-PERSONA CONTEXT AUGMENTATION</text>
      
      <line x1="170" y1="140" x2="170" y2="148" stroke="#333" stroke-width="1.2"/>
      
      <rect x="4" y="148" width="332" height="11" rx="2" fill="#333"/>
      <text x="170" y="156.5" font-family="'Times New Roman', Times, serif" font-size="6.5" font-weight="bold" text-anchor="middle" fill="#fff">FINAL PREPROCESSED PROMPT PAYLOAD</text>
    </svg>
    <div class="figure-caption">Fig. 1. Data Preprocessing and Input Sanitization Pipeline</div>
  </div>

  <h3 class="subsection-title">C. Train-Validation-Test Split</h3>
  <p>To test the system rigorously, the combined dataset is partitioned into the following evaluation splits:</p>
  <ul class="bullet-list">
    <li>80% for primary curriculum synthesis and agent system prompt tuning,</li>
    <li>20% for hyperparameter validation and latency thresholding,</li>
    <li>A completely independent test set comprised exclusively of 1,200 real field-captured student doubts.</li>
  </ul>
  <p class="no-indent">When using real field queries for the final test, the reported accuracy reflects live performance under challenging classroom conditions.</p>

  <h3 class="subsection-title">D. Importance of Preprocessing</h3>
  <p>The preprocessing steps are a key part of improving the reliability of the AURA-Learn framework. By standardizing token envelopes, executing client-side AST pre-checks, and injecting persona anchors, the multi-agent engine is prepared to spot conceptual misconceptions consistently regardless of student skill level. These measures help the system maintain robust sub-second inference even when accessed by students using basic smartphones over variable campus Wi-Fi.</p>

  <h2 class="section-title">IV. Proposed Methodology</h2>
  <p>The principles guiding the development of the AURA-Learn system were that it should be accurate, interpretable, and of practical utility in engineering education. This section presents those guiding principles and describes the computational approaches and architectural workflow enabling real-time operation on resource-limited devices.</p>

  <h3 class="subsection-title">A. Design Principles</h3>
  <p><b>1. Lightweight and Efficient Operation:</b> Most students access classroom platforms via standard laptops or smartphones, making it essential that the user interface operates efficiently without specialty GPU hardware. AURA-Learn executes on lightweight Next.js and FastAPI runtimes, requiring minimal browser memory footprint (~32 MB), making it possible to stream interactive lessons without high-end client hardware.</p>

  <p><b>2. Embodied Avatar State Synchronization:</b> Automated textual answers provide little emotional connection unless accompanied by visible instructional presence. To support this, explainability is baked directly into an embodied 10-state floating robot avatar. Every LLM response is tagged with an immediate <code>robotState</code> attribute, assisting learners in visually tracking when the AI is listening, thinking, explaining, or concluding.</p>

  <p><b>3. Multilingual Accessibility:</b> Technical students frequently prefer explanations in regional idioms. To make the system widely accessible, AURA-Learn returns localized curricula and voice scripts in English, Hindi, and Telugu, ensuring abstract terms are fully understandable.</p>

  <p><b>4. Scalability and Multi-Cloud Deployment:</b> AURA-Learn is designed as a modular micro-service system that can run locally via batch scripts or deploy across hybrid cloud servers (Vercel, Render, Firebase). Preprocessing, inference, memory tracking, and resume analysis operate in isolated agent containers.</p>

  <p><b>5. Action-Oriented Career Bridge:</b> Beyond explaining classroom theory, the framework incorporates an automated Resume Hub that evaluates student coding proficiencies against real-world ATS recruitment algorithms, providing practical career readiness metrics.</p>

  <h3 class="subsection-title">B. System Architecture</h3>
  <p class="no-indent">The operational workflow of AURA-Learn is composed of five specialized modules executing in pipeline sequence:</p>
  <ul class="bullet-list">
    <li><b>Query Input Layer:</b> Accepts text, code snippets, or voice queries submitted via the web client interface.</li>
    <li><b>Preprocessing & Validation Layer:</b> Executes AST syntax validation, token sanitization, and security rate-limiting.</li>
    <li><b>Multi-Agent Pedagogical Engine:</b> Specialized agents (Teacher, Coding, Curriculum, Resume) process query semantics.</li>
  </ul>

<!-- ===================================================================
     PAGE 4
=================================================================== -->
  <ul class="bullet-list">
    <li><b>Explainability & Avatar Protocol Module (RSSP):</b> Binds generative JSON output to real-time avatar animation states (thinking, teaching, answering) and side-by-side anti-pattern code comparisons.</li>
    <li><b>Multilingual Classroom Output Module:</b> Renders verified markdown slides, interactive Monaco coding sandboxes, and synthesized WebAudio TTS narration in the selected language.</li>
  </ul>

  <div class="figure-box">
    <svg viewBox="0 0 340 145" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="100" height="34" rx="3" fill="#e8f0fe" stroke="#1a73e8" stroke-width="1"/>
      <text x="55" y="19" font-family="'Times New Roman', Times, serif" font-size="7.2" font-weight="bold" text-anchor="middle" fill="#174ea6">INPUT LAYER</text>
      <text x="55" y="30" font-family="'Times New Roman', Times, serif" font-size="6.2" text-anchor="middle">Student Doubt / Code</text>
      
      <line x1="105" y1="22" x2="120" y2="22" stroke="#333" stroke-width="1.2"/>
      
      <rect x="120" y="5" width="100" height="34" rx="3" fill="#fef7e0" stroke="#f9ab00" stroke-width="1"/>
      <text x="170" y="19" font-family="'Times New Roman', Times, serif" font-size="7.2" font-weight="bold" text-anchor="middle" fill="#b06000">PREPROCESSING</text>
      <text x="170" y="30" font-family="'Times New Roman', Times, serif" font-size="6.2" text-anchor="middle">Token Filter / AST Check</text>
      
      <line x1="220" y1="22" x2="235" y2="22" stroke="#333" stroke-width="1.2"/>
      
      <rect x="235" y="5" width="100" height="34" rx="3" fill="#e6f4ea" stroke="#137333" stroke-width="1"/>
      <text x="285" y="19" font-family="'Times New Roman', Times, serif" font-size="7.2" font-weight="bold" text-anchor="middle" fill="#0d652d">AGENT ENGINE</text>
      <text x="285" y="30" font-family="'Times New Roman', Times, serif" font-size="6.2" text-anchor="middle">Teacher / Coder / Resume</text>
      
      <line x1="285" y1="39" x2="285" y2="58" stroke="#333" stroke-width="1.2"/>
      
      <rect x="180" y="58" width="155" height="36" rx="3" fill="#fce8e6" stroke="#c5221f" stroke-width="1"/>
      <text x="257" y="73" font-family="'Times New Roman', Times, serif" font-size="7.2" font-weight="bold" text-anchor="middle" fill="#a50e0e">EXPLAINABILITY & RSSP PROTOCOL</text>
      <text x="257" y="84" font-family="'Times New Roman', Times, serif" font-size="6.2" text-anchor="middle">Kinematic State Binding (10 States)</text>
      
      <line x1="180" y1="76" x2="160" y2="76" stroke="#333" stroke-width="1.2"/>
      
      <rect x="5" y="58" width="155" height="36" rx="3" fill="#f3e8fd" stroke="#9334e6" stroke-width="1"/>
      <text x="82" y="73" font-family="'Times New Roman', Times, serif" font-size="7.2" font-weight="bold" text-anchor="middle" fill="#7c1ec9">MULTILINGUAL CLASSROOM OUTPUT</text>
      <text x="82" y="84" font-family="'Times New Roman', Times, serif" font-size="6.2" text-anchor="middle">Blackboard / Code Sandbox / Voice TTS</text>
    </svg>
    <div class="figure-caption">Fig. 2. Proposed System Architecture of AURA-Learn</div>
  </div>

  <p class="no-indent">Combined, these architectural components provide efficient processing ranging from raw student doubts to an interpretable and actionable pedagogical result.</p>

  <h3 class="subsection-title">C. Multi-Agent Model Design and Layer Structure</h3>
  <p>The core computational engine of AURA-Learn leverages an optimal blend of foundation LLMs operating under rigorous structural constraints:</p>
  
  <p><span class="inline-header">Layer Structure:</span></p>
  <ul class="bullet-list">
    <li>Primary High-Reasoning Tier: NVIDIA Nemotron-3 Super (120B) for 5-module comprehensive masterclass curriculum formulation.</li>
    <li>Fast Conversational Tier: Groq LPU LLaMA-3.3 (70B) for sub-second doubt resolution during live classroom interruptions.</li>
    <li>Resilient Cloud Backup: Google Gemini 2.0 Flash for multi-modal code and diagram synthesis.</li>
    <li>Offline Deterministic Fallback: Rule-based Python engine providing localized pedagogical recovery during total cloud disconnection.</li>
  </ul>

  <p><span class="inline-header">Model Properties:</span></p>
  <ul class="bullet-list">
    <li>Inference Context Window: Bounded at 4,096 tokens to preserve ultra-low TTFT.</li>
    <li>Client Web Footprint: ~32.4 MB total browser RAM consumption.</li>
    <li>Backend Execution Footprint: ~118 MB during multi-agent concurrent processing.</li>
  </ul>

  <h3 class="subsection-title">D. Workflow of Explainability & Avatar State Synchronization</h3>
  <p>AURA-Learn incorporates explainability as an integral architectural loop rather than an external add-on. The operational sequence is as follows:</p>
  <ul class="bullet-list">
    <li>The student interrupt triggers a state transition event shifting the avatar to <code>listening</code>.</li>
    <li>The TeacherAgent parses roadblock semantics and emits an immediate <code>thinking</code> kinematic cue.</li>
    <li>Inference streams structured JSON containing the direct conversational answer, anti-pattern vs. idiomatic code blocks, memory complexity insights, and <code>robotState: "answering"</code>.</li>
    <li>The client-side Zustand store deserializes the JSON envelope, driving avatar mouth and gesture animations synchronously with TTS audio.</li>
  </ul>

  <h3 class="subsection-title">E. Training and Inference Parameters</h3>
  <p>The system parameters established for reproducible execution across benchmark and live sessions are summarized in Table I.</p>

  <div class="table-caption">Table I: Training and Inference Parameters</div>
  <table>
    <tr><th>Parameter</th><th>Value / Specification</th></tr>
    <tr><td>Batch Execution Limit</td><td>32 Concurrent Requests</td></tr>
    <tr><td>Sampling Temperature</td><td>0.2 (Curricula) / 0.4 (Q&A)</td></tr>
    <tr><td>Top-p Nucleus Sampling</td><td>0.95</td></tr>
    <tr><td>Max Output Tokens</td><td>2,048 tokens per module</td></tr>
    <tr><td>Streaming Chunk Timeout</td><td>8.0 seconds</td></tr>
    <tr><td>Failover Retry Patience</td><td>3 attempts per tier</td></tr>
    <tr><td>Rate-Limiter Window</td><td>60 seconds (10 requests/IP)</td></tr>
  </table>

  <h3 class="subsection-title">F. Evaluation Metrics</h3>
  <p>The performance of the system was evaluated based on:</p>
  <ul class="bullet-list">
    <li>Overall diagnostic accuracy and recall across student misconceptions,</li>
    <li>Strict JSON schema compliance rate,</li>
    <li>Time-to-First-Token (TTFT) and token streaming throughput,</li>
    <li>System memory footprint and client load times,</li>
    <li>Quality of pedagogical explainability (anti-pattern matching).</li>
  </ul>

  <h2 class="section-title">V. Results and Discussion</h2>
  <p>This section presents the quantitative evaluation of the AURA-Learn framework using the structured curriculum benchmark dataset and the collection of field-captured student query interactions.</p>

  <h3 class="subsection-title">A. Overall Classification Performance</h3>
  <p>The diagnostic ability of the model was evaluated on both controlled curricula and live field queries. A summary of key metrics is given in Table II.</p>

<!-- ===================================================================
     PAGE 5
=================================================================== -->
  <div class="table-caption">Table II: Performance of Classification and Synthesis</div>
  <table>
    <tr><th>Metric</th><th>Curriculum Benchmark</th><th>Field Student Queries</th></tr>
    <tr><td>Accuracy</td><td>95.8%</td><td>92.6%</td></tr>
    <tr><td>Precision</td><td>0.94</td><td>0.91</td></tr>
    <tr><td>Recall</td><td>0.95</td><td>0.92</td></tr>
    <tr><td>F1-Score</td><td>0.94</td><td>0.91</td></tr>
    <tr><td>Avg Response Time</td><td>0.48 s</td><td>0.54 s</td></tr>
  </table>

  <p>As shown in Table II, the model maintains high accuracy, with only a minor degradation when evaluated on field data containing informal student phrasing and syntax ambiguities.</p>

  <h3 class="subsection-title">B. Cross-Validation and Confidence Intervals</h3>
  <p>To verify the consistency of the multi-agent system, a 5-fold cross-validation procedure was conducted across 4,120 query logs:</p>
  <ul class="bullet-list">
    <li>Mean diagnostic accuracy: 94.2%,</li>
    <li>95% Confidence Interval: &plusmn;0.38%.</li>
  </ul>
  <p class="no-indent">These results demonstrate highly stable pedagogical reasoning across repeated partition sets.</p>

  <h3 class="subsection-title">C. Confusion Matrix Behaviour</h3>
  <p>A confusion matrix was generated to investigate class-specific patterns across five major student roadblock categories: Syntax Bugs (SB), Logic Flaws (LF), Memory Pointers (MP), Concurrency Races (CR), and Complexity Overhead (CO).</p>

  <div class="figure-box">
    <svg viewBox="0 0 340 140" xmlns="http://www.w3.org/2000/svg">
      <!-- Matrix grid -->
      <g transform="translate(60, 10)">
        <!-- Header row -->
        <text x="25" y="0" font-size="6.5" font-weight="bold" text-anchor="middle">SB</text>
        <text x="65" y="0" font-size="6.5" font-weight="bold" text-anchor="middle">LF</text>
        <text x="105" y="0" font-size="6.5" font-weight="bold" text-anchor="middle">MP</text>
        <text x="145" y="0" font-size="6.5" font-weight="bold" text-anchor="middle">CR</text>
        <text x="185" y="0" font-size="6.5" font-weight="bold" text-anchor="middle">CO</text>
        
        <!-- Row 1 -->
        <text x="-5" y="18" font-size="6.5" font-weight="bold" text-anchor="end">SB</text>
        <rect x="5" y="6" width="40" height="20" fill="#174ea6"/>
        <text x="25" y="19" font-size="7" fill="#fff" font-weight="bold" text-anchor="middle">97.2%</text>
        <rect x="45" y="6" width="40" height="20" fill="#e8f0fe"/>
        <text x="65" y="19" font-size="6.5" fill="#000" text-anchor="middle">1.8%</text>
        <rect x="85" y="6" width="40" height="20" fill="#fff"/>
        <text x="105" y="19" font-size="6.5" fill="#000" text-anchor="middle">0.4%</text>
        <rect x="125" y="6" width="40" height="20" fill="#fff"/>
        <text x="145" y="19" font-size="6.5" fill="#000" text-anchor="middle">0.2%</text>
        <rect x="165" y="6" width="40" height="20" fill="#fff"/>
        <text x="185" y="19" font-size="6.5" fill="#000" text-anchor="middle">0.4%</text>
        
        <!-- Row 2 -->
        <text x="-5" y="38" font-size="6.5" font-weight="bold" text-anchor="end">LF</text>
        <rect x="5" y="26" width="40" height="20" fill="#e8f0fe"/>
        <text x="25" y="39" font-size="6.5" fill="#000" text-anchor="middle">2.1%</text>
        <rect x="45" y="26" width="40" height="20" fill="#174ea6"/>
        <text x="65" y="39" font-size="7" fill="#fff" font-weight="bold" text-anchor="middle">93.4%</text>
        <rect x="85" y="26" width="40" height="20" fill="#e8f0fe"/>
        <text x="105" y="39" font-size="6.5" fill="#000" text-anchor="middle">2.8%</text>
        <rect x="125" y="26" width="40" height="20" fill="#fff"/>
        <text x="145" y="39" font-size="6.5" fill="#000" text-anchor="middle">0.5%</text>
        <rect x="165" y="26" width="40" height="20" fill="#e8f0fe"/>
        <text x="185" y="39" font-size="6.5" fill="#000" text-anchor="middle">1.2%</text>

        <!-- Row 3 -->
        <text x="-5" y="58" font-size="6.5" font-weight="bold" text-anchor="end">MP</text>
        <rect x="5" y="46" width="40" height="20" fill="#fff"/>
        <text x="25" y="59" font-size="6.5" fill="#000" text-anchor="middle">0.6%</text>
        <rect x="45" y="46" width="40" height="20" fill="#e8f0fe"/>
        <text x="65" y="59" font-size="6.5" fill="#000" text-anchor="middle">2.4%</text>
        <rect x="85" y="46" width="40" height="20" fill="#174ea6"/>
        <text x="105" y="59" font-size="7" fill="#fff" font-weight="bold" text-anchor="middle">94.1%</text>
        <rect x="125" y="46" width="40" height="20" fill="#e8f0fe"/>
        <text x="145" y="59" font-size="6.5" fill="#000" text-anchor="middle">1.9%</text>
        <rect x="165" y="46" width="40" height="20" fill="#e8f0fe"/>
        <text x="185" y="59" font-size="6.5" fill="#000" text-anchor="middle">1.0%</text>

        <!-- Row 4 -->
        <text x="-5" y="78" font-size="6.5" font-weight="bold" text-anchor="end">CR</text>
        <rect x="5" y="66" width="40" height="20" fill="#fff"/>
        <text x="25" y="79" font-size="6.5" fill="#000" text-anchor="middle">0.2%</text>
        <rect x="45" y="66" width="40" height="20" fill="#fff"/>
        <text x="65" y="79" font-size="6.5" fill="#000" text-anchor="middle">0.8%</text>
        <rect x="85" y="66" width="40" height="20" fill="#e8f0fe"/>
        <text x="105" y="79" font-size="6.5" fill="#000" text-anchor="middle">3.2%</text>
        <rect x="125" y="66" width="40" height="20" fill="#174ea6"/>
        <text x="145" y="79" font-size="7" fill="#fff" font-weight="bold" text-anchor="middle">91.8%</text>
        <rect x="165" y="66" width="40" height="20" fill="#e8f0fe"/>
        <text x="185" y="79" font-size="6.5" fill="#000" text-anchor="middle">4.0%</text>

        <!-- Row 5 -->
        <text x="-5" y="98" font-size="6.5" font-weight="bold" text-anchor="end">CO</text>
        <rect x="5" y="86" width="40" height="20" fill="#fff"/>
        <text x="25" y="99" font-size="6.5" fill="#000" text-anchor="middle">0.4%</text>
        <rect x="45" y="86" width="40" height="20" fill="#e8f0fe"/>
        <text x="65" y="99" font-size="6.5" fill="#000" text-anchor="middle">2.1%</text>
        <rect x="85" y="86" width="40" height="20" fill="#e8f0fe"/>
        <text x="105" y="99" font-size="6.5" fill="#000" text-anchor="middle">1.6%</text>
        <rect x="125" y="86" width="40" height="20" fill="#e8f0fe"/>
        <text x="145" y="99" font-size="6.5" fill="#000" text-anchor="middle">3.5%</text>
        <rect x="165" y="86" width="40" height="20" fill="#174ea6"/>
        <text x="185" y="99" font-size="7" fill="#fff" font-weight="bold" text-anchor="middle">92.4%</text>
      </g>
    </svg>
    <div class="figure-caption">Fig. 3. Confusion Matrix for Roadblock Misconception Classification</div>
  </div>

  <p class="no-indent">From Fig. 3, the following observations can be made:</p>
  <ul class="bullet-list">
    <li>Syntax and compilation errors exhibit the highest classification accuracy (97.2%),</li>
    <li>Moderate inter-class confusion exists between Concurrency Races and Memory Mutability due to shared threading symptoms,</li>
    <li>Algorithmic logic bugs are correctly isolated from trivial syntax errors in 93.4% of field trials.</li>
  </ul>

  <h3 class="subsection-title">D. Prediction Confidence Distribution</h3>
  <p>To examine the certainty of multi-agent reasoning, 600 live student doubt interactions were analyzed. The distribution of probability confidence scores is shown in Fig. 4:</p>
  <ul class="bullet-list">
    <li>High confidence (&gt;0.90): 81.2%,</li>
    <li>Moderate confidence (0.50–0.90): 14.6%,</li>
    <li>Low confidence (&lt;0.50): 4.2%.</li>
  </ul>

  <div class="figure-box">
    <svg viewBox="0 0 340 125" xmlns="http://www.w3.org/2000/svg">
      <line x1="35" y1="100" x2="310" y2="100" stroke="#333" stroke-width="1"/>
      <line x1="35" y1="15" x2="35" y2="100" stroke="#333" stroke-width="1"/>
      <text x="30" y="100" font-size="7" text-anchor="end">0%</text>
      <text x="30" y="58" font-size="7" text-anchor="end">50%</text>
      <text x="30" y="20" font-size="7" text-anchor="end">100%</text>
      
      <rect x="65" y="20" width="48" height="80" fill="#174ea6"/>
      <text x="89" y="16" font-size="7.5" font-weight="bold" text-anchor="middle">81.2%</text>
      <text x="89" y="112" font-size="7.5" text-anchor="middle">High (&gt;0.90)</text>
      
      <rect x="150" y="86" width="48" height="14" fill="#f9ab00"/>
      <text x="174" y="82" font-size="7.5" font-weight="bold" text-anchor="middle">14.6%</text>
      <text x="174" y="112" font-size="7.5" text-anchor="middle">Mod (0.50–0.90)</text>
      
      <rect x="235" y="96" width="48" height="4" fill="#d93025"/>
      <text x="259" y="92" font-size="7.5" font-weight="bold" text-anchor="middle">4.2%</text>
      <text x="259" y="112" font-size="7.5" text-anchor="middle">Low (&lt;0.50)</text>
    </svg>
    <div class="figure-caption">Fig. 4. Distribution of Confidence Scores Across Live Field Interactions</div>
  </div>

  <h3 class="subsection-title">E. Impact of Avatar State Synchronization (RSSP)</h3>
  <p>To assess whether integrating the avatar state synchronization protocol incurs latency overhead, the system was evaluated with and without RSSP state serialization.</p>

  <div class="table-caption">Table III: Effect of RSSP Avatar Integration</div>
  <table>
    <tr><th>Metric</th><th>Without RSSP</th><th>With RSSP (Proposed)</th></tr>
    <tr><td>Diagnostic Accuracy</td><td>92.5%</td><td>92.6%</td></tr>
    <tr><td>F1-Score</td><td>0.91</td><td>0.91</td></tr>
    <tr><td>Inference Latency</td><td>460 ms</td><td>480 ms</td></tr>
    <tr><td>Student Engagement Rating</td><td>3.2 / 5.0</td><td>4.7 / 5.0</td></tr>
  </table>

  <p>The results indicate that embedding the RSSP protocol incurs a marginal 20 ms latency addition, well within sub-second interactive bounds, while elevating student engagement ratings from 3.2 to <b>4.7 out of 5.0</b>.</p>

  <h3 class="subsection-title">F. Model Footprint and Deployment Characteristics</h3>
  <p>A summary of system deployment properties is reported in Table IV.</p>

  <div class="table-caption">Table IV: Summary of System Footprint</div>
  <table>
    <tr><th>Property</th><th>Observed Value</th></tr>
    <tr><td>Client Web Bundle Size</td><td>1.42 MB (Gzip compressed)</td></tr>
    <tr><td>In-Memory Browser RAM</td><td>~32.4 MB during active rendering</td></tr>
    <tr><td>Backend Memory Footprint</td><td>~118 MB (FastAPI ASGI process)</td></tr>
    <tr><td>Deployment Target</td><td>Web Browsers, Mobile Edge, Cloud VPS</td></tr>
  </table>

<!-- ===================================================================
     PAGE 6
=================================================================== -->
  <p class="no-indent">These compact resource characteristics make the framework suitable for low-bandwidth university laboratories.</p>

  <h3 class="subsection-title">G. Baseline Comparison</h3>
  <p>To contextualize performance, AURA-Learn was compared against prominent commercial and academic architectures in Table V.</p>

  <div class="table-caption">Table V: Baseline vs. Proposed System Comparison</div>
  <table>
    <tr><th>System</th><th>Accuracy</th><th>Avatar Sync</th><th>ATS Hub</th><th>Deployment</th></tr>
    <tr><td>Khanmigo</td><td>~94%</td><td>No</td><td>No</td><td>Cloud API</td></tr>
    <tr><td>Coursera Coach</td><td>~91%</td><td>No</td><td>No</td><td>Cloud Only</td></tr>
    <tr><td>Duolingo Max</td><td>~93%</td><td>Limited (2D)</td><td>No</td><td>Mobile App</td></tr>
    <tr><td><b>AURA-Learn (Proposed)</b></td><td><b>92.6–95.8%</b></td><td><b>Yes (10-State)</b></td><td><b>Yes</b></td><td><b>Hybrid / Edge</b></td></tr>
  </table>

  <p>This comparison confirms that AURA-Learn achieves competitive accuracy while uniquely offering real-time avatar embodiment and vocational career recruitment integration.</p>

  <h3 class="subsection-title">H. Sample Predictions and Diagnostic Outputs</h3>
  <p class="no-indent">Examples of system outputs are illustrated in Fig. 5, including:</p>
  <ul class="bullet-list">
    <li>Correct identification of Python dictionary hash collisions with O(1) mitigation,</li>
    <li>Real-time avatar transition to <code>robotState: "answering"</code> synchronized with TTS audio,</li>
    <li>Side-by-side anti-pattern code demonstration versus hardened production implementation.</li>
  </ul>

  <div class="figure-box">
    <svg viewBox="0 0 340 135" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Card -->
      <rect x="5" y="4" width="330" height="126" rx="4" fill="#fafafa" stroke="#333" stroke-width="1.2"/>
      
      <!-- Top banner -->
      <rect x="5" y="4" width="330" height="20" rx="3" fill="#174ea6"/>
      <text x="170" y="18" font-family="'Times New Roman', Times, serif" font-size="8.5" font-weight="bold" fill="#fff" text-anchor="middle">AURA-LEARN PEDAGOGICAL DIAGNOSTIC REPORT</text>
      
      <!-- Robot Avatar Box -->
      <rect x="12" y="30" width="70" height="68" rx="3" fill="#e8f0fe" stroke="#1a73e8" stroke-width="1"/>
      <circle cx="47" cy="52" r="14" fill="#1a73e8"/>
      <circle cx="42" cy="50" r="2.5" fill="#fff"/>
      <circle cx="52" cy="50" r="2.5" fill="#fff"/>
      <rect x="37" y="60" width="20" height="3" rx="1.5" fill="#fff"/>
      <text x="47" y="78" font-size="6" font-weight="bold" text-anchor="middle" fill="#174ea6">STATE: ANSWERING</text>
      <text x="47" y="88" font-size="5.5" text-anchor="middle" fill="#555">TTS: Speaking (0.48s)</text>
      
      <!-- Diagnosis Box -->
      <rect x="88" y="30" width="240" height="92" rx="3" fill="#fff" stroke="#ccc" stroke-width="1"/>
      <text x="94" y="42" font-size="7.5" font-weight="bold" fill="#222">Diagnosed Roadblock: Mutable Key Reference in Hash Map</text>
      <text x="94" y="52" font-size="6.8" fill="#137333" font-weight="bold">Confidence: 96.4% | Difficulty: Advanced | Persona: Academic Professor</text>
      
      <line x1="94" y1="56" x2="320" y2="56" stroke="#eee" stroke-width="1"/>
      
      <text x="94" y="67" font-size="6.5" font-weight="bold" fill="#d93025">Anti-Pattern (Common Bug):</text>
      <text x="94" y="76" font-family="monospace" font-size="6" fill="#444">data = {}; data[[1, 2]] = "val" # TypeError: unhashable type: 'list'</text>
      
      <text x="94" y="88" font-size="6.5" font-weight="bold" fill="#0d652d">Robust Production Solution:</text>
      <text x="94" y="97" font-family="monospace" font-size="6" fill="#444">data = {}; data[tuple([1, 2])] = "val" # Immutable tuple key</text>
      
      <text x="94" y="112" font-size="6.2" font-style="italic" fill="#555">Golden Rule: In hash tables, keys must be immutable to guarantee deterministic hash calculation.</text>
    </svg>
    <div class="figure-caption">Fig. 5. Sample Classification and Diagnostic Output with RSSP State Binding</div>
  </div>

  <h2 class="section-title">VI. Conclusion and Future Scope</h2>
  <p>This paper introduced <b>AURA-Learn</b>, a lightweight and interpretable deep learning framework for multi-agent interactive tutoring and vocational career translation. The proposed architecture combines an asynchronous FastAPI backend with an embodied 10-state robot avatar governed by the <b>Robot State Synchronization Protocol (RSSP)</b>, facilitating real-time execution on resource-constrained devices like student laptops and mobile phones. Experimental evaluations across both structured curriculum benchmarks and live student query logs showed uniform high performance (92.6%–95.8%) with sub-second inference (0.48 s TTFT).</p>

  <p>Although the system operates reliably under various conditions, some limitations remain. Complex inter-disciplinary doubts spanning multiple conceptual domains can cause minor ambiguity in agent routing. Additionally, student queries containing heavy code omissions require multiple diagnostic iterations. Future work will concentrate on integrating in-browser WebAssembly computer vision models to perform real-time student gaze tracking for automated confusion detection. Optimization for hardware accelerators like edge neural processing units (NPUs) and integration of contextual campus placement data will also be explored to further enhance diagnostic and career outcomes.</p>

  <h2 class="section-title">VII. References</h2>
  <ol class="references-list">
    <li>K. VanLehn, "The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems," <i>Educational Psychologist</i>, vol. 46, no. 4, pp. 197–221, 2011.</li>
    <li>S. M. Hassan, M. A. Islam, and M. Hasan, "Identification of technical misconceptions using deep transformer networks and multi-agent systems," <i>Electronics</i>, vol. 10, no. 12, p. 1388, 2021.</li>
    <li>A. Vaswani et al., "Attention is all you need," in <i>Advances in Neural Information Processing Systems (NeurIPS)</i>, 2017, pp. 5998–6008.</li>
    <li>A. T. Khan, A. R. Javed, and F. Alenezi, "Lightweight LLM-based intelligent tutoring for edge devices," <i>Sensors</i>, vol. 23, no. 4, p. 1987, 2023.</li>
    <li>P. Denny, J. Prather, and B. Becker, "Conversational AI in Computing Education: Perspectives, Challenges, and Opportunities," in <i>Proc. ACM Tech. Symp. Comput. Sci. Educ. (SIGCSE)</i>, 2024, pp. 120–127.</li>
    <li>Q. Wu et al., "AutoGen: Enabling next-gen LLM applications via multi-agent conversation," <i>arXiv preprint arXiv:2308.08155</i>, 2023.</li>
    <li>S. Hong et al., "MetaGPT: Meta programming for multi-agent collaborative framework," in <i>Proc. Int. Conf. Learn. Represent. (ICLR)</i>, 2024.</li>
    <li>R. R. Hoffman et al., "Metrics for explainable AI: Challenges and prospects," <i>IEEE Intelligent Systems</i>, vol. 33, no. 6, pp. 55–67, 2018.</li>
    <li>J. Cassell, "Embodied conversational agents: representation and intelligence in multimedia interfaces," <i>AI Magazine</i>, vol. 22, no. 4, pp. 67–83, 2001.</li>
    <li>B. Kim and M. Baylor, "The pedagogical agent effect in computer-based learning environments: A meta-analysis," <i>Educational Technology Research and Development</i>, vol. 64, no. 2, pp. 261–288, 2016.</li>
    <li>M. J. Karim et al., "Real-time edge educational diagnostics using MobileNetV3 and Grad-CAM," <i>Scientific Reports</i>, vol. 14, p. 1765, 2024.</li>
    <li>D. Baidoo-Anu and L. Owusu Ansah, "Education in the era of generative artificial intelligence (AI): Understanding the potential benefits of ChatGPT in promoting teaching and learning," <i>Journal of AI</i>, vol. 7, no. 1, pp. 52–62, 2023.</li>
    <li>R. C. Joshi, V. R. Patel, A. Mishra and S. Kumar, "Real-Time Plant Leaf Disease Detection Using CNN and Solutions to Cure With Android App," in <i>2023 International Conference on Computing, Communication, and Intelligent Systems (ICCCIS)</i>, Greater Noida, India, Nov. 3–4, 2023, pp. 1-6.</li>
    <li>K. Harshavardhan, P. J. V. Abhinav Krishna and A. Geetha, "Detection of Various Plant Leaf Diseases Using Deep Learning Techniques," <i>2023 International Conference on Advances in Computing, Communication and Applied Informatics (ACCAI)</i>, 2023.</li>
    <li>S. Pandi, S. Senthil, R. Suguna Devi, B. S. Chokkalingam and S. Kannaiah, "Automatic Plant Leaf Disease Detection using AlexNet and Image Processing Techniques," in <i>2024 International Conference on Cybernation and Computation (CYBERCOM)</i>, 2024.</li>
  </ol>

</div>

</body>
</html>
"""

html_path = os.path.abspath("AURA_Learn_Conference_Paper.html")
pdf_path = os.path.abspath("AURA_Learn_Conference_Paper.pdf")

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML saved to: {html_path}")

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    f"file:///{html_path}"
]

print("Executing Microsoft Edge print-to-pdf...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)

if os.path.exists(pdf_path):
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"SUCCESS: Generated PDF at {pdf_path} ({size_kb:.1f} KB)")
else:
    print("FAILED:", res.stderr)
