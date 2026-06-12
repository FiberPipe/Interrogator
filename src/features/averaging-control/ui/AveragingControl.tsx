import { Input, Popover, PopoverContent, PopoverTrigger, Slider, Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Timer } from 'lucide-react';

import { useAveragingControl } from '../model/useAveragingControl';

export const AveragingControl = () => {
  const { t } = useTranslation();
  const { avgSec, loading, min, max, setAvgSec } = useAveragingControl();

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <Button
          size="sm"
          variant="flat"
          startContent={<Timer className="w-4 h-4" />}
          isDisabled={loading}
        >
          {t('averaging.label')}: {avgSec.toFixed(1)} {t('averaging.unit')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 gap-3">
        <div className="w-full space-y-1">
          <span className="text-sm font-medium">{t('averaging.title')}</span>
          <p className="text-xs text-default-400">{t('averaging.description')}</p>
        </div>

        <Slider
          size="sm"
          step={0.1}
          minValue={min}
          maxValue={max}
          value={avgSec}
          onChange={(value) => setAvgSec(Number(value))}
          color="primary"
          className="w-full"
        />

        <Input
          type="number"
          size="sm"
          value={avgSec.toFixed(1)}
          onChange={(e) => setAvgSec(Number(e.target.value))}
          step={0.1}
          min={min}
          max={max}
          endContent={<span className="text-default-400 text-small">{t('averaging.unit')}</span>}
        />
      </PopoverContent>
    </Popover>
  );
};
