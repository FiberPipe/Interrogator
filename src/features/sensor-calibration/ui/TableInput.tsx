import { Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import type { CalibrationData } from '../model/types';

interface TableInputProps {
  data: CalibrationData;
  onUpdateNormalization: (index: number, value: number) => void;
  onUpdateWavelength: (index: number, value: number) => void;
}

export const TableInput = ({
  data,
  onUpdateNormalization,
  onUpdateWavelength,
}: TableInputProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Нормализация */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <h4 className="font-semibold text-lg">{t('calibration.fields.normalization')}</h4>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 16 }, (_, i) => (
            <Input
              key={`norm-${i}`}
              type="number"
              size="sm"
              label={t('calibration.fields.field', { index: i })}
              placeholder="0.0"
              value={String(data.normalization[`field${i}`] || '')}
              onChange={(e) => onUpdateNormalization(i, parseFloat(e.target.value) || 0)}
              variant="bordered"
            />
          ))}
        </div>
      </motion.div>

      {/* Длины волн */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4"
      >
        <h4 className="font-semibold text-lg">{t('calibration.fields.wavelengths')}</h4>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 16 }, (_, i) => (
            <Input
              key={`wave-${i}`}
              type="number"
              size="sm"
              label={`λ${i}`}
              placeholder="0.0"
              value={String(data.wavelengths[`lambdas_central${i}`] || '')}
              onChange={(e) => onUpdateWavelength(i, parseFloat(e.target.value) || 0)}
              variant="bordered"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
