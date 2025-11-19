import { useEffect, useState } from "react";
import { Button, Card, CardBody, Select, SelectItem } from "@heroui/react";
import { SerialPortInfo } from "../shared/types/serial";

export function Settings() {
  const [ports, setPorts] = useState<SerialPortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);
  const [baudRate, setBaudRate] = useState(115200);
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const loadPorts = async () => {
    const p = await window.serial.getPorts();
    setPorts(p);
  };

  useEffect(() => {
    window.serial.onData((data) => {
      setLog((prev) => [...prev, String(data)]);
    });

    window.serial.onClosed((path) => {
      setConnected(false);
      setLog((prev) => [...prev, `🔌 Port closed: ${path}`]);
    });

    loadPorts();
  }, []);

  const handleConnect = async () => {
    if (!selectedPort) return;
    await window.serial.open(selectedPort, baudRate);
    setConnected(true);
    setLog((p) => [...p, `🟢 Connected to ${selectedPort}`]);
  };

  const handleDisconnect = async () => {
    if (!selectedPort) return;
    await window.serial.close(selectedPort);
    setConnected(false);
    setLog((p) => [...p, `🔴 Disconnected from ${selectedPort}`]);
  };

  return (
    <div className="p-6 flex flex-col gap-4 max-w-xl mx-auto">
      <Card>
        <CardBody className="flex flex-col gap-4">
          <h2 className="text-xl font-bold">Serial Port Manager</h2>

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
                {p.path}
                {" — "}
                {p.busy ? "Busy" : "Free"}
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
            {log.join("\n")}
          </pre>
        </CardBody>
      </Card>
    </div>
  );
}
