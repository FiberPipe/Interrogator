import { Switch } from '@heroui/react';
import { useTranslation } from 'react-i18next';

interface AutoConnectSwitchProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

export const AutoConnectSwitch = ({ value, onChange }: AutoConnectSwitchProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between p-4 bg-default-100 rounded-lg">
            <div className="flex flex-col">
                <span className="text-sm font-medium">{t('serialPort.autoConnect.title')}</span>
                <span className="text-xs text-default-500">
                    {t('serialPort.autoConnect.description')}
                </span>
            </div>
            <Switch
                isSelected={value}
                onValueChange={onChange}
                color="success"
                size="sm"
            />
        </div>
    );
};
