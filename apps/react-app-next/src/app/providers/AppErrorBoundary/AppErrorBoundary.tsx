import React, { useState } from "react";
import { Button, Flex, Icon, Text } from "@gravity-ui/uikit";
import { TriangleExclamation } from "@gravity-ui/icons";
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router-dom";

import "./AppErrorBoundary.scss";
import block from "bem-cn-lite";
import { logError } from "@shared/utils/logs";

const b = block("app-error-boundary");

type ErrorBoundaryState = {
    hasError: boolean;
    error?: Error;
};

export class AppErrorBoundary extends React.Component<
    { children?: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children?: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: undefined };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Ошибка в приложении:", error, errorInfo);

        // Используем utils logger
        logError("React ErrorBoundary", {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return <ErrorFallback onReload={this.handleReload} error={this.state.error} />;
        }
        return this.props.children;
    }
}

const ErrorFallback: React.FC<{ onReload: () => void; error?: Error }> = ({
    onReload,
    error,
}) => {
    const navigate = useNavigate();
    const [showDetails, setShowDetails] = useState(false);

    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            className={b()}
        >
            <Icon data={TriangleExclamation} size={64} className={b("icon")} />

            <Text variant="display-2">Упс! Что-то пошло не так</Text>

            <Text variant="body-2" color="secondary" style={{ maxWidth: 500 }}>
                {error?.message ||
                    "Произошла непредвиденная ошибка. Попробуйте обновить страницу."}
            </Text>

            {showDetails && (
                <pre className={b("pre-error")}>{error?.stack}</pre>
            )}

            <Flex gap={2}>
                <Button size="l" view="action" onClick={onReload}>
                    Перезагрузить
                </Button>
                <Button size="l" view="outlined" onClick={() => navigate("/")}>
                    На главную
                </Button>
                <Button
                    size="l"
                    view="outlined"
                    onClick={() => setShowDetails((s) => !s)}
                >
                    {showDetails ? "Скрыть детали" : "Показать детали"}
                </Button>
            </Flex>
        </Flex>
    );
};

export const RouterErrorFallback: React.FC = () => {
    const error = useRouteError();
    let message = "Произошла ошибка при загрузке страницы.";

    if (isRouteErrorResponse(error)) {
        message = `${error.status} ${error.statusText}`;
    } else if (error instanceof Error) {
        message = error.message;
    }

    // Логируем через utils
    logError("RouterErrorFallback", {
        message,
        stack: error instanceof Error ? error.stack : undefined,
    });

    return (
        <ErrorFallback
            onReload={() => window.location.reload()}
            error={error instanceof Error ? error : new Error(message)}
        />
    );
};
