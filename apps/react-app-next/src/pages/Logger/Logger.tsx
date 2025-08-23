import React, { useEffect, useState } from "react";
import { Button, Card, Flex, Modal, Text } from "@gravity-ui/uikit";
import { LogFile } from "@shared/types/log-files";

export const LogsPage: React.FC = () => {
    const [files, setFiles] = useState<LogFile[]>([]);
    const [selectedFile, setSelectedFile] = useState<LogFile | null>(null);
    const [content, setContent] = useState<string>("");

    useEffect(() => {
        const loadFiles = async () => {
            try {
                const data = await window.logger.getFiles();
                setFiles(data);
            } catch (err) {
                console.error("Не удалось загрузить файлы логов", err);
            }
        };

        loadFiles();
    }, []);

    const openFile = async (file: LogFile) => {
        try {
            setSelectedFile(file);
            const data = await window.logger.readFile(file.name)

            setContent(data);
        } catch (err) {
            console.error(`Ошибка при чтении файла ${file.name}:`, err);
        }
    };

    return (
        <Flex direction="column" gap={4} style={{ padding: 16 }}>
            <Text variant="display-2">Логи приложения</Text>

            {files.map((file) => (
                <Card
                    key={file.name}
                    style={{ marginBottom: 8, cursor: "pointer", padding: "12px" }}
                    onClick={() => { console.log(3); openFile(file) }}
                >
                    <Flex justifyContent="space-between" alignItems="center" onClick={() => { console.log(4); openFile(file) }}>
                        <Text variant="body-2">{file.name}</Text>
                        <Text variant="body-2" color="secondary">
                            {new Date(file.mtime).toLocaleString()} • {(file.size / 1024).toFixed(1)} KB
                        </Text>
                    </Flex>
                </Card>
            ))}

            <Modal open={!!selectedFile} onClose={() => setSelectedFile(null)}>
                <Flex
                    direction="column"
                    gap={2}
                    style={{ padding: 16, maxHeight: "70vh", overflowY: "auto" }}
                >
                    <Text variant="display-3">{selectedFile?.name}</Text>
                    <Flex>
                        <pre
                            style={{
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                background: "#f5f5f5",
                                padding: "12px",
                                borderRadius: "8px",
                            }}
                        >
                            {content}
                        </pre>
                    </Flex>
                    <Button view="outlined" onClick={() => setSelectedFile(null)}>
                        Закрыть
                    </Button>
                </Flex>
            </Modal>
        </Flex>
    );
};
