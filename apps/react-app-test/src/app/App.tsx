import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroUIProvider, Modal, ModalBody, ModalHeader, ModalContent, Button, Spinner, Input, Card, CardBody } from "@heroui/react";
import { Header } from "../widgets";
import { PageContainer } from "../shared";
import { AppRouter } from "./providers/router/AppRouter";
import "./styles/global.css";
import { usePortList } from "./usePortList";

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

export const PortPickerModal: React.FC<{
  onSelect: (path: string) => void;
}> = ({ onSelect }) => {
  const { ports, loading, reload } = usePortList();
  const [manual, setManual] = React.useState("");

  const meta = (p: PortInfo) => {
    const m: string[] = [];
    if (p.manufacturer) m.push(p.manufacturer);
    if (p.serialNumber) m.push(p.serialNumber);
    if (p.vendorId && p.productId) m.push(`${p.vendorId}:${p.productId}`);
    return m.join(" · ");
  };

  const handlePick = async (path: string) => {
    await window.portPicker.choose(path);
    onSelect(path);
  };

  const handleManual = async () => {
    const m = manual.trim();
    if (m) await handlePick(m);
  };

  return (
    <Modal isOpen hideCloseButton>
      <ModalContent>
        <ModalHeader className="text-lg font-semibold">Select a serial port</ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          <p className="text-default-500">Click a path below or enter a custom path.</p>

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
                      onClick={() => handlePick(p.path)}
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
              onKeyDown={(e) => e.key === "Enter" && handleManual()}
            />
            <Button onPress={handleManual} variant="bordered">
              Use
            </Button>
          </div>

          <div className="flex justify-between items-center mt-2">
            <Button variant="flat" onPress={reload} isDisabled={loading}>
              Refresh
            </Button>
            <Button variant="flat" color="default" onPress={() => window.portPicker.cancel()}>
              Cancel
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};


const App = () => {
  const navigate = useNavigate();
  const [selectedPort, setSelectedPort] = React.useState<string | null>(null);

  React.useEffect(() => {
    window.electron?.subscribe("message", (data) => {
      console.log("message:", data);
    });
  }, []);


  return (
    <HeroUIProvider navigate={navigate}>
      <div className="page">
        <Header />

        {!selectedPort && (
          <PortPickerModal onSelect={(path) => setSelectedPort(path)} />
        )}

        {selectedPort && (
          <PageContainer>
            <AppRouter />
          </PageContainer>
        )}
      </div>
    </HeroUIProvider>
  );
};

export default App;
