import { useEffect, useRef } from 'react';
import { Flex } from '@gravity-ui/uikit';
import L from 'leaflet';
import block from 'bem-cn-lite';
import 'leaflet/dist/leaflet.css';

import './MapView.scss';

const b = block('map-container');

export const MapView = () => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const map = L.map(mapRef.current).setView([55.7558, 37.6173], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Очистка при размонтировании
        return () => {
            map.remove();
        };
    }, []);

    return (
        <Flex direction="column" className={b()}>
            <div ref={mapRef} className={b('map-view')}></div>
        </Flex>
    );
};
