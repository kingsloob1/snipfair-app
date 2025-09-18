import ToggleSwitch from '@/Pages/Admin/Settings/_Includes/ToggleSwitch';
import { router } from '@inertiajs/react';
import { EditIcon } from 'lucide-react';
import { useState } from 'react';

export default function ServiceSingle({
    service,
}: {
    service: {
        id: number;
        title: string;
        price: number;
        duration: string;
        is_available: boolean;
    };
}) {
    const [isAvailable, setIsAvailable] = useState(service.is_available);
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleService = (id: number) => {
        if (isProcessing) return;
        setIsProcessing(true);
        router.put(
            route('stylist.work.toggle', id),
            {},
            {
                onSuccess: () => {
                    setIsAvailable(!isAvailable);
                    setIsProcessing(false);
                },
                onError: () => setIsProcessing(false),
            },
        );
    };
    return (
        <div className="rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                {/* Service Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-sf-black-secondary">
                        Service Name
                    </label>
                    <div className="relative">
                        <p className="rounded-lg border border-sf-stroke bg-sf-white p-2">
                            {service.title}
                        </p>
                    </div>
                </div>

                {/* Price */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-sf-black-secondary">
                        Price (R)
                    </label>
                    <div className="relative">
                        <p className="rounded-lg border border-sf-stroke bg-sf-white p-2">
                            {service.price}
                        </p>
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-sf-black-secondary">
                        Duration
                    </label>
                    <div className="relative">
                        <p className="rounded-lg border border-sf-stroke bg-sf-white p-2">
                            {service.duration}
                        </p>
                    </div>
                </div>

                {/* Delete Button */}
                <div className="flex items-center justify-end">
                    <button
                        onClick={() =>
                            router.visit(route('stylist.work.edit', service.id))
                        }
                        className="rounded-lg p-3 text-sf-primary transition-colors hover:bg-red-50"
                        title="Edit service"
                    >
                        <EditIcon size={16} />
                    </button>
                    <ToggleSwitch
                        enabled={isAvailable}
                        onChange={() => toggleService(service.id)}
                        disabled={isProcessing}
                    />
                </div>
            </div>
        </div>
    );
}
