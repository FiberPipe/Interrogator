import { Spinner, Card, CardBody } from '@heroui/react';
import { motion } from 'framer-motion';
import React from 'react';

export const AppSuspenseFallback: React.FC<{ message?: string }> = ({
  message = 'Загружаем данные...',
}) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className="w-[300px] shadow-md border border-gray-200">
          <CardBody className="flex flex-col items-center justify-center gap-4 p-6">
            <Spinner size="lg" color="primary" />
            <div className="flex flex-col items-center gap-1">
              <h2 className="text-lg font-semibold text-gray-700">{message}</h2>
              <p className="text-sm text-gray-400">Пожалуйста, подождите...</p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};
