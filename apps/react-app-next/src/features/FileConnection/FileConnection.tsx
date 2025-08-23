import { FileForm, } from "@shared/ui";
import { useFileConnection } from "./useFileConnection";
import { Alert, Button, Flex, TextInput } from "@gravity-ui/uikit";
import { useInputStore } from "@shared/store";
import block from "bem-cn-lite";

import './FileConnection.scss';
import { useEffect, useState } from "react";

const b = block('file-connection');

export const FileConnection = () => {
    const { filePaths, setFilePaths } = useInputStore();
    const { controlProps, triggerProps } = useFileConnection({ setFilePaths });

    const [localPath, setLocalPath] = useState(filePaths?.sensorDataFilePath ?? "");

    useEffect(() => {
        setLocalPath(filePaths?.sensorDataFilePath ?? "");
    }, [filePaths?.sensorDataFilePath]);

    const isChanged = localPath !== (filePaths?.sensorDataFilePath ?? "");

    const handleSave = () => {
        setFilePaths({
            ...filePaths,
            sensorDataFilePath: localPath,
        });
    };

    return (
        <Flex direction={"column"} gap={2} className={b()}>
            <Flex gap={2} direction="row">
                {Boolean(filePaths?.sensorDataFilePath) && <TextInput value={localPath} size="l" hasClear={true} onUpdate={setLocalPath} />}
                {isChanged && (
                    <Button view="action" size="l" onClick={handleSave}>
                        Сохранить
                    </Button>
                )}
            </Flex>

            <FileForm controlProps={controlProps} triggerProps={triggerProps} />
            <Alert theme="warning" title="Предупреждение" message="Поддержка файлового подключения к данным скоро завершится, рекомендуется использования подключения через БД" />
        </Flex>
    )
}