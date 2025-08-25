// import { useState, useEffect } from 'react';
// import {
//     Card,
//     Text,
//     Divider,
//     Flex,
//     Switch,
//     Progress,
// } from '@gravity-ui/uikit';
// import block from 'bem-cn-lite';
// import './InterrogatorLightManagement.scss';
// import { RadiationSourceCurrentManager } from '@features/RadiationSourceCurrent';
// import { TermalControllerCurrent } from '@features/TermalControllerCurrent';
// import { AmplificationCoefficient } from '@features/AmplificationCoefficient';
// import { DisplacementCoefficient } from '@features/DisplacementCoefficient';

// // 👇 типизация того, что нам отдаёт grpc
// interface MonitoringData {
//     minOpticalPower_dBm: number;
//     maxLaserCurrent_mA: number;
//     currentTemperature_C: number;
// }

// // 👇 импортируем grpc-обёртку, которую ты сделал в preload/bridge
// const { grpc } = window.electron;

// const b = block('light-management-widget');

// export const InterrogatorLightManagement = () => {
//     const [autoMode, setAutoMode] = useState(false);

//     const [minOpticalPower, setMinOpticalPower] = useState<number>(0);
//     const [maxLaserCurrent, setMaxLaserCurrent] = useState<number>(0);
//     const [currentTemperature, setCurrentTemperature] = useState<number>(0);

//     useEffect(() => {
//         let isMounted = true;

//         const fetchMonitoring = async () => {
//             try {
//                 // ⚡ например, данные берём из listDrivers (или listBdiModules / listTestSources)
//                 // пока допустим, что первый драйвер содержит мониторинг
//                 const drivers = await grpc.listDrivers();

//                 console.log(drivers)
//                 if (isMounted && drivers.length > 0) {
//                     const m: MonitoringData = drivers[0]; // <- или распарсить под себя
//                     setMinOpticalPower(m.minOpticalPower_dBm ?? 0);
//                     setMaxLaserCurrent(m.maxLaserCurrent_mA ?? 0);
//                     setCurrentTemperature(m.currentTemperature_C ?? 0);
//                 }
//             } catch (e) {
//                 console.error("Ошибка получения данных через grpc:", e);
//             }
//         };

//         fetchMonitoring();
//         const interval = setInterval(fetchMonitoring, 2000);

//         return () => {
//             isMounted = false;
//             clearInterval(interval);
//         };
//     }, []);

//     return (
//         <div className={b()}>
//             <Card view="outlined" className={b('light-manager-card')}>
//                 <Flex>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
//                         <Text variant="header-2">Управление источником излучения</Text>
//                         <div style={{ display: 'flex', alignItems: 'center' }}>
//                             <Text variant="body-2" className="mr-2">Автоматический режим</Text>
//                             <Switch checked={autoMode} onChange={() => setAutoMode(!autoMode)} />
//                         </div>
//                     </div>
//                 </Flex>
//                 <Flex direction="column" gap={2}>
//                     <RadiationSourceCurrentManager />
//                     <Divider className="my-4" />
//                     <TermalControllerCurrent />
//                     <Divider className="my-4" />
//                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
//                         <AmplificationCoefficient />
//                         <DisplacementCoefficient />
//                     </div>
//                 </Flex>
//             </Card>

//             {/* 🔥 Мониторинг параметров */}
//             <Card view="outlined" className="mb-4">
//                 <Flex>
//                     <Text variant="header-2">Мониторинг параметров</Text>
//                 </Flex>
//                 <Flex>
//                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
//                         <Card view="outlined">
//                             <Flex style={{ flexDirection: 'column', textAlign: 'center', padding: '16px' }}>
//                                 <Text variant="body-2" color="secondary" className="mb-2">Мин. оптическая мощность</Text>
//                                 <Text variant="display-3" color="brand" className="mb-0">
//                                     {minOpticalPower.toFixed(2)} дБм
//                                 </Text>
//                             </Flex>
//                         </Card>

//                         <Card view="outlined">
//                             <Flex style={{ flexDirection: 'column', textAlign: 'center', padding: '16px' }}>
//                                 <Text variant="body-2" color="secondary" className="mb-2">Макс. ток КИИ</Text>
//                                 <Text variant="display-3" color="info" className="mb-0">
//                                     {maxLaserCurrent} мА
//                                 </Text>
//                             </Flex>
//                         </Card>

//                         <Card view="outlined">
//                             <Flex style={{ flexDirection: 'column', textAlign: 'center', padding: '16px' }}>
//                                 <Text variant="body-2" color="secondary" className="mb-2">Текущая температура</Text>
//                                 <Text variant="display-3" color="warning" className="mb-2">
//                                     {currentTemperature.toFixed(1)} °C
//                                 </Text>
//                                 <Progress
//                                     value={((currentTemperature - 15) / 25) * 100}
//                                     theme="warning"
//                                 />
//                             </Flex>
//                         </Card>
//                     </div>
//                 </Flex>
//             </Card>

//             <Card view="outlined" className="info-panel" style={{ backgroundColor: 'var(--g-color-base-info-light)' }}>
//                 <Flex>
//                     <Text variant="subheader-1" className="mb-2">Информация о системе</Text>
//                     <div style={{ fontSize: '14px', color: 'var(--g-color-text-primary)' }}>
//                         <div>• Диапазон тока КИИ: 0 - 3000 мА</div>
//                         <div>• Диапазон тока TEC: ±4000 мА</div>
//                         <div>• Диапазон температур: 15 - 40 °C</div>
//                         <div>• Данные обновляются каждые 2 секунды</div>
//                     </div>
//                 </Flex>
//             </Card>
//         </div>
//     )
// };


import block from "bem-cn-lite";
import "./InterrogatorLightManagement.scss";
import { InterrogatorDiscovery } from "@features/InterrogatorDiscovery";

const b = block("light-management-widget");

export const InterrogatorLightManagement = () => {

    return (
        <div className={b()}>
            <InterrogatorDiscovery />
            {/* Мониторинг параметров */}
            {/* <Card view="outlined" className="mb-4" style={{ marginTop: 16 }}>
                <Flex>
                    <Text variant="header-2">Мониторинг параметров</Text>
                </Flex>
                <Flex>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "16px",
                            width: "100%",
                        }}
                    >
                        <Card view="outlined">
                            <Flex
                                style={{
                                    flexDirection: "column",
                                    textAlign: "center",
                                    padding: "16px",
                                }}
                            >
                                <Text variant="body-2" color="secondary" className="mb-2">
                                    Мин. оптическая мощность
                                </Text>
                                <Text variant="display-3" color="brand" className="mb-0">
                                    {minOpticalPower.toFixed(2)} дБм
                                </Text>
                            </Flex>
                        </Card>

                        <Card view="outlined">
                            <Flex
                                style={{
                                    flexDirection: "column",
                                    textAlign: "center",
                                    padding: "16px",
                                }}
                            >
                                <Text variant="body-2" color="secondary" className="mb-2">
                                    Макс. ток КИИ
                                </Text>
                                <Text variant="display-3" color="info" className="mb-0">
                                    {maxLaserCurrent} мА
                                </Text>
                            </Flex>
                        </Card>

                        <Card view="outlined">
                            <Flex
                                style={{
                                    flexDirection: "column",
                                    textAlign: "center",
                                    padding: "16px",
                                }}
                            >
                                <Text variant="body-2" color="secondary" className="mb-2">
                                    Текущая температура
                                </Text>
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
        </div>
    );
};

