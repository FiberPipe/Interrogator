import {
  Card,
  CardBody,
  CardHeader,
  Slider,
  Input,
  Button,
  Divider,
  Chip,
  Switch,
} from '@heroui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LightManagement = () => {
  const { t } = useTranslation();

  const [laserCurrent, setLaserCurrent] = useState(0);
  const [tecCurrent, setTecCurrent] = useState(0);
  const [amplifierGain, setAmplifierGain] = useState(1);
  const [amplifierOffset, setAmplifierOffset] = useState(0);
  const [autoMode, setAutoMode] = useState(false);

  const [minOpticalPower, setMinOpticalPower] = useState(0);
  const [maxLaserCurrent, setMaxLaserCurrent] = useState(3000);
  const [currentTemperature, setCurrentTemperature] = useState(25);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinOpticalPower(-30 + Math.random() * 5);
      setCurrentTemperature(25 + Math.random() * 2);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const sendData = () => {
    const dataToSend = {
      laserCurrent,
      tecCurrent,
      amplifierGain,
      amplifierOffset,
    };
  };

  const calculateTargetTemp = (current: number) => {
    return 27.5 + current * 3.125;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{t('lightManagement.title')}</h2>
          <Switch isSelected={autoMode} onValueChange={setAutoMode} size="sm">
            {t('lightManagement.autoMode')}
          </Switch>
        </CardHeader>

        <CardBody className="space-y-6">
          {/* Laser current */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('lightManagement.laser.label')}</label>
              <Chip color="primary" variant="flat">
                {laserCurrent} {t('lightManagement.laser.unit')}
              </Chip>
            </div>

            <Slider
              size="sm"
              step={10}
              minValue={0}
              maxValue={3000}
              value={laserCurrent}
              onChange={(value) => setLaserCurrent(Number(value))}
              isDisabled={autoMode}
              color="primary"
              showTooltip
              renderValue={({ children, ...props }) => (
                <output {...props}>
                  <span className="text-small">
                    {children} {t('lightManagement.laser.unit')}
                  </span>
                </output>
              )}
            />

            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('lightManagement.laser.min')}</span>
              <span>{t('lightManagement.laser.max')}</span>
            </div>
          </div>

          <Divider />

          {/* TEC */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">{t('lightManagement.tec.label')}</label>
              <div className="flex gap-2">
                <Chip color="secondary" variant="flat">
                  {tecCurrent} {t('lightManagement.tec.currentUnit')}
                </Chip>
                <Chip color="warning" variant="flat">
                  {t('lightManagement.tec.target')}:{' '}
                  {calculateTargetTemp(tecCurrent / 1000).toFixed(1)}°C
                </Chip>
              </div>
            </div>

            <Slider
              size="sm"
              step={50}
              minValue={-4000}
              maxValue={4000}
              value={tecCurrent}
              onChange={(value) => setTecCurrent(Number(value))}
              isDisabled={autoMode}
              color="secondary"
              showTooltip
              renderValue={({ children, ...props }) => (
                <output {...props}>
                  <span className="text-small">
                    {children} {t('lightManagement.tec.currentUnit')}
                  </span>
                </output>
              )}
            />

            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('lightManagement.tec.ranges.min')}</span>
              <span>{t('lightManagement.tec.ranges.zero')}</span>
              <span>{t('lightManagement.tec.ranges.max')}</span>
            </div>
          </div>

          <Divider />

          {/* Amplifier */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('lightManagement.amplifier.gain')}</label>
              <Input
                type="number"
                value={amplifierGain.toString()}
                onChange={(e) => setAmplifierGain(Number(e.target.value))}
                isDisabled={autoMode}
                endContent={<span className="text-default-400 text-small">x</span>}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('lightManagement.amplifier.offset')}</label>
              <Input
                type="number"
                value={amplifierOffset.toString()}
                onChange={(e) => setAmplifierOffset(Number(e.target.value))}
                isDisabled={autoMode}
              />
            </div>
          </div>

          <Divider />

          <div className="flex justify-center">
            <Button
              color="primary"
              size="lg"
              onClick={sendData}
              isDisabled={autoMode}
              className="min-w-[200px]"
            >
              {t('lightManagement.actions.apply')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Monitoring */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold">{t('lightManagement.monitoring.title')}</h3>
        </CardHeader>

        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            <Card shadow="sm">
              <CardBody className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  {t('lightManagement.monitoring.minOpticalPower')}
                </p>
                <p className="text-2xl font-bold text-primary">{minOpticalPower.toFixed(2)} дБм</p>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  {t('lightManagement.monitoring.maxLaserCurrent')}
                </p>
                <p className="text-2xl font-bold text-secondary">{maxLaserCurrent} мА</p>
              </CardBody>
            </Card>

            <Card shadow="sm">
              <CardBody className="text-center space-y-2">
                <p className="text-sm text-gray-500">
                  {t('lightManagement.monitoring.currentTemperature')}
                </p>
                <p className="text-2xl font-bold text-warning">
                  {currentTemperature.toFixed(1)} °C
                </p>
              </CardBody>
            </Card>
          </div>
        </CardBody>
      </Card>

      {/* Info */}
      <Card className="bg-blue-50 dark:bg-blue-950">
        <CardBody>
          <h4 className="font-semibold">{t('lightManagement.info.title')}</h4>

          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
            <li>• {t('lightManagement.info.items.laserRange')}</li>
            <li>• {t('lightManagement.info.items.tecRange')}</li>
            <li>• {t('lightManagement.info.items.temperatureRange')}</li>
            <li>• {t('lightManagement.info.items.updateInterval')}</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};
