import React, { useState, type ReactNode, type SVGProps } from 'react';
import {
    Card,
    Select,
    Switch,
    Text,
    Divider,
    Container,
    Row,
    Col,
    Button,
    Flex,
    Icon,
} from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';

// Типы для настроек
interface ThemeOption {
    id: string;
    label: string;
    icon?: ReactNode;
}

interface LanguageOption {
    id: string;
    label: string;
}

export const MainSettings: React.FC = () => {
    // Состояния для настроек
    const [theme, setTheme] = useState<string>('system');
    const [language, setLanguage] = useState<string>('ru');
    const [notifications, setNotifications] = useState<boolean>(true);
    const [highContrast, setHighContrast] = useState<boolean>(false);
    const [fontSize, setFontSize] = useState<string>('medium');

    // Опции для выбора темы
    const themeOptions: ThemeOption[] = [
        { id: 'light', label: 'Светлая', icon: <Icon data={Sun} size={16} /> },
        { id: 'dark', label: 'Тёмная', icon: <Icon data={Moon} size={16} /> },
        { id: 'system', label: 'Системная' },
    ];

    // Опции для выбора языка
    const languageOptions: LanguageOption[] = [
        { id: 'ru', label: 'Русский' },
        { id: 'en', label: 'English' },
        { id: 'de', label: 'Deutsch' },
        { id: 'fr', label: 'Français' },
    ];

    // Опции для размера шрифта
    const fontSizeOptions = [
        { id: 'small', label: 'Маленький' },
        { id: 'medium', label: 'Средний' },
        { id: 'large', label: 'Большой' },
    ];

    // Обработчик сохранения настроек
    const handleSaveSettings = () => {
        notification.success({
            title: 'Настройки сохранены',
            content: 'Ваши настройки успешно сохранены',
            autoHiding: true,
        });
    };

    return (
        <Flex>
            {/* Блок персонализации */}
            <Card type="action">
                <Flex direction="row" width="max">
                    <Text variant='subheader-3'>Персонализация</Text>
                    <Divider />

                    <Row Flex={8}>
                        <Col s="12" m="3">
                            <Flex direction="row" alignItems="center">
                                <MoonIcon size={20} />
                                <Text variant="subheader-1">Тема оформления</Text>
                            </Flex>
                        </Col>
                        <Col s="12" m="9">
                            <Radiogroup
                                value={theme}
                                onChange={(value) => setTheme(value)}
                            >
                                {themeOptions.map((option) => (
                                    <RadioItem
                                        key={option.id}
                                        value={option.id}
                                        content={
                                            <Flex direction="row" alignItems="center">
                                                {option.icon && option.icon}
                                                <Text>{option.label}</Text>
                                            </Flex>
                                        }
                                    />
                                ))}
                            </Radiogroup>
                        </Col>
                    </Row>

                    <Divider />

                    {/* <Row Flex={8}>
              <Col s="12" m="3">
                <Flex direction="row" alignItems="center">
                  <Icon<LanguageIcon size={20} />
                  <Text variant="subheader-1">Язык</Text>
                </Flex>
              </Col>
              <Col s="12" m="9">
                <Select
                  value={[language]}
                  options={languageOptions.map(option => ({
                    value: option.id,
                    content: option.label,
                  }))}
                  onUpdate={(value) => setLanguage(value[0])}
                  width="max"
                />
              </Col>
            </Row> */}
                </Flex>
            </Card>

            {/* Блок уведомлений */}
            {/* <Card type="action">
          <Flex direction="column" width="max">
            <Text>Уведомления</Text>
            <Divider />
            
            <Row Flex={8}>
              <Col s="12" m="3">
                <Flex direction="row" alignItems="center">
                  <NotificationIcon size={20} />
                  <Text variant="subheader-1">Уведомления</Text>
                </Flex>
              </Col>
              <Col s="12" m="9">
                <Flex direction="column">
                  <Switch
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    content="Включить уведомления"
                  />
                  <Text variant="caption-1" color="secondary">
                    Получайте уведомления о важных событиях и обновлениях
                  </Text>
                </Flex>
              </Col>
            </Row>
          </Flex>
        </Card> */}

            {/* Блок доступности */}
            {/* <Card type="action">
          <Flex direction="column" width="max">
            <Text>Доступность</Text>
            <Divider />
            
            <Row >
              <Col s="12" m="3">
                <Flex direction="row" alignItems="center">
                  <AccessibilityIcon size={20} />
                  <Text variant="subheader-1">Высокий контраст</Text>
                </Flex>
              </Col>
              <Col s="12" m="9">
                <Flex direction="column">
                  <Switch
                    checked={highContrast}
                    onChange={() => setHighContrast(!highContrast)}
                    content="Режим высокого контраста"
                  />
                  <Text variant="caption-1" color="secondary">
                    Повышает контрастность элементов для лучшей видимости
                  </Text>
                </Flex>
              </Col>
            </Row>
            
            <Divider />
            
            <Row Flex={8}>
              <Col s="12" m="3">
                <Flex direction="row" alignItems="center">
                  <AccessibilityIcon size={20} />
                  <Text variant="subheader-1">Размер шрифта</Text>
                </Flex>
              </Col>
              <Col s="12" m="9">
                {/* <Radiogroup 
                  value={fontSize} 
                  onChange={(value) => setFontSize(value)}
                >
                  {fontSizeOptions.map((option) => (
                    <RadioItem 
                      key={option.id} 
                      value={option.id}
                      content={option.label}
                    />
                  ))}
                </Radiogroup> */}
            {/* </Col>
            </Row>
          </Flex>
        </Card> */}

            {/* <Flex direction="row" justifyContent="flex-end">
          <Button view="normal">Отмена</Button>
          <Button view="action" onClick={handleSaveSettings}>Сохранить</Button>
        </Flex> */}
        </Flex>
    );
};
