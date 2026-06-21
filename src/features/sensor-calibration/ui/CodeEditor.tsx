import { Card, CardBody, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Check, X } from 'lucide-react';

import type { CalibrationData } from '../model/types';

interface CodeEditorProps {
  data: CalibrationData;
  onUpdate: (data: CalibrationData) => void;
}

export const CodeEditor = ({ data, onUpdate }: CodeEditorProps) => {
  const { t } = useTranslation();
  const [code, setCode] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleApply = useCallback(() => {
    try {
      const parsed = JSON.parse(code);
      onUpdate(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  }, [code, onUpdate]);

  const handleReset = useCallback(() => {
    setCode(JSON.stringify(data, null, 2));
    setError(null);
  }, [data]);

  return (
    <Card>
      <CardBody className="gap-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">{t('calibration.code.title')}</h4>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              color="danger"
              startContent={<X className="w-4 h-4" />}
              onPress={handleReset}
            >
              {t('common.reset')}
            </Button>
            <Button
              size="sm"
              color="primary"
              startContent={<Check className="w-4 h-4" />}
              onPress={handleApply}
            >
              {t('common.apply')}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-danger-50 dark:bg-danger-900/20 text-danger p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="border border-default-200 rounded-lg overflow-hidden">
          <Editor
            height="500px"
            defaultLanguage="json"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};
