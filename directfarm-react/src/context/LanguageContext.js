import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../translations/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default to 'hi' (Hindi) as requested
  const [language, setLanguageState] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('directfarm_language');
        return saved === 'en' ? 'en' : 'hi';
      }
      return 'hi';
    } catch (e) {
      return 'hi';
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('directfarm_language', language);
      }
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    } catch (e) {
      console.error('Error saving language preference:', e);
    }
  }, [language]);

  const setLanguage = (lang) => {
    if (lang === 'hi' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  const toggleLanguage = () => {
    setLanguageState(prev => (prev === 'hi' ? 'en' : 'hi'));
  };

  /**
   * Helper function to get translation by key (e.g., 'nav.home', 'about.title')
   * Supports interpolation: t('home.welcomeBack', { name: 'Ramesh' })
   */
  const t = (path, params = {}) => {
    if (!path) return '';

    const keys = path.split('.');

    // Try current language first
    let val = translations[language];
    for (const key of keys) {
      if (val && typeof val === 'object' && key in val) {
        val = val[key];
      } else {
        val = null;
        break;
      }
    }

    // Fallback to English if missing in current language
    if (val === null && language !== 'en') {
      let fallback = translations.en;
      for (const key of keys) {
        if (fallback && typeof fallback === 'object' && key in fallback) {
          fallback = fallback[key];
        } else {
          fallback = null;
          break;
        }
      }
      val = fallback;
    }

    // If still not found, return the path itself
    if (val === null || val === undefined) {
      return path;
    }

    // Interpolate parameters if any (e.g. {name} or {{name}})
    if (typeof val === 'string' && params && typeof params === 'object') {
      return Object.keys(params).reduce((str, paramKey) => {
        // Replace both {key} and {{key}}
        return str
          .replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), params[paramKey])
          .replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      }, val);
    }

    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;

