import { apiCall } from '@/hooks/api';
import React, { useState } from 'react';
import { toast } from 'sonner';
// Availability Component Types
interface AvailabilityProps {
    initialState?: boolean;
    enabled: boolean;
    is_available?: boolean;
    onChange?: (isOn: boolean) => void;
}

// Availability Component
const AvailabilityPill: React.FC<AvailabilityProps> = ({
    initialState = false,
    enabled = false,
    onChange,
}) => {
    const [isOn, setIsOn] = useState(initialState && enabled);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleToggle = () => {
        if (!enabled) {
            toast.warning(
                'You need to have an active stylist profile to change your availability.',
            );
            return;
        } else {
            const newState = !isOn;
            toggleAvailability(newState);
        }
    };

    const toggleAvailability = async (newState: boolean) => {
        setIsProcessing(true);
        try {
            const response = await apiCall('/api/stylist/update-availability', {
                method: 'POST',
                body: JSON.stringify({
                    availability: newState,
                }),
            });
            const data = await response.json();

            if (data.success) {
                setIsOn(newState);
                onChange?.(newState);
                toast.success('Availability updated successfully!');
            } else {
                toast.error('Failed to update availability.');
            }
        } catch (error) {
            toast.error('Failed to update availability');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="inline-flex items-center rounded-full border border-purple-400 bg-white px-2 py-1">
            <span className="mr-3 text-sm font-medium text-purple-500">
                Availability
            </span>
            <button
                onClick={handleToggle}
                disabled={isProcessing}
                // disabled={!enabled}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-60 ${
                    isOn ? 'bg-green-500' : 'bg-gray-400'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
};

export default AvailabilityPill;
