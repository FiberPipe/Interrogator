import { ChartBar, GraphNode, MapPin } from "@gravity-ui/icons";
import { AsideHeader } from "@gravity-ui/navigation";
import { Flex, Text } from "@gravity-ui/uikit";
import { Outlet, useNavigate } from "react-router-dom";

export const Monitoring = () => {
    const navigate = useNavigate();

    return (
        <Flex direction={"row"}>
            <AsideHeader compact={true} hideCollapseButton={true} menuItems={[
                {
                    id: "monitoring",
                    title: <Text>Карты</Text>,
                    icon: MapPin,
                    onItemClick: () => { navigate('/monitoring/map') },
                },
                {
                    id: "graphs",
                    title: <Text>Графы</Text>,
                    icon: GraphNode,
                    onItemClick: () => { navigate('/monitoring/graphs') },
                },
            ]} />
            <Outlet />
        </Flex>
    );
}