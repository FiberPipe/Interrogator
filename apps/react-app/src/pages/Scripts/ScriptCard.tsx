import { Pencil, Play, Square, TrashBin } from '@gravity-ui/icons';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Chip,
    Input,
    Textarea,
    Button,
    Divider
} from '@nextui-org/react';
import { useState, useEffect } from 'react';

interface Script {
    id: number;
    name: string;
    path: string;
    language: string;
    startType: 'manual' | 'auto';
    status: 'stopped' | 'running' | 'completed' | 'error';
    output?: string;
    error?: string;
    description?: string;
}

interface ScriptCardProps {
    script: Script;
    onRun: (id: number) => void;
    onStop: (id: number) => void;
    onEdit: (script: Script) => void;
    onDelete: (id: number) => void;
}

export const ScriptCard = ({
    script,
    onRun,
    onStop,
    onEdit,
    onDelete
}: ScriptCardProps) => {
    const [pythonInfo, setPythonInfo] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);

    // Проверка доступности Python (имитация)
    useEffect(() => {
        const checkPython = async () => {
            // В реальном приложении здесь был бы вызов API для проверки
            await new Promise(resolve => setTimeout(resolve, 500));
            setPythonInfo(Math.random() > 0.3 ? "Python 3.10 found" : "Python not found");
        };

        if (script.language === 'Python') {
            checkPython();
        }
    }, [script.language]);

    const toggleExpand = () => setExpanded(!expanded);

    const statusColor = {
        running: "success",
        stopped: "default",
        completed: "primary",
        error: "danger"
    }[script.status];

    return (
        <Card className="max-w-[600px] w-full mb-4">
            <CardHeader className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="font-semibold">{script.name}</span>
                    {script.description && (
                        <span className="text-xs text-gray-500">{script.description}</span>
                    )}
                </div>

                <div className="flex gap-2">
                    {pythonInfo && (
                        <Chip
                            size="sm"
                            variant="flat"
                            color={pythonInfo.includes("found") ? "success" : "danger"}
                        >
                            {pythonInfo}
                        </Chip>
                    )}
                    <Chip
                        color={statusColor}
                        variant="flat"
                    >
                        {script.status.charAt(0).toUpperCase() + script.status.slice(1)}
                    </Chip>
                </div>
            </CardHeader>

            <Divider />

            <CardBody className="gap-4">
                <div>
                    <Input
                        label="Script Path"
                        placeholder="Path to script"
                        value={script.path}
                        readOnly
                        variant="bordered"
                        endContent={
                            <Chip size="sm" variant="flat">
                                {script.language}
                            </Chip>
                        }
                    />
                </div>

                {(script.output || script.error) && expanded && (
                    <div className="space-y-3">
                        {script.output && (
                            <div>
                                <p className="text-sm font-medium mb-1">Output:</p>
                                <Textarea
                                    value={script.output}
                                    readOnly
                                    minRows={3}
                                    maxRows={6}
                                    className="font-mono text-xs"
                                    variant="bordered"
                                />
                            </div>
                        )}

                        {script.error && (
                            <div>
                                <p className="text-sm font-medium mb-1">Errors:</p>
                                <Textarea
                                    value={script.error}
                                    readOnly
                                    minRows={2}
                                    maxRows={4}
                                    className="font-mono text-xs"
                                    color="danger"
                                    variant="bordered"
                                />
                            </div>
                        )}
                    </div>
                )}
            </CardBody>

            <Divider />

            <CardFooter className="flex justify-between gap-2">
                <div className="flex gap-2">
                    <Button
                        color={script.status === 'running' ? "danger" : "primary"}
                        onClick={() => script.status === 'running' ? onStop(script.id) : onRun(script.id)}
                        startContent={script.status === 'running' ? <Square /> : <Play />}
                        size="sm"
                    >
                        {script.status === 'running' ? "Stop" : "Run"}
                    </Button>

                    {(script.output || script.error) && (
                        <Button
                            variant="flat"
                            size="sm"
                            onClick={toggleExpand}
                        >
                            {expanded ? "Hide Logs" : "Show Logs"}
                        </Button>
                    )}
                </div>

                <div className="flex gap-1">
                    <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        onClick={() => onEdit(script)}
                    >
                        <Pencil />
                    </Button>

                    <Button
                        isIconOnly
                        variant="flat"
                        color="danger"
                        size="sm"
                        onClick={() => onDelete(script.id)}
                    >
                        <TrashBin />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
