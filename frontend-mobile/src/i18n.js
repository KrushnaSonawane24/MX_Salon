import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { title: 'MX_Salon', login: 'Login', signup: 'Sign up', joinQueue: 'Join Queue' }},
  hi: { translation: { title: 'एमएक्स_सैलून', login: 'लॉगिन', signup: 'साइन अप', joinQueue: 'क्यू में शामिल हों' }},
  mr: { translation: { title: 'एमएक्स_सॅलून', login: 'लॉगिन', signup: 'साइन अप', joinQueue: 'रांगेत सामील व्हा' }},
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v3',
  interpolation: { escapeValue: false },
});

export default i18n;
