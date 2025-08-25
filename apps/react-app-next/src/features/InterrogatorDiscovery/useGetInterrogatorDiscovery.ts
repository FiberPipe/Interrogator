import { BDIModule, Driver, TestSource } from "@shared/types/grpc";
import { useState, useEffect } from "react";

export const useGetInterrogatorDiscovery = () => {
    const [bdiModules, setBdiModules] = useState<BDIModule[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [testSources, setTestSources] = useState<TestSource[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                const [bdi, drv, src] = await Promise.all([
                    window.grpc.listBdiModules(),
                    window.grpc.listDrivers(),
                    window.grpc.listTestSources(),
                ]);


                console.log(bdi, drivers, src);
                if (!mounted) return;

                setBdiModules(bdi);
                setDrivers(drv);
                setTestSources(src);

            } catch (err) {
                console.error("Ошибка получения данных через grpc:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        const interval = setInterval(fetchData, 20000);

        return () => {
            clearInterval(interval);
            mounted = false;
        };
    }, []);

    return {loading, bdi: bdiModules, drivers, testSources};
}