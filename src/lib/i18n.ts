import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import language resources
import enTranslation from "../locales/en.json";
import esTranslation from "../locales/es.json";

// Define the available languages and their labels
export const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

// Initialize i18next
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    es: { translation: esTranslation },
  },
  lng: localStorage.getItem("preferred_language") || "en", // Default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already safes from XSS
  },
  react: {
    useSuspense: false, // Prevents issues with React Suspense
  },
});

// Function to change the language
export const changeLanguage = (language: string) => {
  localStorage.setItem("preferred_language", language);
  return i18n.changeLanguage(language);
};

export default i18n;
