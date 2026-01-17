import { useState } from 'react';
import { Card, CardBody, Progress } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import PortStep from '../features/onboarding/ui/PortStep';
import SensorConfigStep from '../features/onboarding/ui/SensorConfigStep';
import ThemeStep from '../features/onboarding/ui/ThemeStep';
import LanguageStep from '../features/onboarding/ui/LanguageStep';
import FinalStep from '../features/onboarding/ui/FinalStep';
import { finishOnboarding } from '../app/hooks/useOnboarding';
import { AppRoutes } from '../shared/types/routes';

type OnboardingProps = {
  setIsFirstLaunch: (v: boolean) => void;
};

const TOTAL_STEPS = 5;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function Onboarding({ setIsFirstLaunch }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [data, setData] = useState<Record<string, unknown>>({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  const next = (patch: Record<string, unknown>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setDirection(1);
    setStep((s) => s + 1);
  };

  const back = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const finish = async (patch: Record<string, unknown>) => {
    const finalData = { ...data, ...patch };

    try {
      await finishOnboarding(finalData, setIsFirstLaunch);
      console.log('[Onboarding] Final data:', finalData);

      navigate(AppRoutes.CHARTS);
    } catch (err) {
      console.error('[Onboarding] Finish error:', err);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-gray-900 dark:via-background dark:to-gray-800 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <Card className="shadow-2xl border-none bg-background/60 backdrop-blur-xl">
          <CardBody className="p-6 md:p-7 space-y-6">
            {/* Заголовок */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-2"
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('onboarding.welcome')}
              </h1>
              <p className="text-sm text-default-500">
                {t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}
              </p>
            </motion.div>

            {/* Прогресс бар */}
            <Progress
              value={((step + 1) / TOTAL_STEPS) * 100}
              className="h-2"
              color="primary"
              aria-label={t('onboarding.step', { current: step + 1, total: TOTAL_STEPS })}
            />

            {/* Шаги с анимацией */}
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="w-full px-1 md:px-2 py-1"
                >
                  {step === 0 && <LanguageStep onNext={next} />}
                  {step === 1 && <ThemeStep onNext={next} onBack={back} />}
                  {step === 2 && <SensorConfigStep onNext={next} onBack={back} />}
                  {step === 3 && <PortStep onNext={next} onBack={back} />}
                  {step === 4 && <FinalStep onFinish={finish} onBack={back} data={data} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </CardBody>
        </Card>

        {/* Индикаторы шагов */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-2 mt-6"
        >
          {[...Array(TOTAL_STEPS)].map((_, i) => (
            <motion.div
              key={i}
              className={`h-2 rounded-full transition-all ${i === step
                ? 'w-8 bg-primary'
                : i < step
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-default-300'
                }`}
              animate={{
                scale: i === step ? 1.2 : 1,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
