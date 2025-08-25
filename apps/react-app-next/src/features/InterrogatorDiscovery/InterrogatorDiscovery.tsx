import { Card, Flex, Divider, Text, Loader } from "@gravity-ui/uikit";
import block from "bem-cn-lite";
import { useGetInterrogatorDiscovery } from "./useGetInterrogatorDiscovery";

const b = block("interrogator-discovery");

export const InterrogatorDiscovery = () => {
    const { loading, bdi, drivers, testSources } = useGetInterrogatorDiscovery();

    if (loading) {
        return (
            <Card view="outlined" className={b()}>
                <Flex justifyContent="center" alignItems="center" style={{ height: 300 }}>
                    <Loader size="l" />
                </Flex>
            </Card>
        );
    }

    const Section = ({
        title,
        items,
    }: {
        title: string;
        items: { address: string; description: string }[];
    }) => (
        <Card view="outlined" style={{ marginBottom: 16, padding: 16 }}>
            <Text variant="header-2" className="mb-3">
                {title} ({items.length})
            </Text>
            {items.length === 0 ? (
                <Text variant="body-2" color="secondary">
                    Нет доступных устройств
                </Text>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "12px",
                    }}
                >
                    {items.map(({ address, description }) => (
                        <Card key={address} view="raised" style={{ padding: "12px" }}>
                            <Text variant="body-2">
                                {description}
                            </Text>
                            <Text variant="body-3" color="secondary">
                                {address}
                            </Text>
                        </Card>
                    ))}
                </div>
            )}
        </Card>
    );

    return (
        <div className={b()}>
            <Card view="outlined" style={{ padding: 20, marginBottom: 20 }}>
                <Flex
                    style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Text variant="header-2">Управление источником излучения</Text>
                </Flex>
            </Card>

            <Divider className="my-4" />

            <Section title="BDI модули" items={bdi} />
            <Section title="Драйверы" items={drivers} />
            <Section title="Тестовые источники" items={testSources} />
        </div>
    );
};
