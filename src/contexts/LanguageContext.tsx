'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export type LanguageCode =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'hi'
  | 'te'
  | 'ta'
  | 'kn'
  | 'zh'
  | 'ja'
  | 'ar'
  | 'pt'
  | 'ru'
  | 'it'
  | 'ko';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
];

export const CERTIFICATE_TRANSLATIONS: Record<
  LanguageCode,
  {
    council: string;
    title: string;
    awardedTo: string;
    statement: string;
    dateIssued: string;
    honorsGrade: string;
    status: string;
    verified: string;
    chancellorTitle: string;
    directorTitle: string;
    verificationHash: string;
    preview: string;
  }
> = {
  en: {
    council: '✦ AURACAREER ACADEMIC COUNCIL ✦',
    title: 'Certificate of Mastery',
    awardedTo: 'This official academic credential is systematically awarded to',
    statement:
      'for demonstrating first-principles mastery, architectural problem solving, and 100% completion of all rigorous technical requirements in',
    dateIssued: 'DATE ISSUED',
    honorsGrade: 'HONORS GRADE',
    status: 'STATUS',
    verified: 'VERIFIED',
    chancellorTitle: 'AI Chancellor & Dean',
    directorTitle: 'Director of Learning',
    verificationHash: 'VERIFICATION HASH',
    preview: 'PREVIEW CREDENTIAL',
  },
  es: {
    council: '✦ CONSEJO ACADÉMICO DE AURACAREER ✦',
    title: 'Certificado de Maestría',
    awardedTo: 'Esta credencial académica oficial se otorga sistemáticamente a',
    statement:
      'por demostrar dominio desde primeros principios, resolución de problemas arquitectónicos y 100% de cumplimiento en',
    dateIssued: 'FECHA DE EMISIÓN',
    honorsGrade: 'CALIFICACIÓN DE HONOR',
    status: 'ESTADO',
    verified: 'VERIFICADO',
    chancellorTitle: 'Canciller y Decano de IA',
    directorTitle: 'Directora de Aprendizaje',
    verificationHash: 'HASH DE VERIFICACIÓN',
    preview: 'VISTA PREVIA DE CREDENCIAL',
  },
  fr: {
    council: '✦ CONSEIL ACADÉMIQUE AURACAREER ✦',
    title: 'Certificat de Maîtrise',
    awardedTo: 'Ce titre académique officiel est systématiquement décerné à',
    statement:
      'pour avoir démontré une maîtrise des principes fondamentaux, la résolution de problèmes et 100% de réussite dans',
    dateIssued: 'DATE D’ÉMISSION',
    honorsGrade: 'MENTION D’HONNEUR',
    status: 'STATUT',
    verified: 'VÉRIFIÉ',
    chancellorTitle: 'Chancelier & Doyen IA',
    directorTitle: 'Directrice de l’Apprentissage',
    verificationHash: 'HASH DE VÉRIFICATION',
    preview: 'APERÇU DU CERTIFICAT',
  },
  de: {
    council: '✦ AURACAREER AKADEMISCHER RAT ✦',
    title: 'Meisterzertifikat',
    awardedTo: 'Dieser offizielle akademische Nachweis wird verliehen an',
    statement:
      'für den Nachweis herausragender Fachkompetenz, architektonischer Problemlösung und 100%igen Abschluss in',
    dateIssued: 'AUSSTELLUNGSDATUM',
    honorsGrade: 'EHRENGRADE',
    status: 'STATUS',
    verified: 'VERIFIZIERT',
    chancellorTitle: 'KI-Kanzler & Dekan',
    directorTitle: 'Leiterin für Bildung',
    verificationHash: 'VERIFIZIERUNGSHASH',
    preview: 'ZERTIFIKAT-VORSCHAU',
  },
  hi: {
    council: '✦ ऑराकरियर अकादमिक परिषद ✦',
    title: 'प्रवीणता प्रमाणपत्र (Certificate of Mastery)',
    awardedTo: 'यह आधिकारिक अकादमिक प्रमाणपत्र प्रदान किया जाता है',
    statement:
      'मूल सिद्धांतों की दक्षता, वास्तुकला समस्या समाधान और 100% पूर्णता प्रदर्शित करने के लिए',
    dateIssued: 'जारी करने की तिथि',
    honorsGrade: 'सम्मान ग्रेड',
    status: 'स्थिति',
    verified: 'सत्यापित',
    chancellorTitle: 'एआई कुलाधिपति एवं डीन',
    directorTitle: 'शिक्षा निदेशक',
    verificationHash: 'सत्यापन हैश',
    preview: 'प्रमाणपत्र पूर्वावलोकन',
  },
  te: {
    council: '✦ ఆరాకెరీర్ అకడమిక్ కౌన్సిల్ ✦',
    title: 'నైపుణ్య ధ్రువీకరణ పత్రం (Certificate of Mastery)',
    awardedTo: 'ఈ అధికారిక అకడమిక్ ధ్రువీకరణ పత్రం ప్రదానం చేయబడింది',
    statement:
      'మౌలిక సూత్రాలపై పట్టు, సాంకేతిక సమస్యల పరిష్కారం మరియు 100% విజయవంతంగా పూర్తి చేసినందుకు',
    dateIssued: 'జారీ చేసిన తేదీ',
    honorsGrade: 'గౌరవ గ్రేడ్',
    status: 'స్థితి',
    verified: 'ధ్రువీకరించబడింది',
    chancellorTitle: 'ఏఐ ఛాన్సలర్ & డీన్',
    directorTitle: 'లెర్నింగ్ డైరెక్టర్',
    verificationHash: 'వెరిఫికేషన్ హ్యాష్',
    preview: 'సర్టిఫికెట్ ప్రివ్యూ',
  },
  ta: {
    council: '✦ ஆரா-கேரியர் கல்வி கவுன்சில் ✦',
    title: 'தேர்ச்சி சான்றிதழ் (Certificate of Mastery)',
    awardedTo: 'இந்த அதிகாரப்பூர்வ கல்விச் சான்றிதழ் வழங்கப்படுகிறது',
    statement:
      'அடிப்படைக் கோட்பாட்டுத் தேர்ச்சி மற்றும் 100% தொழில்நுட்பப் பூர்த்தி செய்தமைக்காக',
    dateIssued: 'வழங்கப்பட்ட தேதி',
    honorsGrade: 'மதிப்பெண் தரம்',
    status: 'நிலை',
    verified: 'சரிபார்க்கப்பட்டது',
    chancellorTitle: 'ஏஐ வேந்தர் & டீன்',
    directorTitle: 'கற்றல் இயக்குநர்',
    verificationHash: 'சரிபார்ப்பு குறியீடு',
    preview: 'சான்றிதழ் முன்னோட்டம்',
  },
  kn: {
    council: '✦ ಔರಾಕೇರಿಯರ್ ಶೈಕ್ಷಣಿಕ ಮಂಡಳಿ ✦',
    title: 'ಪರಿಣತಿ ಪ್ರಮಾಣಪತ್ರ (Certificate of Mastery)',
    awardedTo: 'ಈ ಅಧಿಕೃತ ಶೈಕ್ಷಣಿಕ ಪ್ರಮಾಣಪತ್ರವನ್ನು ನೀಡಲಾಗಿದೆ',
    statement:
      'ಮೂಲ ತತ್ವಗಳ ಪಾಂಡಿತ್ಯ ಮತ್ತು 100% ತಾಂತ್ರಿಕ ಪೂರ್ಣಗೊಳಿಸುವಿಕೆಯನ್ನು ಪ್ರದರ್ಶಿಸಿದ್ದಕ್ಕಾಗಿ',
    dateIssued: 'ನೀಡಿದ ದಿನಾಂಕ',
    honorsGrade: 'ಗೌರವ ಶ್ರೇಣಿ',
    status: 'ಸ್ಥಿತಿ',
    verified: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ',
    chancellorTitle: 'ಎಐ ಕುಲಪತಿ & ಡೀನ್',
    directorTitle: 'ಕಲಿಕಾ ನಿರ್ದೇಶಕಿ',
    verificationHash: 'ಪರಿಶೀಲನಾ ಹ್ಯಾಶ್',
    preview: 'ಪ್ರಮಾಣಪತ್ರ ಪೂರ್ವವೀಕ್ಷಣೆ',
  },
  zh: {
    council: '✦ AURACAREER 学术委员会 ✦',
    title: '专业精通认证证书',
    awardedTo: '特此向以下学员颁发此官方专业学术认证',
    statement:
      '以表彰其展示的第一性原理精通深度、系统架构问题解决能力，并100%圆满完成各项严谨技术要求的课程：',
    dateIssued: '签发日期',
    honorsGrade: '荣誉等级',
    status: '认证状态',
    verified: '官方已验证',
    chancellorTitle: 'AI校监兼院长',
    directorTitle: '学术与教学总监',
    verificationHash: '密码学校验哈希',
    preview: '证书预览',
  },
  ja: {
    council: '✦ AURACAREER 学術評议会 ✦',
    title: 'マスタリー修了認定証書',
    awardedTo: 'この公式アカデミック資格は次の方に授与されます',
    statement:
      '第一原理からの深い習熟、システム設計の課題解決能力、および100%のコース修了を讃えて：',
    dateIssued: '発行日',
    honorsGrade: '名誉成績',
    status: '状態',
    verified: '認証済み',
    chancellorTitle: 'AI総長・学部長',
    directorTitle: '学習統括ディレクター',
    verificationHash: '検証暗号ハッシュ',
    preview: '認定証プレビュー',
  },
  ar: {
    council: '✦ المجلس الأكاديمي لـ AURACAREER ✦',
    title: 'شهادة الإتقان والتميز الأكاديمي',
    awardedTo: 'تُمنح هذه الشهادة الأكاديمية الرسمية بتقدير عالٍ إلى',
    statement:
      'لإثبات التمكن التام من المبادئ الهندسية الأساسية وحل المشكلات المعقدة وإتمام متطلبات المنهج بنسبة 100% في',
    dateIssued: 'تاريخ الإصدار',
    honorsGrade: 'درجة الشرف',
    status: 'الحالة',
    verified: 'موثق رسمياً',
    chancellorTitle: 'عميد ورئيس الذكاء الاصطناعي',
    directorTitle: 'مديرة برامج التعلم',
    verificationHash: 'رمز التحقق الرقمي',
    preview: 'معاينة الشهادة',
  },
  pt: {
    council: '✦ CONSELHO ACADÊMICO AURACAREER ✦',
    title: 'Certificado de Maestria Profissional',
    awardedTo: 'Esta credencial acadêmica oficial é sistematicamente conferida a',
    statement:
      'por demonstrar maestria a partir de primeiros princípios, resolução de problemas e 100% de conclusão em',
    dateIssued: 'DATA DE EMISSÃO',
    honorsGrade: 'GRAU DE HONRA',
    status: 'STATUS',
    verified: 'VERIFICADO',
    chancellorTitle: 'Chanceler e Reitor de IA',
    directorTitle: 'Diretora de Aprendizagem',
    verificationHash: 'HASH DE VERIFICAÇÃO',
    preview: 'VISUALIZAR CREDENCIAL',
  },
  ru: {
    council: '✦ АКАДЕМИЧЕСКИЙ СОВЕТ AURACAREER ✦',
    title: 'Сертификат Мастерства и Квалификации',
    awardedTo: 'Настоящий официальный академический сертификат вручается',
    statement:
      'за подтверждение глубокого понимания фундаментальных принципов, решение инженерных задач и 100% завершение программы',
    dateIssued: 'ДАТА ВЫДАЧИ',
    honorsGrade: 'ОЦЕНКА С ОТЛИЧИЕМ',
    status: 'СТАТУС',
    verified: 'ВЕРИФИЦИРОВАНО',
    chancellorTitle: 'Канцлер и декан направления ИИ',
    directorTitle: 'Директор по обучению',
    verificationHash: 'ХЕШ ВЕРИФИКАЦИИ',
    preview: 'ПРОСМОТР СЕРТИФИКАТА',
  },
  it: {
    council: '✦ CONSIGLIO ACCADEMICO AURACAREER ✦',
    title: 'Certificato di Padronanza Accademica',
    awardedTo: 'Questa certificazione accademica ufficiale è conferita a',
    statement:
      'per aver dimostrato eccellenza nei principi fondamentali, risoluzione di problemi architetturali e completamento al 100% in',
    dateIssued: 'DATA DI RILASCIO',
    honorsGrade: 'VOTAZIONE D’ONORE',
    status: 'STATO',
    verified: 'VERIFICATO',
    chancellorTitle: 'Rettore e Preside IA',
    directorTitle: 'Direttrice della Formazione',
    verificationHash: 'HASH DI VERIFICA',
    preview: 'ANTEPRIMA DEL DIPLOMA',
  },
  ko: {
    council: '✦ AURACAREER 학술 위원회 ✦',
    title: '전문 마스터리 공식 인증서',
    awardedTo: '본 공식 학술 인증서는 다음 수료자에게 수여됩니다',
    statement:
      '제1원리 기반의 완벽한 기술 숙달과 시스템 아키텍처 역량을 입증하고 100% 과정을 수료하였음을 증명함:',
    dateIssued: '발급일',
    honorsGrade: '우수 등급',
    status: '인증 상태',
    verified: '공식 검증됨',
    chancellorTitle: 'AI 총장 겸 학장',
    directorTitle: '학습 총괄 디렉터',
    verificationHash: '블록 검증 해시',
    preview: '인증서 미리보기',
  },
};

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    'nav.courses': 'Courses',
    'nav.classroom': 'Live Classroom',
    'nav.resumeHub': 'Resume Hub',
    'nav.roadmap': 'Career Roadmaps',
    'nav.certificates': 'Certificates',
    'nav.settings': 'Settings',
    'settings.title': 'Settings',
    'settings.languageDesc': 'Select your preferred language for learning, voice narration, and interface.',
    'resume.title': 'Career & Job Toolkit',
    'certs.title': 'Verified Course Credentials',
    'roadmap.title': 'Career Learning Roadmaps',
  },
  es: {
    'nav.courses': 'Cursos',
    'nav.classroom': 'Aula en Vivo',
    'nav.resumeHub': 'Centro de Currículum',
    'nav.roadmap': 'Rutas Profesionales',
    'nav.certificates': 'Certificados',
    'nav.settings': 'Ajustes',
    'settings.title': 'Configuración',
    'settings.languageDesc': 'Selecciona tu idioma preferido para el aprendizaje, narración y plataforma.',
    'resume.title': 'Herramientas de Carrera y Empleo',
    'certs.title': 'Credenciales de Cursos Verificadas',
    'roadmap.title': 'Rutas de Aprendizaje Profesional',
  },
  fr: {
    'nav.courses': 'Cours',
    'nav.classroom': 'Classe en Direct',
    'nav.resumeHub': 'Hub CV & Carrière',
    'nav.roadmap': 'Parcours de Carrière',
    'nav.certificates': 'Certificats',
    'nav.settings': 'Paramètres',
    'settings.title': 'Paramètres',
    'settings.languageDesc': 'Sélectionnez votre langue préférée pour les cours, la voix et l’interface.',
    'resume.title': 'Boîte à Outils Carrière & Emploi',
    'certs.title': 'Certificats de Cours Vérifiés',
    'roadmap.title': 'Feuilles de Route Professionnelles',
  },
  de: {
    'nav.courses': 'Kurse',
    'nav.classroom': 'Live-Klassenzimmer',
    'nav.resumeHub': 'Karriere- & Lebenslauf-Hub',
    'nav.roadmap': 'Karriere-Roadmaps',
    'nav.certificates': 'Zertifikate',
    'nav.settings': 'Einstellungen',
    'settings.title': 'Einstellungen',
    'settings.languageDesc': 'Wählen Sie Ihre bevorzugte Sprache für Unterricht, Sprachausgabe und Oberfläche.',
    'resume.title': 'Karriere & Bewerbungs-Toolkit',
    'certs.title': 'Verifizierte Kurszertifikate',
    'roadmap.title': 'Karriere-Lernpfade',
  },
  hi: {
    'nav.courses': 'कोर्सेस',
    'nav.classroom': 'लाइव क्लासरूम',
    'nav.resumeHub': 'रिज्यूमे हब',
    'nav.roadmap': 'करियर रोडमैप',
    'nav.certificates': 'प्रमाणपत्र',
    'nav.settings': 'सेटिंग्स',
    'settings.title': 'सेटिंग्स',
    'settings.languageDesc': 'शिक्षण, आवाज और इंटरफेस के लिए अपनी पसंदीदा भाषा चुनें।',
    'resume.title': 'करियर और जॉब टूलकिट',
    'certs.title': 'सत्यापित पाठ्यक्रम प्रमाण पत्र',
    'roadmap.title': 'करियर लर्निंग रोडमैप',
  },
  te: {
    'nav.courses': 'కోర్సులు',
    'nav.classroom': 'లైవ్ క్లాస్‌రూమ్',
    'nav.resumeHub': 'రెజ్యూమ్ హబ్',
    'nav.roadmap': 'కెరీర్ రోడ్‌మ్యాప్',
    'nav.certificates': 'సర్టిఫికెట్లు',
    'nav.settings': 'సెట్టింగ్‌లు',
    'settings.title': 'సెట్టింగ్‌లు',
    'settings.languageDesc': 'బోధన, వాయిస్ మరియు స్క్రీన్ కోసం మీ ప్రాధాన్య భాషను ఎంచుకోండి.',
    'resume.title': 'కెరీర్ మరియు జాబ్ టూల్‌కిట్',
    'certs.title': 'ధృవీకరించబడిన కోర్సు సర్టిఫికెట్లు',
    'roadmap.title': 'కెరీర్ లెర్నింగ్ రోడ్‌మ్యాప్‌లు',
  },
  ta: {
    'nav.courses': 'படிப்புகள்',
    'nav.classroom': 'நேரடி வகுப்பறை',
    'nav.resumeHub': 'சுயவிவர மையம்',
    'nav.roadmap': 'தொழில் வரைபடம்',
    'nav.certificates': 'சான்றிதழ்கள்',
    'nav.settings': 'அமைப்புகள்',
    'settings.title': 'அமைப்புகள்',
    'settings.languageDesc': 'கற்றல் மற்றும் இடைமுகத்திற்கான உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்.',
    'resume.title': 'தொழில் கருவிகள்',
    'certs.title': 'சரிபார்க்கப்பட்ட சான்றிதழ்கள்',
    'roadmap.title': 'தொழில் கற்றல் வரைபடங்கள்',
  },
  kn: {
    'nav.courses': 'ಕೋರ್ಸ್‌ಗಳು',
    'nav.classroom': 'ಲೈವ್ ತರಗತಿ',
    'nav.resumeHub': 'ರೆಸ್ಯೂಮ್ ಹಬ್',
    'nav.roadmap': 'ವೃತ್ತಿ ಮಾರ್ಗಸೂಚಿ',
    'nav.certificates': 'ಪ್ರಮಾಣಪತ್ರಗಳು',
    'nav.settings': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'settings.title': 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    'settings.languageDesc': 'ಕಲಿಕೆ ಮತ್ತು ಇಂಟರ್ಫೇಸ್‌ಗಾಗಿ ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    'resume.title': 'ವೃತ್ತಿ ಮತ್ತು ಉದ್ಯೋಗ ಟೂಲ್‌ಕಿಟ್',
    'certs.title': 'ದೃಢೀಕೃತ ಕೋರ್ಸ್ ಪ್ರಮಾಣಪತ್ರಗಳು',
    'roadmap.title': 'ವೃತ್ತಿ ಕಲಿಕಾ ಮಾರ್ಗಗಳು',
  },
  zh: {
    'nav.courses': '课程',
    'nav.classroom': '在线课堂',
    'nav.resumeHub': '简历中心',
    'nav.roadmap': '职业路线图',
    'nav.certificates': '结业证书',
    'nav.settings': '设置',
    'settings.title': '设置',
    'settings.languageDesc': '选择您用于学习、语音解说和界面的首选语言。',
    'resume.title': '职业与就业工具箱',
    'certs.title': '经认证的课程证书',
    'roadmap.title': '职业成长路线图',
  },
  ja: {
    'nav.courses': 'コース一覧',
    'nav.classroom': 'ライブ教室',
    'nav.resumeHub': '履歴書ハブ',
    'nav.roadmap': 'キャリアロードマップ',
    'nav.certificates': '修了証',
    'nav.settings': '設定',
    'settings.title': '環境設定',
    'settings.languageDesc': '学習、音声解説、インターフェースの言語を選択してください。',
    'resume.title': 'キャリア＆就職ツールキット',
    'certs.title': '認定コース修了証書',
    'roadmap.title': 'キャリア学習ロードマップ',
  },
  ar: {
    'nav.courses': 'الدورات التعليمية',
    'nav.classroom': 'الفصل الافتراضي المباشر',
    'nav.resumeHub': 'مركز السيرة الذاتية',
    'nav.roadmap': 'مسارات التطور الوظيفي',
    'nav.certificates': 'الشهادات المعتمدة',
    'nav.settings': 'الإعدادات',
    'settings.title': 'الإعدادات',
    'settings.languageDesc': 'اختر لغتك المفضلة للتعلم والشرح الصوتي والواجهة.',
    'resume.title': 'مجموعة أدوات التوظيف والمهنة',
    'certs.title': 'شهادات الدورات الموثقة',
    'roadmap.title': 'مسارات التعلم المهنية',
  },
  pt: {
    'nav.courses': 'Cursos',
    'nav.classroom': 'Sala de Aula ao Vivo',
    'nav.resumeHub': 'Central de Currículo',
    'nav.roadmap': 'Roteiros de Carreira',
    'nav.certificates': 'Certificados',
    'nav.settings': 'Configurações',
    'settings.title': 'Configurações',
    'settings.languageDesc': 'Selecione seu idioma preferido para aprendizado e interface.',
    'resume.title': 'Kit de Carreira e Emprego',
    'certs.title': 'Certificados de Cursos Verificados',
    'roadmap.title': 'Roteiros de Aprendizagem Profissional',
  },
  ru: {
    'nav.courses': 'Курсы',
    'nav.classroom': 'Онлайн-аудитория',
    'nav.resumeHub': 'Центр резюме',
    'nav.roadmap': 'Карьерные треки',
    'nav.certificates': 'Сертификаты',
    'nav.settings': 'Настройки',
    'settings.title': 'Настройки',
    'settings.languageDesc': 'Выберите предпочтительный язык для обучения и интерфейса.',
    'resume.title': 'Карьерный инструментарий',
    'certs.title': 'Верифицированные сертификаты',
    'roadmap.title': 'Карьерные карты развития',
  },
  it: {
    'nav.courses': 'Corsi',
    'nav.classroom': 'Aula dal Vivo',
    'nav.resumeHub': 'Hub Curriculum',
    'nav.roadmap': 'Percorsi di Carriera',
    'nav.certificates': 'Certificati',
    'nav.settings': 'Impostazioni',
    'settings.title': 'Impostazioni',
    'settings.languageDesc': 'Seleziona la tua lingua preferita per l’apprendimento e l’interfaccia.',
    'resume.title': 'Strumenti di Carriera e Lavoro',
    'certs.title': 'Certificazioni Corsi Verificate',
    'roadmap.title': 'Percorsi di Studio Professionali',
  },
  ko: {
    'nav.courses': '교육 과정',
    'nav.classroom': '실시간 강의실',
    'nav.resumeHub': '이력서 허브',
    'nav.roadmap': '커리어 로드맵',
    'nav.certificates': '공식 수료증',
    'nav.settings': '환경 설정',
    'settings.title': '설정',
    'settings.languageDesc': '학습 및 음성 해설을 위한 기본 언어를 선택하세요.',
    'resume.title': '취업 및 커리어 툴킷',
    'certs.title': '검증된 코스 수료증',
    'roadmap.title': '커리어 맞춤형 학습 로드맵',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currentLanguage: LanguageOption;
  t: (key: string, defaultVal?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  currentLanguage: SUPPORTED_LANGUAGES[0],
  t: (_key, defaultVal) => defaultVal || '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aura_preferred_language') as LanguageCode;
      if (stored && TRANSLATIONS[stored]) {
        setLanguageState(stored);
      }
    } catch {}
  }, []);

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('aura_preferred_language', newLang);
      const selected = SUPPORTED_LANGUAGES.find((l) => l.code === newLang);
      toast.success(`Language set to ${selected?.name || newLang} ${selected?.flag || ''}`);
    } catch {}
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, defaultVal?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || defaultVal || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
