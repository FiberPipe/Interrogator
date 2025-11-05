// PortPickerModal.tsx
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  Card,
  CardBody,
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

interface Props {
  open: boolean;
  onClose: () => void;
}

export const PortPickerModal: React.FC<Props> = ({ open, onClose }) => {
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
    if (open) load();
  }, [open, load]);

  const pickAndClose = async (path: string) => {
    if (!path) return;
    await window.portPicker.choose(path);
    onClose();
  };

  const meta = (p: PortInfo) => {
    const m: string[] = [];
    if (p.manufacturer) m.push(p.manufacturer);
    if (p.serialNumber) m.push(p.serialNumber);
    if (p.vendorId && p.productId) m.push(`${p.vendorId}:${p.productId}`);
    return m.join(" · ");
  };

  return (
    <Modal isOpen={open} onOpenChange={(v) => !v && onClose()} size="lg">
      <ModalContent>
        <ModalHeader>Select a serial port</ModalHeader>
        <ModalBody>
          <div className="flex justify-between items-center mb-2">
            <Button onPress={load} isDisabled={loading} size="sm" variant="flat">
              Refresh
            </Button>
          </div>

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
            <Card shadow="sm">
              <CardBody className="p-0">
                <div style={{ maxHeight: 250, overflowY: "auto" }}>
                  {ports.map((p) => (
                    <div
                      key={p.path}
                      onClick={() => pickAndClose(p.path)}
                      className="px-4 py-3 border-b cursor-pointer hover:bg-success-50"
                    >
                      <div className="font-medium">{p.path}</div>
                      {meta(p) && (
                        <div className="text-xs text-default-500 mt-1">{meta(p)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          <div className="flex gap-2 mt-4">
            <Input
              value={manual}
              onValueChange={setManual}
              label="Manual path"
              placeholder="Enter /dev/tty.usbserial-XXXX or COM5"
              onKeyDown={(e) => e.key === "Enter" && pickAndClose(manual.trim())}
            />
            <Button onPress={() => pickAndClose(manual.trim())} variant="bordered">
              Use
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="flat" onPress={() => window.portPicker.cancel()}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

