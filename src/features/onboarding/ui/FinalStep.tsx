import { Button, Card, CardBody, Divider } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Languages, Palette, Cpu, Usb } from 'lucide-react';

interface FinalStepProps {
  onFinish: () => void;
  onBack: () => void;
  data: Record<string, unknown>;
}

export default function FinalStep({ onFinish, onBack, data }: FinalStepProps) {
  const { t } = useTranslation();

  const summaryItems = [
    {
      icon: Languages,
      label: t('onboarding.summary.language'),
      value: data.language ? t(`onboarding.language.${data.language}`) : 'N/A',
    },
    {
      icon: Palette,
      label: t('onboarding.summary.theme'),
      value: data.theme ? t(`onboarding.theme.${data.theme}`) : 'N/A',
    },
    {
      icon: Cpu,
      label: t('onboarding.summary.sensors'),
      value: data.sensorCount ? `${data.sensorCount} ${t('common.sensors')}` : 'N/A',
    },
    {
      icon: Usb,
      label: t('onboarding.summary.port'),
      value: data.lastPort || 'N/A',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="inline-flex p-4 rounded-full bg-success-100 dark:bg-success-900/30">
            <CheckCircle2 className="w-16 h-16 text-success" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-bold">{t('onboarding.final.title')}</h2>
        <p className="text-default-500">{t('onboarding.final.subtitle')}</p>
      </div>

      <Divider />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardBody className="gap-4">
            <h3 className="text-lg font-semibold">{t('onboarding.final.summary')}</h3>

            <div className="space-y-3">
              {summaryItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-default-100 dark:bg-default-50/5"
                  >
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-default-500">{item.label}</p>
                      <p className="font-semibold">{item.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Навигация */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="light" onPress={onBack}>
          {t('common.back')}
        </Button>

        <Button color="success" size="lg" onPress={onFinish}>
          {t('onboarding.final.start')} 🚀
        </Button>
      </div>
    </div>
  );
}
