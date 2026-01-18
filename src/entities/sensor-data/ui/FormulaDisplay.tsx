import { Card, CardBody } from '@heroui/react';
import { useTranslation } from 'react-i18next';

interface FormulaDisplayProps {
  formula: string;
  description?: string;
}

export const FormulaDisplay = ({ formula, description }: FormulaDisplayProps) => {
  const { t } = useTranslation();

  return (
    <Card className="bg-default-50 dark:bg-default-100/5">
      <CardBody className="py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-default-600">
            {t('monitoring.formula')}:
          </span>
          <code className="text-sm font-mono">{formula}</code>
        </div>
        {description && (
          <p className="text-xs text-default-500 mt-1">{description}</p>
        )}
      </CardBody>
    </Card>
  );
};
