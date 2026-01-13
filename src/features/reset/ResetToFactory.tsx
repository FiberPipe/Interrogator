import { Card, CardBody, CardHeader, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { addSuccessToaster } from '../../shared/ui';

interface ResetToFactoryCardProps {
    onReset?: () => void;
}

export const ResetToFactoryCard = ({ onReset }: ResetToFactoryCardProps) => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleReset = async () => {
        setLoading(true);
        try {
            await window.appData.patch({
                isFirstLaunch: true,
                language: 'ru',
                theme: 'system',
                lastPort: '',
                baudRate: 9600,
                autoConnect: false,
            });

            addSuccessToaster(
                t('settings.reset.success'),
                t('settings.reset.successDescription')
            );

            setTimeout(() => {
                onReset?.();
            }, 500);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card className="border-2 border-danger-200 dark:border-danger-900">
                <CardHeader className="flex gap-3">
                    <div className="p-2 rounded-lg bg-danger-100 dark:bg-danger-900/30">
                        <RotateCcw className="w-5 h-5 text-danger" />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-lg font-semibold text-danger">
                            {t('settings.reset.title')}
                        </h4>
                        <p className="text-sm text-default-500">
                            {t('settings.reset.description')}
                        </p>
                    </div>
                </CardHeader>

                <CardBody>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            color="danger"
                            variant="flat"
                            fullWidth
                            onPress={onOpen}
                            startContent={<RotateCcw className="w-4 h-4" />}
                        >
                            {t('settings.reset.button')}
                        </Button>
                    </motion.div>
                </CardBody>
            </Card>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex gap-2 items-center">
                                <AlertTriangle className="w-5 h-5 text-danger" />
                                {t('settings.reset.confirm')}
                            </ModalHeader>
                            <ModalBody>
                                <p>{t('settings.reset.confirmDescription')}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    {t('settings.reset.cancel')}
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={() => {
                                        handleReset();
                                        onClose();
                                    }}
                                    isLoading={loading}
                                >
                                    {t('settings.reset.reset')}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
