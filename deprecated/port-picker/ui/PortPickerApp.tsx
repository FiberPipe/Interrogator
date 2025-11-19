import React from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Card,
  CardBody,
  Input,
  Spinner,
} from "@heroui/react";

type PortInfo = {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
  friendlyName?: string;
};

declare global {
  interface Window {
    portPicker: {
      list: () => Promise<PortInfo[]>;
      choose: (p: string) => Promise<void>;
      cancel: () => Promise<void>;
    };
  }
}

function App() {
  const [ports, setPorts] = React.useState<PortInfo[] | null>(null);
  const [manual, setManual] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await window.portPicker.list();
      const score = (p: PortInfo) =>
        /usb|^com\d+/i.test(p.path) ? 0 : /bluetooth/i.test(p.path) ? 2 : 1;
      setPorts(list.sort((a, b) => score(a) - score(b)));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const meta = (p: PortInfo) => {
    const m: string[] = [];
    if (p.manufacturer) m.push(p.manufacturer);
    if (p.serialNumber) m.push(p.serialNumber);
    if (p.vendorId && p.productId) m.push(`${p.vendorId}:${p.productId}`);
    return m.join(" · ");
  };

  const pickAndClose = async (path: string) => {
    if (!path) return;
    // мгновенно подтверждаем выбор по клику
    await window.portPicker.choose(path);
  };

  const onUseManual = async () => {
    const m = manual.trim();
    if (m) await pickAndClose(m);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-4" style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Select a serial port</h1>
        <Button variant="flat" onPress={load} isDisabled={loading}>
          Refresh
        </Button>
      </div>

      <p className="text-default-500">
        Click a path below or enter a custom path.
      </p>

      <Card className="w-full" shadow="sm">
        <CardBody className="p-0">
          {loading && (
            <div className="flex items-center gap-2 p-4">
              <Spinner size="sm" />
              <span>Loading ports…</span>
            </div>
          )}

          {!loading && ports && ports.length === 0 && (
            <div className="p-4 text-default-500">
              No ports found. Connect your device and click <b>Refresh</b>.
            </div>
          )}

          {!loading && ports && ports.length > 0 && (
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {ports.map((p) => (
                <div
                  key={p.path}
                  role="button"
                  onClick={() => pickAndClose(p.path)}         // ← автоподтверждение
                  className="px-4 py-3 border-b border-default-200 cursor-pointer hover:bg-success-50"
                >
                  <div className="font-medium">{p.path}</div>
                  {meta(p) && <div className="text-xs text-default-500 mt-1">{meta(p)}</div>}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="flex gap-2">
        <Input
          value={manual}
          onValueChange={setManual}
          label="Manual path"
          placeholder="Enter /dev/tty.usbserial-XXXX or COM5"
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && onUseManual()}
        />
        <Button onPress={onUseManual} variant="bordered">
          Use
        </Button>
      </div>

      <div className="flex justify-end">
        <Button variant="flat" color="default" onPress={() => window.portPicker.cancel()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// если этот файл используется как entry напрямую
const mount = document.getElementById("root");
if (mount) {
  const root = createRoot(mount);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

export default App;
