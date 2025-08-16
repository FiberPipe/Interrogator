import {
    Flex,
    Toc,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import './Settings.scss';
import { MainSettings, ConnectionSettings } from '@widgets/index';
import { SettingsBlock } from '@entities/Settings';

const b = block('settings-page');

export type LogLevel = 'info' | 'error' | 'warning';

export const Settings = () => {
    const TOC_ITEMS = [
        {
            content: 'Personal',
            value: 'vm'
        },
        {
            content: 'Connection',
            value: 'connection'
        },
    ];

    const SETTINGS_BLOCKS = [
        // { key: 'Основные', children: <MainSettings /> },
        { key: 'Подключение к источнику данных', children: <ConnectionSettings /> },
    ];
    return (
        <Flex className={b()} direction="row" gap={3}>
            <Flex overflow='auto' width="max" className={b('settings')}>
                {SETTINGS_BLOCKS.map(({ key, children }) =>
                    <SettingsBlock header={key} key={key}>
                        {children}
                    </SettingsBlock>
                )}
            </Flex>

            <Toc items={TOC_ITEMS} />
        </Flex>
    );
};