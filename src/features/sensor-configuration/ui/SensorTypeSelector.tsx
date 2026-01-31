import { Select, SelectItem } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import type { SensorType } from '../../../entities/sensor/model/types';
import { SENSOR_TYPES, SENSOR_TYPE_ICONS } from '../../../entities/sensor/model/constants';

interface SensorTypeSelectorProps {
  value: SensorType;
  onChange: (type: SensorType) => void;
}

export const SensorTypeSelector = ({ value, onChange }: SensorTypeSelectorProps) => {
  const { t } = useTranslation();

  return (
    <Select
      label={t('sensors.configuration.type')}
      placeholder={t('sensors.configuration.selectType')}
      selectedKeys={value ? [value] : []}
      onChange={(e) => onChange(e.target.value as SensorType)}
      variant="bordered"
    >
      {SENSOR_TYPES.map((type) => (
        <SelectItem
          key={type.value}
          value={type.value}
          startContent={<span className="text-lg">{SENSOR_TYPE_ICONS[type.value]}</span>}
        >
          {t(type.labelKey)}
        </SelectItem>
      ))}
    </Select>
  );
};
