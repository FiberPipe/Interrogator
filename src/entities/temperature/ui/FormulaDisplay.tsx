import { Card, CardBody } from '@heroui/react';
import { Info } from 'lucide-react';

interface FormulaDisplayProps {
  formula?: string;
}

export const FormulaDisplay = ({ formula }: FormulaDisplayProps) => {
  const defaultFormula = 'T = E(λ - λ₀)⁴ + D(λ - λ₀)³ + C(λ - λ₀)² + B(λ - λ₀) + A';

  return (
    <Card>
      <CardBody className="flex flex-row items-center gap-3 py-3">
        <Info className="w-5 h-5 text-primary flex-shrink-0" />
        <code className="text-sm font-mono">{formula || defaultFormula}</code>
      </CardBody>
    </Card>
  );
};
