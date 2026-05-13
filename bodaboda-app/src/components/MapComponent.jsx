import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons with smoother transitions
const riderIcon = L.divIcon({
    className: 'custom-rider-icon',
    html: `<div class="w-10 h-10 bg-emerald-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold transition-all duration-1000">B</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

const passengerIcon = L.divIcon({
    className: 'custom-passenger-icon',
    html: `<div class="w-8 h-8 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold">P</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

const destinationIcon = L.divIcon({
    className: 'custom-dest-icon',
    html: `<div class="w-8 h-8 bg-slate-900 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white font-bold">D</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
});

// Component to handle map view updates - Improved to prevent shaking
const MapAutoCenter = ({ markers, status }) => {
    const map = useMap();
    const lastStatus = useRef(status);
    const lastMarkerCount = useRef(0);
    
    useEffect(() => {
        if (!markers || markers.length === 0) return;

        const validMarkers = markers.filter(m => m.lat && m.lng);
        if (validMarkers.length === 0) return;

        // Only fitBounds if the status changed or a marker was added/removed
        // This prevents the "shaking" when markers move slightly during polling
        const statusChanged = lastStatus.current !== status;
        const countChanged = lastMarkerCount.current !== validMarkers.length;

        if (statusChanged || countChanged) {
            const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));
            map.fitBounds(bounds, { 
                padding: [70, 70], 
                maxZoom: 16,
                animate: true,
                duration: 1.5 
            });
            lastStatus.current = status;
            lastMarkerCount.current = validMarkers.length;
        }
    }, [markers, map, status]);
    
    return null;
};

const MapComponent = ({ markers = [], status = 'idle', center = [-6.1722, 35.7481], zoom = 13 }) => {
    return (
        <MapContainer 
            center={center} 
            zoom={zoom} 
            scrollWheelZoom={true} 
            className="w-full h-full z-0"
        >
            <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {markers.map((marker, idx) => {
                if (!marker.lat || !marker.lng) return null;
                
                let iconToUse = DefaultIcon;
                if (marker.type === 'rider') iconToUse = riderIcon;
                if (marker.type === 'passenger') iconToUse = passengerIcon;
                if (marker.type === 'destination') iconToUse = destinationIcon;
                
                return (
                    <Marker key={idx} position={[marker.lat, marker.lng]} icon={iconToUse}>
                        <Popup>
                            <div className="font-sans">
                                <p className="font-bold text-slate-900">{marker.label}</p>
                                {marker.subLabel && <p className="text-xs text-slate-500">{marker.subLabel}</p>}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
            
            <MapAutoCenter markers={markers} status={status} />
        </MapContainer>
    );
};

export default MapComponent;
