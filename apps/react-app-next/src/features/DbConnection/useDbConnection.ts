import type { DbConnectionStatus } from "@entities/Settings/DbSettingsLabel/types";
import { useCallback, useState } from "react";

const DEFAULT_DB_CONNECTION_PARAMS = {
    host: '',
    port: '5432',
    database: '',
    username: '',
    password: '',
    dbType: 'postgresql',
};

const DEFAULT_DB_CONNECTION_STATUS = {
    connected: false,
    loading: false,
    error: null,
};

export type DBStatus = 'loading' | 'connect' | 'disconnect';

export const useDbConnection = () => {
    const [dbStatus, setDbStatus] = useState<DbConnectionStatus>(DEFAULT_DB_CONNECTION_STATUS);

    const connect = useCallback(() => {
        setDbStatus({ ...dbStatus, loading: true, error: null });

        // Имитация подключения к БД
        setTimeout(() => {
            alert(1);
            // if (!formValues.host || !formValues.database || !formValues.username) {
            //     setDbStatus({
            //         connected: false,
            //         loading: false,
            //         error: 'Пожалуйста, заполните все обязательные поля'
            //     });
            //     return;
            // }

            setDbStatus({ connected: true, loading: false, error: null });
        }, 1500);
    }, []);

    const disconnect = useCallback(() => {
        setDbStatus({ connected: false, loading: false, error: null });
    }, []);

    return { status, connect, disconnect };
}