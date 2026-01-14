import { Card, CardBody, CardHeader, Input, Divider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';
import { MIN_SENSORS, MAX_SENSORS } from '../../../entities/sensor/model/constants';

interface SensorCountInputProps {
    value: number;
    onChange: (count: number) => void;
}

export const SensorCountInput = ({ value, onChange }: SensorCountInputProps) => {
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val >= MIN_SENSORS && val <= MAX_SENSORS) {
            onChange(val);
        } else if (e.target.value === '') {
            onChange(0);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card>
                <CardHeader className="flex gap-3">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <Hash className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-lg font-semibold">{t('sensors.count.title')}</h4>
                        <p className="text-sm text-default-500">{t('sensors.count.description')}</p>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody>
                    <Input
                        type="number"
                        min={MIN_SENSORS}
                        max={MAX_SENSORS}
                        value={value > 0 ? String(value) : ''}
                        placeholder={t('sensors.count.placeholder')}
                        onChange={handleChange}
                        label={t('sensors.count.label')}
                        labelPlacement="outside"
                        description={`${MIN_SENSORS}-${MAX_SENSORS} ${t('sensors.count.label').toLowerCase()}`}
                        startContent={<Hash className="w-4 h-4 text-default-400" />}
                    />
                </CardBody>
            </Card>
        </motion.div>
    );
};
