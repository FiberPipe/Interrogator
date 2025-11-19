import { useEffect, useState } from "react";
import {
    Button,
    Card,
    CardBody,
    Select,
    SelectItem,
    Modal,
    ModalContent,
} from "@heroui/react";
import { SerialPortInfo } from "../shared/types/serial";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [ports, setPorts] = useState<SerialPortInfo[]>([]);
    const [selectedPort, setSelectedPort] = useState<string | null>(null);
    const [baudRate, setBaudRate] = useState(115200);
    const [connected, setConnected] = useState(false);
    const [log, setLog] = useState<{ type: "data" | "status"; message: string }[]>(
        []
    );

    if (!window.serial) {
        window.serial = {
            getPorts: async () => [],
            open: async () => { },
            close: async () => { },
            onData: () => { },
            onClosed: () => { },
        };
    }

    const loadPorts = async () => {
        const p = await window.serial.getPorts();
        setPorts(p);
    };

    useEffect(() => {
        window.serial.onData((data) => {
            setLog((prev) => [...prev, { type: "data", message: String(data) }]);
        });
        window.serial.onClosed((port) => {
            setConnected(false);
            setLog((prev) => [...prev, { type: "status", message: `Port closed: ${port}` }]);
        });
        loadPorts();
    }, []);

    const handleConnect = async () => {
        if (!selectedPort) return;
        await window.serial.open(selectedPort, baudRate);
        setConnected(true);
        setLog((p) => [...p, { type: "status", message: `🟢 Connected to ${selectedPort}` }]);
    };

    const handleDisconnect = async () => {
        if (!selectedPort) return;
        await window.serial.close(selectedPort);
        setConnected(false);
        setLog((p) => [...p, { type: "status", message: `🔴 Disconnected from ${selectedPort}` }]);
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
            <ModalContent className="bg-gray-900 text-white rounded-xl max-w-2xl w-full p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Serial Port Manager</h2>

                <Card className="mb-4">
                    <CardBody className="flex flex-col gap-4">
                        <Select
                            label="Select Serial Port"
                            selectedKeys={selectedPort ? [selectedPort] : []}
                            onSelectionChange={(keys) => {
                                const [val] = Array.from(keys) as string[];
                                setSelectedPort(val);
                            }}
                        >
                            {ports.map((p) => (
                                <SelectItem key={p.path} textValue={p.path}>
                                    {p.path} — {p.busy ? "Busy" : "Free"}
                                </SelectItem>
                            ))}
                        </Select>

                        <Select
                            label="Baud Rate"
                            selectedKeys={[baudRate.toString()]}
                            onSelectionChange={(keys) => {
                                const [v] = Array.from(keys);
                                setBaudRate(Number(v));
                            }}
                        >
                            {[9600, 19200, 38400, 57600, 115200].map((rate) => (
                                <SelectItem key={rate}>{rate}</SelectItem>
                            ))}
                        </Select>

                        <div className="flex gap-3">
                            {!connected ? (
                                <Button
                                    color="primary"
                                    isDisabled={!selectedPort}
                                    onPress={handleConnect}
                                >
                                    Connect
                                </Button>
                            ) : (
                                <Button color="danger" onPress={handleDisconnect}>
                                    Disconnect
                                </Button>
                            )}
                            <Button onPress={loadPorts} variant="flat">
                                Refresh
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <h3 className="font-semibold mb-2">Received Data</h3>
                        <pre className="max-h-64 overflow-auto bg-black text-green-400 p-3 rounded">
                            {log.map((l, i) => (
                                <div
                                    key={i}
                                    className={
                                        l.type === "data"
                                            ? "text-green-400"
                                            : "text-gray-300 italic"
                                    }
                                >
                                    {l.message}
                                </div>
                            ))}
                        </pre>
                    </CardBody>
                </Card>

                <div className="flex justify-end mt-4">
                    <Button variant="solid" onPress={onClose}>
                        Close
                    </Button>
                </div>
            </ModalContent>
        </Modal>
    );
}
