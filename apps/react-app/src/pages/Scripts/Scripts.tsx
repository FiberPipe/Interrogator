import { useState, useEffect } from 'react';
import { ScriptModal } from './ScriptsModal';
import { Plus } from '@gravity-ui/icons';
import { Button } from '@nextui-org/react';
import { ScriptCard } from './ScriptCard';

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

export const Scripts = () => {
    const [scripts, setScripts] = useState<Script[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScript, setEditingScript] = useState<Script | null>(null);

    // Загрузка скриптов из localStorage
    useEffect(() => {
        const savedScripts = localStorage.getItem('scripts');
        if (savedScripts) {
            setScripts(JSON.parse(savedScripts));
        }
    }, []);

    // Сохранение скриптов в localStorage
    useEffect(() => {
        localStorage.setItem('scripts', JSON.stringify(scripts));
    }, [scripts]);

    const handleSaveScript = (scriptData: Script) => {
        const newScript: Script = {
            id: scriptData.id || Date.now(),
            name: scriptData.name,
            path: scriptData.path,
            language: scriptData.language,
            startType: scriptData.startType,
            status: 'stopped',
            description: scriptData.description,
        };

        setScripts(prev =>
            editingScript
                ? prev.map(s => s.id === editingScript.id ? newScript : s)
                : [...prev, newScript]
        );

        setEditingScript(null);
    };

    const handleRun = (id: number) => {
        setScripts(scripts.map(s =>
            s.id === id
                ? { ...s, status: 'running', output: '', error: '' }
                : s
        ));

        // Имитация выполнения скрипта
        setTimeout(() => {
            setScripts(scripts.map(s => {
                if (s.id === id) {
                    const success = Math.random() > 0.2;
                    return {
                        ...s,
                        status: success ? 'completed' : 'error',
                        output: success
                            ? `Execution completed at ${new Date().toLocaleTimeString()}\nResult: ${Math.floor(Math.random() * 100)}`
                            : '',
                        error: success
                            ? ''
                            : `Error at ${new Date().toLocaleTimeString()}\nSomething went wrong!`
                    };
                }
                return s;
            }));
        }, 3000);
    };

    const handleStop = (id: number) => {
        setScripts(scripts.map(s =>
            s.id === id
                ? { ...s, status: 'stopped', output: 'Execution stopped by user' }
                : s
        ));
    };

    const deleteScript = (id: number) => {
        setScripts(scripts.filter(s => s.id !== id));
    };

    const editScript = (script: Script) => {
        setEditingScript(script);
        setIsModalOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'primary';
            case 'completed': return 'success';
            case 'error': return 'danger';
            default: return 'default';
        }
    };

    return (
        <div className="p-4">
            <Button
                color="primary"
                startContent={<Plus />}
                onClick={() => setIsModalOpen(true)}
                className="mb-6"
            >
                Добавить скрипт
            </Button>

            {/* Модальное окно */}
            <ScriptModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingScript(null);
                }}
                onSave={handleSaveScript}
                editingScript={editingScript}
            />

            <div className="space-y-4">
                {scripts.map(script => (
                    <ScriptCard
                        key={script.id}
                        script={script}
                        onRun={handleRun}
                        onStop={handleStop}
                        onEdit={editScript}
                        onDelete={deleteScript}
                    />
                ))}
            </div>

            {scripts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <p>Нет добавленных скриптов</p>
                    <Button
                        color="primary"
                        variant="light"
                        className="mt-4"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Добавить первый скрипт
                    </Button>
                </div>
            )}
        </div>
    );
};
