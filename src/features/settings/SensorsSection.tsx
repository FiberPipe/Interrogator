import { Card, CardBody, CardHeader, Alert, Slider, Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { Gauge, Settings2 } from 'lucide-react';

export const SensorsSection = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex gap-3">
          <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/30">
            <Gauge className="w-5 h-5 text-success" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold">{t('settings.sensors.title')}</h4>
            <p className="text-sm text-default-500">{t('settings.sensors.description')}</p>
          </div>
        </CardHeader>
        
        <CardBody className="space-y-6">
          <Alert color="warning" title={t('settings.sensors.notAvailable')}>
            {t('settings.sensors.notAvailableDescription')}
          </Alert>

          {/* Превью будущего функционала */}
          <div className="space-y-4 opacity-50 pointer-events-none">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('settings.sensors.channelCount')}
              </label>
              <p className="text-xs text-default-500 mb-2">
                {t('settings.sensors.channelCountDescription')}
              </p>
              <Slider
                size="sm"
                step={1}
                minValue={1}
                maxValue={16}
                defaultValue={16}
                className="max-w-md"
                marks={[
                  { value: 1, label: '1' },
                  { value: 8, label: '8' },
                  { value: 16, label: '16' },
                ]}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('settings.sensors.samplingRate')}
              </label>
              <p className="text-xs text-default-500 mb-2">
                {t('settings.sensors.samplingRateDescription')}
              </p>
              <Input
                type="number"
                defaultValue="1000"
                endContent={<span className="text-default-400 text-sm">Hz</span>}
                className="max-w-xs"
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
