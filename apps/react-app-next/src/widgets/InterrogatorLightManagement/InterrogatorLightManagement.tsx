import { useState } from 'react';
import {
    Card,
    Text,
    Divider,
    Flex,
    Switch
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import './InterrogatorLightManagement.scss';
import { RadiationSourceCurrentManager } from '@features/RadiationSourceCurrent';
import { TermalControllerCurrent } from '@features/TermalControllerCurrent';
import { AmplificationCoefficient } from '@features/AmplificationCoefficient';
import { DisplacementCoefficient } from '@features/DisplacementCoefficient';

const b = block('light-management-widget');

export const InterrogatorLightManagement = () => {
    const [autoMode, setAutoMode] = useState(false);

    // const [minOpticalPower, setMinOpticalPower] = useState(0);
    // const [maxLaserCurrent, setMaxLaserCurrent] = useState(3000);
    // const [currentTemperature, setCurrentTemperature] = useState(25);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         setMinOpticalPower(-30 + Math.random() * 5);
    //         setCurrentTemperature(25 + Math.random() * 2);
    //     }, 2000);

    //     return () => clearInterval(interval);
    // }, []);

    // Функция отправки данных
    // const sendData = () => {
    //     const dataToSend = {
    //         laserCurrent,
    //         tecCurrent,
    //         amplifierGain,
    //         amplifierOffset
    //     };
    //     console.log("Отправка данных в ПАИ:", dataToSend);
    //     // Здесь должен быть API запрос
    // };

    return (
        <div className={b()}>
            <Card view="outlined" className={b('light-manager-card')}>
                <Flex>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Text variant="header-2">Управление источником излучения</Text>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Text variant="body-2" className="mr-2">Автоматический режим</Text>
                            <Switch checked={autoMode} onChange={() => setAutoMode(!autoMode)} />
                        </div>
                    </div>
                </Flex>
                <Flex direction="column" gap={2}>
                    <RadiationSourceCurrentManager />

                    <Divider className="my-4" />

                    <TermalControllerCurrent />

                    <Divider className="my-4" />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                        <AmplificationCoefficient />
                        <DisplacementCoefficient />
                    </div>

                    <Divider className="my-4" />

                    {/* <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            view="action"
                            size="l"
                            onClick={() => {}}
                            disabled={autoMode}
                            style={{ minWidth: '200px' }}
                        >
                            Применить настройки
                        </Button>
                    </div> */}
                </Flex>
            </Card>

            {/* <Card view="outlined" className="mb-4">
                <Flex>
                    <Text variant="header-2">Мониторинг параметров</Text>
                </Flex>
                <Flex>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        <Card view="outlined">
                            <Flex style={{ textAlign: 'center', padding: '16px' }}>
                                <Text variant="body-2" color="secondary" className="mb-2">Мин. оптическая мощность</Text>
                                <Text variant="display-3" color="brand" className="mb-0">
                                    {minOpticalPower.toFixed(2)} дБм
                                </Text>
                            </Flex>
                        </Card>

                        <Card view="outlined">
                            <Flex style={{ textAlign: 'center', padding: '16px' }}>
                                <Text variant="body-2" color="secondary" className="mb-2">Макс. ток КИИ</Text>
                                <Text variant="display-3" color="info" className="mb-0">
                                    {maxLaserCurrent} мА
                                </Text>
                            </Flex>
                        </Card>

                        <Card view="outlined">
                            <Flex style={{ textAlign: 'center', padding: '16px' }}>
                                <Text variant="body-2" color="secondary" className="mb-2">Текущая температура</Text>
                                <Text variant="display-3" color="warning" className="mb-2">
                                    {currentTemperature.toFixed(1)} °C
                                </Text>
                                <Progress
                                    value={((currentTemperature - 15) / 25) * 100}
                                    theme="warning"
                                />
                            </Flex>
                        </Card>
                    </div>
                </Flex>
            </Card> */}

            <Card view="outlined" className="info-panel" style={{ backgroundColor: 'var(--g-color-base-info-light)' }}>
                <Flex>
                    <Text variant="subheader-1" className="mb-2">Информация о системе</Text>
                    <div style={{ fontSize: '14px', color: 'var(--g-color-text-primary)' }}>
                        <div>• Диапазон тока КИИ: 0 - 3000 мА</div>
                        <div>• Диапазон тока TEC: ±4000 мА</div>
                        <div>• Диапазон температур: 15 - 40 °C</div>
                        <div>• Данные обновляются каждые 2 секунды</div>
                    </div>
                </Flex>
            </Card>
        </div>
    )
}