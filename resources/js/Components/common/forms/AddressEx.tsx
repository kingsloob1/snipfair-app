import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
export default function AddressEx() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return (
        <div>
            <GooglePlacesAutocomplete apiKey={apiKey} />
        </div>
    );
}
