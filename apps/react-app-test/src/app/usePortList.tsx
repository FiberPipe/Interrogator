import React from "react";

export type PortInfo = {
    path: string;
    manufacturer?: string;
    serialNumber?: string;
    vendorId?: string;
    productId?: string;
    friendlyName?: string;
};

/**
 * Хук для загрузки списка последовательных портов.
 */
export function usePortList() {
    const [ports, setPorts] = React.useState<PortInfo[] | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    const load = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await window.portPicker.list();

            // сортируем: USB → остальные → Bluetooth
            const score = (p: PortInfo) =>
                /usb|^com\d+/i.test(p.path)
                    ? 0
                    : /bluetooth/i.test(p.path)
                        ? 2
                        : 1;

            setPorts(list.sort((a, b) => score(a) - score(b)));
        } finally {
            setLoading(false);
        }
    }, []);

    // загружаем при первом рендере
    React.useEffect(() => {
        load();
    }, [load]);

    return { ports, loading, error, reload: load };
}
