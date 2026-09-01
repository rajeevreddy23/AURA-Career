'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'hi' | 'te' | 'zh' | 'ja';

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
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

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
