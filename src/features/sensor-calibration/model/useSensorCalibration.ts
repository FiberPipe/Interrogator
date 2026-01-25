import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { addSuccessToaster, addDangerToaster } from '../../../shared/ui';
import type { CalibrationData, CalibrationMethod } from './types';

export const useSensorCalibration = () => {
  const { t } = useTranslation();
  const [method, setMethod] = useState<CalibrationMethod>('table');
  const [data, setData] = useState<CalibrationData>({
    normalization: {},
    wavelengths: {},
  });
  const [filePath, setFilePath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Загрузка сохраненных данных
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await window.appData.getAll();

        if (saved?.calibrationData) {
          setData(saved.calibrationData as CalibrationData);
        }

        if (saved?.calibrationMethod) {
          setMethod(saved.calibrationMethod as CalibrationMethod);
        }

        if (saved?.sensorDataFilePath) {
          setFilePath(saved.sensorDataFilePath as string);
        }
      } catch (err) {
        console.error('[useSensorCalibration] Load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Обновление поля нормализации
  const updateNormalization = useCallback((index: number, value: number) => {
    setData((prev) => ({
      ...prev,
      normalization: {
        ...prev.normalization,
        [`field${index}`]: value,
      },
    }));
  }, []);

  // Обновление длины волны
  const updateWavelength = useCallback((index: number, value: number) => {
    setData((prev) => ({
      ...prev,
      wavelengths: {
        ...prev.wavelengths,
        [`lambdas_central${index}`]: value,
      },
    }));
  }, []);

  // Массовое обновление данных
  const bulkUpdateData = useCallback((newData: CalibrationData) => {
    setData(newData);
  }, []);

  // Выбор файла
  const selectFile = useCallback(async () => {
    try {
      // Здесь должен быть вызов electron dialog
      const selectedPath = await window.electron?.selectFile();
      if (selectedPath) {
        setFilePath(selectedPath);
      }
    } catch (err) {
      console.error('[useSensorCalibration] File selection error:', err);
      addDangerToaster(
        t('calibration.errors.fileSelection'),
        t('calibration.errors.fileSelectionDescription'),
      );
    }
  }, [t]);

  // Загрузка из CSV
  const loadFromCSV = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const lines = text.split('\n').filter((line) => line.trim());

        const newData: CalibrationData = {
          normalization: {},
          wavelengths: {},
        };

        lines.forEach((line, index) => {
          if (index === 0) return; // Skip header
          const [, norm, wave] = line.split(',');

          if (norm) newData.normalization[`field${index - 1}`] = parseFloat(norm);
          if (wave) newData.wavelengths[`lambdas_central${index - 1}`] = parseFloat(wave);
        });

        bulkUpdateData(newData);
        addSuccessToaster(
          t('calibration.messages.csvLoaded'),
          t('calibration.messages.csvLoadedDescription'),
        );
      } catch (err) {
        console.error('[useSensorCalibration] CSV parse error:', err);
        addDangerToaster(
          t('calibration.errors.csvParse'),
          t('calibration.errors.csvParseDescription'),
        );
      }
    },
    [bulkUpdateData, t],
  );

  // Загрузка из JSON
  const loadFromJSON = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as CalibrationData;

        bulkUpdateData(parsed);
        addSuccessToaster(
          t('calibration.messages.jsonLoaded'),
          t('calibration.messages.jsonLoadedDescription'),
        );
      } catch (err) {
        console.error('[useSensorCalibration] JSON parse error:', err);
        addDangerToaster(
          t('calibration.errors.jsonParse'),
          t('calibration.errors.jsonParseDescription'),
        );
      }
    },
    [bulkUpdateData, t],
  );

  // Сохранение конфигурации
  const saveConfiguration = useCallback(async () => {
    setIsSaving(true);

    try {
      await window.appData.patch({
        calibrationData: data,
        calibrationMethod: method,
        sensorDataFilePath: filePath,
      });

      addSuccessToaster(
        t('calibration.messages.saved'),
        t('calibration.messages.savedDescription'),
      );
    } catch (err) {
      console.error('[useSensorCalibration] Save error:', err);
      addDangerToaster(t('calibration.errors.save'), t('calibration.errors.saveDescription'));
    } finally {
      setIsSaving(false);
    }
  }, [data, method, filePath, t]);

  // Сброс конфигурации
  const resetConfiguration = useCallback(() => {
    setData({
      normalization: {},
      wavelengths: {},
    });
    setFilePath('');
  }, []);

  // Экспорт в JSON
  const exportToJSON = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calibration-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  // Экспорт в CSV
  const exportToCSV = useCallback(() => {
    const lines = ['Channel,Normalization,Wavelength'];

    for (let i = 0; i < 16; i++) {
      const norm = data.normalization[`field${i}`] || 0;
      const wave = data.wavelengths[`lambdas_central${i}`] || 0;
      lines.push(`${i},${norm},${wave}`);
    }

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calibration-data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  return {
    method,
    setMethod,
    data,
    filePath,
    isLoading,
    isSaving,
    updateNormalization,
    updateWavelength,
    bulkUpdateData,
    selectFile,
    loadFromCSV,
    loadFromJSON,
    saveConfiguration,
    resetConfiguration,
    exportToJSON,
    exportToCSV,
  };
};
