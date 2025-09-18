import TextInput from '@/Components/TextInput';
import { useEffect } from 'react'; //useRef
import { usePlacesWidget } from 'react-google-autocomplete';

const AutoComplete = () => {
    // const mapRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     (window as any).initMap = function () {
    //         if (mapRef.current && (window as any).google) {
    //             new (window as any).google.maps.Map(mapRef.current, {
    //                 center: { lat: -33.984515, lng: 18.681878 },
    //                 zoom: 8,
    //             });
    //         }
    //     };

    //     const script = document.createElement('script');
    //     script.src =
    //         'https://cdn.jsdelivr.net/gh/somanchiu/Keyless-Google-Maps-API@v7.0/mapsJavaScriptAPI.js?callback=initMap';
    //     script.async = true;
    //     script.defer = true;

    //     document.body.appendChild(script);

    //     return () => {
    //         // Clean up
    //         delete (window as any).initMap;
    //         document.body.removeChild(script);
    //     };
    // }, []);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '/assets/maps.js';
        script.async = true;
        script.defer = true;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);
    const { ref } = usePlacesWidget({
        onPlaceSelected: (place) => console.log(place),
    });

    return (
        <div className="h-full min-h-96 w-full">
            <TextInput onChange={(val) => console.log(val)} ref={ref} />
            {/* <div ref={mapRef} className="h-full w-full" /> */}
        </div>
    );
};

export default AutoComplete;

// https://maps.google.com/maps?ll=-33.984515,18.681878&z=17&t=m&hl=en-US&gl=US&mapclient=apiv3&cid=7502339055499081343
