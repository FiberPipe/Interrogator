import { Alert, Flex, Label } from "@gravity-ui/uikit"
import type { DbConnectionStatus } from "./types";

interface DbSettingsLabel {
    dbStatus: DbConnectionStatus;
};

export const DbSettingsLabel = ({ dbStatus }: DbSettingsLabel) => {
    const { loading, connected, error } = dbStatus;

    return (
        <Flex>
            {loading === true && <Label
                theme="warning"
                loading={true}
                title="Подключение"
                className="status-alert"
                onCloseClick={() => alert('On click close')}
                size="s"
            />}

            {connected && (
                <Label
                    theme="success"
                    title="Подключено"
                    className="status-alert"
                    onCloseClick={() => alert('On click close')} size="s"
                />
            )}
            {dbStatus.error && (
                <Alert
                    theme="danger"
                    title="Ошибка подключения"
                    message={dbStatus.error}
                    className="status-alert"
                />
            )}
        </Flex>
    )
}