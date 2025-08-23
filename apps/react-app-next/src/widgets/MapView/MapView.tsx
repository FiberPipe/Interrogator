import { useEffect, useRef } from "react";
import { Flex } from "@gravity-ui/uikit";
import L from "leaflet";
import block from "bem-cn-lite";
import "leaflet/dist/leaflet.css";

import "./MapView.scss";

const b = block("map-container");

export const MapView = () => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const map = L.map(mapRef.current, {
            center: [55.7558, 37.6173],
            zoom: 10,
            minZoom: 10,
            maxZoom: 13,
        });

        L.tileLayer("tiles/{z}/{x}/{y}.png", {
            attribution: "Offline tiles",
            minZoom: 10,
            maxZoom: 13,
            errorTileUrl: "tiles/placeholder.png", // запасной тайл
        }).addTo(map);

        return () => {
            map.remove();
        };
    }, []);

    return (
        <Flex direction="column" className={b()}>
            <div ref={mapRef} className={b("map-view")}></div>
        </Flex>
    );
};
