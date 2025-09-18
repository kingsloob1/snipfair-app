/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

const Map = ({ lat, lng }: { lat: number; lng: number }) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (window as any).initMap = function () {
            if (mapRef.current && (window as any).google) {
                new (window as any).google.maps.Map(mapRef.current, {
                    center: { lat: Number(lat), lng: Number(lng) },
                    zoom: 8,
                });
            }
        };

        const script = document.createElement('script');
        script.src =
            'https://cdn.jsdelivr.net/gh/somanchiu/Keyless-Google-Maps-API@v7.0/mapsJavaScriptAPI.js?callback=initMap';
        script.async = true;
        script.defer = true;

        document.body.appendChild(script);

        return () => {
            // Clean up
            delete (window as any).initMap;
            document.body.removeChild(script);
        };
    }, [lat, lng]);

    return (
        <div className="h-full min-h-96 w-full">
            <div ref={mapRef} className="h-full w-full" />
        </div>
    );
};

export default Map;

// https://maps.google.com/maps?ll=-33.984515,18.681878&z=17&t=m&hl=en-US&gl=US&mapclient=apiv3&cid=7502339055499081343
