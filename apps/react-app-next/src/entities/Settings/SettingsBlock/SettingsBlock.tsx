import { Divider, Flex, Text } from "@gravity-ui/uikit";
import type { ReactNode } from "react";
import block from "bem-cn-lite";

const b = block('settings-block');

interface SettingsBlockProps {
    header: string;
    labels?: ReactNode | ReactNode[];
    children: ReactNode | ReactNode[];
}

export const SettingsBlock = ({ header, labels, children }: SettingsBlockProps) => {
    return (
        <Flex gap={3} className={b()} direction={"column"}>
            <Text variant="subheader-1">{header}</Text>
            {labels ? <Flex className={b('labels')}>{labels}</Flex> : null}
            <Flex className={b('content')} direction={"column"} gap={2}>
                {children}
            </Flex>
            <Divider />
        </Flex>
    )
}