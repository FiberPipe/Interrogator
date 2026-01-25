import { Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

interface AlarmInputProps {
  value: string;
  onChange: (value: string) => void;
  type: 'min' | 'max';
  isAlarm?: boolean;
}

export const AlarmInput = ({ value, onChange, type, isAlarm }: AlarmInputProps) => {
  const { t } = useTranslation();

  return (
    <Input
      type="number"
      step="0.001"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="sm"
      variant="bordered"
      placeholder={type === 'min' ? '0.000' : '3.000'}
      classNames={{
        input: 'text-xs',
        inputWrapper: isAlarm ? 'border-danger' : '',
      }}
      startContent={isAlarm && <AlertTriangle className="w-3 h-3 text-danger" />}
    />
  );
};
