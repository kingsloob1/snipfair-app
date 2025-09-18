interface MapEmbedProps {
    lat?: number;
    lng?: number;
    address?: string;
    zoom?: number;
    address_one: string;
    address_two: string;
    use_location: boolean;
}

export default function GoogleMap({
    lat,
    lng,
    zoom = 17,
    address_one,
    address_two,
    use_location,
}: MapEmbedProps) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    let src;
    if (use_location && lat && lng) {
        src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=${zoom}`;
    } else {
        const encodedAddress = encodeURIComponent(
            address_two.trim() || address_one,
        );
        src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&zoom=${zoom}`;
    }

    return (
        <div className="h-96 w-full">
            <iframe
                title="Google Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={src}
            ></iframe>
        </div>
    );
}
