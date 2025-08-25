import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export function initI18n(language: string = "en") {
    i18n.use(initReactI18next).init({
        lng: language,
        fallbackLng: "en",
        interpolation: { escapeValue: false },
        resources: {
            en: {
                translation: {
                    settings: "Settings",
                },
            },
            ru: {
                translation: {
                    settings: "Настройки",
                },
            },
        },
    });

    return i18n;
}

// ✅ default экспорт для совместимости
export default i18n;
