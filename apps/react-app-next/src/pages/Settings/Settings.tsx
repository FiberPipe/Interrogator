import { Flex, Toc, Select, RadioGroup, Button } from "@gravity-ui/uikit";
import block from "bem-cn-lite";
import "./Settings.scss";
import { MainSettings, ConnectionSettings } from "@widgets/index";
import { SettingsBlock } from "@entities/Settings";
import { useState, useEffect } from "react";
import i18n from "@shared/utils/i18n";

const b = block("settings-page");

export type LogLevel = "info" | "error" | "warning";

type UserSettings = {
    theme: "light" | "dark";
    language: "ru" | "en";
};

// preload API
declare global {
    interface Window {
        electron: {
            getUserSettings: () => Promise<UserSettings>;
            saveUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
        };
    }
}

export const Settings = () => {
    const TOC_ITEMS = [
        { content: "Personal", value: "vm" },
        { content: "Connection", value: "connection" },
    ];

    const SETTINGS_BLOCKS = [
        { key: "Подключение к источнику данных", children: <ConnectionSettings /> },
    ];

    const [settings, setSettings] = useState<UserSettings>({
        theme: "light",
        language: "en",
    });

    useEffect(() => {
        (async () => {
            const saved = await window.electron.getUserSettings();
            setSettings(saved);
        })();
    }, []);

    const handleThemeChange = async (theme: "light" | "dark") => {
        const newSettings = { ...settings, theme };
        setSettings(newSettings);
        await window.electron.saveUserSettings({ theme });
    };

    const handleLanguageChange = async (lang: "ru" | "en") => {
        const newSettings = { ...settings, language: lang };
        setSettings(newSettings);
        i18n.changeLanguage(lang);
        await window.electron.saveUserSettings({ language: lang });
    };

    return (
        <Flex className={b()} direction="row" gap={3}>
            <Flex overflow="auto" width="max" className={b("settings")} direction="column" gap={4}>
                <SettingsBlock header="Основные">
                    <Flex direction="column" gap={3}>
                        <RadioGroup
                            label="Тема"
                            value={settings.theme}
                            onUpdate={(val) => handleThemeChange(val as "light" | "dark")}
                            options={[
                                { value: "light", content: "Светлая" },
                                { value: "dark", content: "Тёмная" },
                            ]}
                        />

                        {/* Переключение языка */}
                        <Select
                            label="Язык"
                            value={[settings.language]}
                            onUpdate={(vals) => handleLanguageChange(vals[0] as "ru" | "en")}
                        >
                            <Select.Option value="en">English</Select.Option>
                            <Select.Option value="ru">Русский</Select.Option>
                        </Select>

                        {/* ✅ Кнопка перезапуска */}
                        <Button
                            view="outlined"
                            onClick={() => window.electron.restartApp()}
                        >
                            Перезапустить приложение
                        </Button>
                    </Flex>
                </SettingsBlock>
                {SETTINGS_BLOCKS.map(({ key, children }) => (
                    <SettingsBlock header={key} key={key}>
                        {children}
                    </SettingsBlock>
                ))}
            </Flex>

            <Toc items={TOC_ITEMS} />
        </Flex>
    );
};
