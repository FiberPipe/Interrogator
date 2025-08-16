import { SettingsBlock } from "@entities/Settings";
import { DbConnection } from "@features/DbConnection";
import { Flex, Tab, TabList, TabProvider, Text } from "@gravity-ui/uikit"
import block from 'bem-cn-lite';
import { useState } from "react";

const b = block('connection-settings');


export const ConnectionSettings = () => {
    const [activeConnectionTab, setActiveConnectionTab] = useState('db');
    return (
        <Flex className={b()} direction="column" gap={2}>
            <SettingsBlock header="Подключение к источнику данных" >
                <TabProvider
                    onUpdate={(value: string) => { setActiveConnectionTab(value) }}
                    value={activeConnectionTab}
                >
                    <TabList>
                        <Tab
                            title="Db"
                            value="db"
                        >
                            База данных
                        </Tab>
                        <Tab
                            title="File"
                            value="file"
                        >
                            <Text style={{ textDecoration: 'striketrough' }}>Файл (Устаревший)</Text>
                        </Tab>
                    </TabList>
                </TabProvider>
                <DbConnection />
            </SettingsBlock>
        </Flex>
    )
}