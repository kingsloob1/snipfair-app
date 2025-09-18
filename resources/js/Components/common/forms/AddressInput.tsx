import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';
import { useEffect, useRef } from 'react';

export default function AddressInput({
    setAddress,
    address,
    placeholder = 'Search for your location',
    enableCreate,
}: {
    setAddress: (value: string) => void;
    address: string;
    placeholder?: string;
    enableCreate: boolean;
}) {
    const apiKey = import.meta.env.VITE_GEOAPIFY_COMPLETE_KEY;
    const autocompleteRef = useRef<GeocoderAutocomplete | null>(null);
    useEffect(() => {
        const el = document.getElementById('autocomplete');
        if (!el) return;

        const autocomplete = new GeocoderAutocomplete(el, apiKey, {
            lang: 'za',
            placeholder: placeholder,
            limit: 5,
            countryCodes: ['za'],
        });
        autocompleteRef.current = autocomplete;
        const inputEl = el.querySelector('input');
        if (inputEl) {
            inputEl.readOnly = !enableCreate;
            inputEl.disabled = !enableCreate;
            if (!enableCreate)
                inputEl.classList.add('bg-gray-100', 'cursor-not-allowed');
        }
        if (address) {
            autocomplete.setValue(address);
        }

        autocomplete.on('select', (location) => {
            setAddress(
                location?.properties?.formatted ||
                    location?.properties?.address_line1 ||
                    'N/A',
            );
        });
        autocomplete.on('input', (userInput) => {
            setAddress(userInput);
        });

        return () => {
            autocomplete.off('select');
            autocomplete.off('input');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiKey]);

    return (
        <div
            id="autocomplete"
            className="__address relative mt-1 w-full rounded-md border border-sf-stroke bg-sf-primary-background px-3 py-2 shadow-sm focus-within:border-sf-primary focus-within:ring-1 focus-within:ring-sf-primary"
        ></div>
    );
}
