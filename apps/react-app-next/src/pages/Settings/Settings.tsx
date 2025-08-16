import {
    Flex,
    Toc,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import './Settings.scss';
import { ConnectionSettings } from './ConnectionSettings';

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

    return (
        <Flex className={b()} direction="row" gap={3}>
            {/* <SettingsHeader /> */}
            <Flex overflow='auto' width="max" className={b('settings')}>
                <ConnectionSettings />
            </Flex>

            <Toc items={TOC_ITEMS} />
        </Flex>
    );
};