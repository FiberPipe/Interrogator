export const LogSettings = () => {
    return (
        <div className="logs-tab">
            <div className="logs-header">
                <Text variant="header-2">Логи базы данных</Text>
                <Button
                    view="flat"
                    onClick={() => setDbLogs([])}
                    disabled={dbLogs.length === 0}
                >
                    Очистить логи
                </Button>
            </div>

            {generateSampleLogs().length === 0 ? (
                <Alert theme="info" message="Логи базы данных пока отсутствуют. Подключитесь к базе данных для получения логов." />
            ) : (
                <div className="logs-container">
                    {generateSampleLogs().map((log, index) => (
                        <div key={index} className="log-entry">
                            <div className="log-header">
                                <Text variant="body-1" color="secondary">
                                    {new Date(log.timestamp).toLocaleString()}
                                </Text>
                                {renderLogLevel(log.level)}
                                <CopyToClipboard text={`[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`}>
                                    <Button view="flat" size="xs">
                                        <Icon data={Copy} size={16} />
                                    </Button>
                                </CopyToClipboard>
                            </div>
                            <Text variant="body-1">{log.message}</Text>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}