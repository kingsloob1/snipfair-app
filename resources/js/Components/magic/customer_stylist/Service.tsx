import CustomButton from '@/Components/common/CustomButton';
import { router } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import React from 'react';

interface ServiceItem {
    id: number;
    title: string;
    description: string;
    price: number;
    duration: string;
    category: string;
}

interface ServiceProps {
    services?: ServiceItem[];
}

const Service: React.FC<ServiceProps> = ({ services = [] }) => {
    const handleBookNow = (serviceId: number) => {
        console.log(`Booking service with ID: ${serviceId}`);
        router.visit(route('customer.appointment.book', serviceId));
    };

    return (
        <div className="w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6">
            <h2 className="mb-8 text-2xl font-bold text-sf-black">
                Services & Pricing
            </h2>

            <div className="space-y-6">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className="flex items-center justify-between rounded-2xl border-b border-gray-100 bg-sf-stroke/60 px-3 py-4 last:border-b-0 hover:bg-sf-white"
                    >
                        <div className="flex-1">
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">
                                {service.title}
                            </h3>
                            <p className="mb-2 text-sm text-gray-600">
                                {service.description}
                            </p>
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock size={16} className="mr-1" />
                                <span>{service.duration}</span>
                            </div>
                        </div>

                        <div className="ml-6 flex flex-col items-end justify-center gap-1.5">
                            <span className="font-inter text-base font-bold text-sf-gradient-purple">
                                R{service.price}
                            </span>
                            <CustomButton
                                onClick={() => handleBookNow(service.id)}
                            >
                                Book Now
                            </CustomButton>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Service;
