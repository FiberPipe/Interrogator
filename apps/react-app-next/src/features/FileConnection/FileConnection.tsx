import { FileForm, } from "@shared/ui";
import { useFileConnection } from "./useFileConnection";
import { Alert, Flex } from "@gravity-ui/uikit";
import { useInputStore } from "@shared/store";

export const FileConnection = () => {
    const { filePaths, setFilePaths } = useInputStore();
    console.log(filePaths);
    const { controlProps, triggerProps } = useFileConnection({setFilePaths});

    return (
        <Flex direction={"column"} gap={2}>
            <FileForm controlProps={controlProps} triggerProps={triggerProps} />
            <Alert theme="warning" title="Warning" message="Поддержка файлового подключения к данным скоро завершится, рекомендуется использования подключения через БД" />
        </Flex>
    )
}