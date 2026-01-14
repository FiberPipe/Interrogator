import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LineChart, Table, LayoutDashboard } from 'lucide-react';
import { ViewType } from '../../entities/chart/model/types';

interface ViewTypeSelectorProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
}

const viewTypes = [
    { type: 'chart' as ViewType, icon: LineChart },
    { type: 'table' as ViewType, icon: Table },
    { type: 'dashboard' as ViewType, icon: LayoutDashboard },
];

export const ViewTypeSelector = ({ activeView, onViewChange }: ViewTypeSelectorProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex gap-1 p-1 bg-default-100 rounded-lg">
            {viewTypes.map((view) => {
                const Icon = view.icon;
                const isActive = activeView === view.type;

                return (
                    <div key={view.type} className="relative">
                        {isActive && (
                            <motion.div
                                layoutId="activeView"
                                className="absolute inset-0 bg-background rounded-md shadow-sm"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Button
                            variant="light"
                            size="sm"
                            onPress={() => onViewChange(view.type)}
                            className={`relative z-10 ${isActive ? 'text-primary' : 'text-default-600'}`}
                            startContent={<Icon className="w-4 h-4" />}
                        >
                            {t(`charts.types.${view.type}`)}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
};
