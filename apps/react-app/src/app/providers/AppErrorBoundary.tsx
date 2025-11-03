import React from "react";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";

export class AppErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Uncaught error:", error, info);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-screen p-4 bg-gray-50">
                    <Card className="max-w-3xl w-full shadow-lg border border-gray-200">
                        <CardHeader className="flex flex-col items-start gap-2">
                            <h1 className="text-xl font-semibold text-red-600">
                                Произошла ошибка 😢
                            </h1>
                            <p className="text-sm text-gray-500">
                                Что-то пошло не так. Попробуйте перезагрузить страницу.
                            </p>
                        </CardHeader>

                        <Divider />

                        <CardBody className="space-y-4">
                            {this.state.error && (
                                <pre className="bg-gray-100 text-left text-sm text-red-800 p-4 rounded-lg overflow-auto max-h-96">
                                    {this.state.error.toString()}
                                    {"\n"}
                                    {this.state.error.stack}
                                </pre>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="flat"
                                    color="default"
                                    onPress={this.handleGoHome}
                                >
                                    На главную
                                </Button>
                                <Button color="primary" onPress={this.handleReload}>
                                    Перезагрузить страницу
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
