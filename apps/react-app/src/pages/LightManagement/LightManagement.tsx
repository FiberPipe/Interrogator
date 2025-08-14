import {
    Card,
    CardBody,
    CardHeader,
    Slider,
    Input,
    Button,
    Divider,
    Chip,
    Switch
} from "@nextui-org/react";
import { useState, useEffect } from "react";

export const LightManagement = () => {
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

    // Функция отправки данных
    const sendData = () => {
        const dataToSend = {
            laserCurrent,
            tecCurrent,
            amplifierGain,
            amplifierOffset
        };
        console.log("Отправка данных в ПАИ:", dataToSend);
        // Здесь должен быть API запрос
    };

    // Расчет температуры на основе тока TEC
    const calculateTargetTemp = (current: number) => {
        // Линейная интерполяция: -4A = 15°C, 0A = 27.5°C, +4A = 40°C
        return 27.5 + (current * 3.125);
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Управление источником излучения</h2>
                    <Switch
                        isSelected={autoMode}
                        onValueChange={setAutoMode}
                        size="sm"
                    >
                        Автоматический режим
                    </Switch>
                </CardHeader>
                <CardBody className="space-y-6">
                    {/* Управление током КИИ */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">
                                Ток источника излучения (КИИ)
                            </label>
                            <Chip color="primary" variant="flat">
                                {laserCurrent} мА
                            </Chip>
                        </div>
                        <Slider
                            size="sm"
                            step={10}
                            minValue={0}
                            maxValue={3000}
                            value={laserCurrent}
                            onChange={(value) => setLaserCurrent(Number(value))}
                            className="max-w-full"
                            isDisabled={autoMode}
                            color="primary"
                            showTooltip
                            renderValue={({ children, ...props }) => (
                                <output {...props}>
                                    <span className="text-small">{children} мА</span>
                                </output>
                            )}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0 мА</span>
                            <span>3000 мА</span>
                        </div>
                    </div>

                    <Divider />

                    {/* Управление температурой */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">
                                Ток термоконтроллера (TEC)
                            </label>
                            <div className="flex gap-2">
                                <Chip color="secondary" variant="flat">
                                    {tecCurrent} мА
                                </Chip>
                                <Chip color="warning" variant="flat">
                                    Целевая: {calculateTargetTemp(tecCurrent / 1000).toFixed(1)}°C
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
                            className="max-w-full"
                            isDisabled={autoMode}
                            color="secondary"
                            showTooltip
                            renderValue={({ children, ...props }) => (
                                <output {...props}>
                                    <span className="text-small">{children} мА</span>
                                </output>
                            )}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>-4000 мА (15°C)</span>
                            <span>0 мА (27.5°C)</span>
                            <span>+4000 мА (40°C)</span>
                        </div>
                    </div>

                    <Divider />

                    {/* Управление усилителем */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Коэффициент усиления (КУ) ТИА
                            </label>
                            <Input
                                type="number"
                                placeholder="1.0"
                                value={amplifierGain.toString()}
                                onChange={(e) => setAmplifierGain(Number(e.target.value))}
                                isDisabled={autoMode}
                                endContent={
                                    <div className="pointer-events-none flex items-center">
                                        <span className="text-default-400 text-small">x</span>
                                    </div>
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Коэффициент смещения (КС) ТИА
                            </label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={amplifierOffset.toString()}
                                onChange={(e) => setAmplifierOffset(Number(e.target.value))}
                                isDisabled={autoMode}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Кнопка отправки */}
                    <div className="flex justify-center">
                        <Button
                            color="primary"
                            size="lg"
                            onClick={sendData}
                            isDisabled={autoMode}
                            className="min-w-[200px]"
                        >
                            Применить настройки
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Карточка с получаемыми данными */}
            <Card>
                <CardHeader>
                    <h3 className="text-xl font-semibold">Мониторинг параметров</h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-3 gap-4">
                        <Card shadow="sm">
                            <CardBody className="text-center space-y-2">
                                <p className="text-sm text-gray-500">Мин. оптическая мощность</p>
                                <p className="text-2xl font-bold text-primary">
                                    {minOpticalPower.toFixed(2)} дБм
                                </p>
                            </CardBody>
                        </Card>

                        <Card shadow="sm">
                            <CardBody className="text-center space-y-2">
                                <p className="text-sm text-gray-500">Макс. ток КИИ</p>
                                <p className="text-2xl font-bold text-secondary">
                                    {maxLaserCurrent} мА
                                </p>
                            </CardBody>
                        </Card>

                        <Card shadow="sm">
                            <CardBody className="text-center space-y-2">
                                <p className="text-sm text-gray-500">Текущая температура</p>
                                <p className="text-2xl font-bold text-warning">
                                    {currentTemperature.toFixed(1)} °C
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-warning h-2 rounded-full transition-all"
                                        style={{
                                            width: `${((currentTemperature - 15) / 25) * 100}%`
                                        }}
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </CardBody>
            </Card>

            {/* Информационная панель */}
            <Card className="bg-blue-50 dark:bg-blue-950">
                <CardBody>
                    <div className="space-y-2">
                        <h4 className="font-semibold">Информация о системе</h4>
                        <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                            <li>• Диапазон тока КИИ: 0 - 3000 мА</li>
                            <li>• Диапазон тока TEC: ±4000 мА</li>
                            <li>• Диапазон температур: 15 - 40 °C</li>
                            <li>• Данные обновляются каждые 2 секунды</li>
                        </ul>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};
