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

    const connect = useCallback((formData: FormData) => {
        setDbStatus({ ...dbStatus, loading: true, error: null });

        const host = formData.get('Хост');
        const port = formData.get('port');
        const db = formData.get('database');
        const username = formData.get('username');
        const password = formData.get('password');

        // Имитация подключения к БД
        setTimeout(() => {
            alert([host, port, db, username, password]);

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
    }, [dbStatus, setDbStatus]);

    const disconnect = useCallback(() => {
        setDbStatus({ connected: false, loading: false, error: null });
    }, [dbStatus, setDbStatus]);

    return { status, connect, disconnect };
}