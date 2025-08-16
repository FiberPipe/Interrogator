import { SettingsBlock } from "@entities/Settings";
import { DbConnection } from "@features/DbConnection";
import { FileConnection } from "@features/FileConnection";
import { Flex, Tab, TabList, TabProvider, Text } from "@gravity-ui/uikit"
import block from 'bem-cn-lite';
import { useState } from "react";

const b = block('connection-settings');


export const ConnectionSettings = () => {
    const [activeConnectionTab, setActiveConnectionTab] = useState('db');
    return (
        <Flex className={b()} direction="column" gap={2}>
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
            {activeConnectionTab === 'db' && <DbConnection />}
            {activeConnectionTab === 'file' && <FileConnection />}
        </Flex>
    )
}