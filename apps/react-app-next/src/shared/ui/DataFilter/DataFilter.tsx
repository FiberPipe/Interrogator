import React, { useState } from 'react';
import {
    Select,
    TextInput,
    Button,
    Flex,
    Card,
    Text
} from '@gravity-ui/uikit';

// Определяем типы для фильтров с множественным выбором
type FilterValues = {
    interrogatorNumbers?: string[];
    sensorNumber?: string | null;
};

// Список доступных интеррогаторов (для примера)
const interrogators = [
    { value: '1', content: 'Интеррогатор #1' },
    { value: '2', content: 'Интеррогатор #2' },
    { value: '3', content: 'Интеррогатор #3' },
    { value: '4', content: 'Интеррогатор #4' },
    { value: '5', content: 'Интеррогатор #5' },
];

// Список доступных датчиков (для примера)
const sensors = [
    { value: '101', content: 'Датчик #101' },
    { value: '102', content: 'Датчик #102' },
    { value: '103', content: 'Датчик #103' },
    { value: '201', content: 'Датчик #201' },
    { value: '202', content: 'Датчик #202' },
    { value: '301', content: 'Датчик #301' },
];

export const DataFilters: React.FC<{
    //   onApplyFilters: (filters: FilterValues) => void;
}> = () => {
    const [filters, setFilters] = useState<FilterValues>({
        interrogatorNumbers: [],
        sensorNumber: null
    });

    // Обработчик изменения выбора интеррогаторов
    const handleInterrogatorsChange = (values: string[]) => {
        setFilters(prev => ({
            ...prev,
            interrogatorNumbers: values
        }));
    };

    // Обработчик изменения выбора датчиков
    const handleSensorsChange = (values: string[]) => {
        setFilters(prev => ({
            ...prev,
            sensorNumbers: values
        }));
    };

    // Обработчик изменения текстового поля для датчика
    const handleSensorNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({
            ...prev,
            sensorNumber: e.target.value || null
        }));
    };

    // Обработчик сброса фильтров
    const handleReset = () => {
        setFilters({
            interrogatorNumbers: [],
            sensorNumber: null
        });
    };

    // Обработчик применения фильтров
    const handleApply = () => {
        // onApplyFilters(filters);
    };

    return (
        <Card view="outlined" className="filters-card">
            <Flex direction="column" gap={4}>
                <Text variant="subheader-1">Фильтры данных</Text>

                <Flex direction="row" gap={4} wrap="wrap">
                    {/* Множественный выбор интеррогаторов */}
                    <Flex direction="column" gap={1} style={{ minWidth: 250 }}>
                        <Text variant="body-2" color="secondary">Номера интеррогаторов</Text>
                        <Select
                            value={filters.interrogatorNumbers}
                            options={interrogators}
                            placeholder="Выберите интеррогаторы"
                            onUpdate={handleInterrogatorsChange}
                            multiple={true}
                            filterable={true}
                            filterPlaceholder="Поиск по номеру..."
                            width="max"
                        />
                    </Flex>

                    {/* Поле для ввода номера датчика */}
                    <Flex direction="column" gap={1} style={{ minWidth: 200 }}>
                        <Text variant="body-2" color="secondary">Номер датчика</Text>
                        <TextInput
                            value={filters.sensorNumber || ''}
                            placeholder="Введите номер датчика"
                            onChange={handleSensorNumberChange}
                        />
                    </Flex>

                    {/* Альтернативно: множественный выбор датчиков */}
                    <Flex direction="column" gap={1} style={{ minWidth: 250 }}>
                        <Text variant="body-2" color="secondary">Выбор датчиков</Text>
                        <Select
                            value={filters.sensorNumbers || []}
                            options={sensors}
                            placeholder="Выберите датчики"
                            onUpdate={handleSensorsChange}
                            multiple={true}
                            filterable={true}
                            filterPlaceholder="Поиск по номеру..."
                            width="max"
                        />
                    </Flex>
                </Flex>

                {/* Кнопки управления */}
                <Flex gap={2} justifyContent="flex-end">
                    <Button view="flat" onClick={handleReset}>
                        Сбросить
                    </Button>
                    <Button view="action" onClick={handleApply}>
                        Применить
                    </Button>
                </Flex>
            </Flex>
        </Card>
    );
};
