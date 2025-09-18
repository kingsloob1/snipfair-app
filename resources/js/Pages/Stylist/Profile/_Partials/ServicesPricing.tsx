import CustomButton from '@/Components/common/CustomButton';
import { router } from '@inertiajs/react';
import { PencilLine } from 'lucide-react';
import ServiceCard from './ServiceCard';

interface Service {
    id: string;
    title: string;
    price: number;
    duration: string;
}

interface PayoutSettingsProps {
    addNewService?: () => void;
    services: Service[];
}

const ServicesPricing = ({ addNewService, services }: PayoutSettingsProps) => {
    const deleteService = (id: string) => {
        router.delete(route('stylist.work.delete', id), {
            data: {},
            onSuccess: () => {
                router.visit(route('stylist.work'));
            },
        });
    };

    const editService = (id: string) => {
        router.visit(route('stylist.work.edit', id));
    };

    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-sf-stroke py-4">
                <h3 className="text-lg font-semibold text-sf-black md:text-xl xl:text-2xl">
                    Services & Pricing
                </h3>
                <CustomButton
                    variant="secondary"
                    onClick={addNewService}
                    fullWidth={false}
                >
                    <div className="flex gap-2">
                        <PencilLine className="h-4 w-4" />
                        <span className="text-sm font-medium">Manage All</span>
                    </div>
                </CustomButton>
            </div>

            {/* Main Content */}
            <div className="grid gap-5 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-5">
                {services && services.length > 0 ? (
                    services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            {...service}
                            deleteService={deleteService}
                            editService={editService}
                        />
                    ))
                ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                        <p className="text-sm text-sf-primary-paragraph">
                            You currently have no listed service.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesPricing;
