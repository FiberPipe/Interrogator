import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
    Textarea
} from '@nextui-org/react';
import { useState } from 'react';

interface Script {
    id?: number;
    name: string;
    path: string;
    language: string;
    startType: 'manual' | 'auto';
    description?: string;
}

interface ScriptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (script: Script) => void;
    editingScript?: Script | null;
}

export const ScriptModal = ({
    isOpen,
    onClose,
    onSave,
    editingScript
}: ScriptModalProps) => {
    const [formData, setFormData] = useState<Omit<Script, 'id'>>({
        name: editingScript?.name || '',
        path: editingScript?.path || '',
        language: editingScript?.language || 'Python',
        startType: editingScript?.startType || 'manual',
        description: editingScript?.description || ''
    });

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave({
            ...formData,
            id: editingScript?.id
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            placement="center"
            backdrop="blur"
        >
            <ModalContent>
                <ModalHeader className="text-xl font-bold">
                    {editingScript ? "Редактировать скрипт" : "Создать новый скрипт"}
                </ModalHeader>
                <ModalBody className="space-y-4">
                    <Input
                        label="Название скрипта"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        isRequired
                    />

                    <Input
                        label="Путь к файлу"
                        placeholder="/scripts/my_script.py"
                        value={formData.path}
                        onChange={(e) => handleInputChange('path', e.target.value)}
                        isRequired
                    />

                    <Select
                        label="Язык исполнения"
                        selectedKeys={[formData.language]}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                    >
                        <SelectItem key="Python">Python</SelectItem>
                        <SelectItem key="C">C</SelectItem>
                        <SelectItem key="C++">C++</SelectItem>
                    </Select>

                    <Select
                        label="Тип запуска"
                        selectedKeys={[formData.startType]}
                        onChange={(e) => handleInputChange('startType', e.target.value)}
                    >
                        <SelectItem key="manual">По кнопке</SelectItem>
                        <SelectItem key="auto">Автостарт</SelectItem>
                    </Select>

                    <Textarea
                        label="Описание"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button color="primary" onClick={handleSave}>
                        {editingScript ? "Сохранить" : "Создать"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
