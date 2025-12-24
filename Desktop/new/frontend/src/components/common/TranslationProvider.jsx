import React, { createContext, useContext, useEffect, useState } from 'react';
import faTranslations from '@/locales/fa.json';
import enTranslations from '@/locales/en.json';

const translations = {
  fa: faTranslations,
  en: enTranslations
};

const TranslationContext = createContext();

// RTL languages
const RTL_LANGUAGES = ['fa', 'ar', 'he', 'ur'];

export const useTranslation = (language = 'fa') => {
  const t = (key) => {
    return translations[language]?.[key] || translations['fa'][key] || key;
  };
  
  const isRTL = RTL_LANGUAGES.includes(language);
  
  return { t, isRTL, language };
};

export default function TranslationProvider({ children, language = 'fa' }) {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);

  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Add RTL class to body for CSS styling
    if (isRTL) {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [currentLanguage, isRTL]);

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language: currentLanguage, isRTL, setLanguage: setCurrentLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within TranslationProvider');
  }
  return context;
};