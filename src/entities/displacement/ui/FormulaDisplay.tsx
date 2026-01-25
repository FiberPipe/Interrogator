import { Card, CardBody, Code } from '@heroui/react';
import { Info } from 'lucide-react';

export const DisplacementFormulaDisplay = () => {
  return (
    <Card className="bg-default-50 dark:bg-default-100/5">
      <CardBody className="py-3">
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">Формула:</span>
              <Code size="sm" className="text-xs">
                ε = (10⁶ · (λ - λ₀)) / (k · λ₀) - C(T² - T₀²) - (B + α)(T - T₀)
              </Code>
            </div>
          </div>
          <div className="text-xs text-default-500 space-y-1 ml-7">
            <p className="font-semibold">где:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>λ - измеренная длина волны, λ₀ - эталонная длина волны</li>
              <li>k - калибровочный коэффициент датчика</li>
              <li>C - коэффициент температурной компенсации (квадратичный)</li>
              <li>B - коэффициент температурной компенсации (линейный)</li>
              <li>α - коэффициент теплового расширения</li>
              <li>T - текущая температура, T₀ - эталонная температура</li>
            </ul>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
