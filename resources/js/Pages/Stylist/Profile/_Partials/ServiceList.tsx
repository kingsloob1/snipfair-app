import ServiceSingle from './ServiceSingle';

interface Service {
    id: number;
    title: string;
    price: number;
    duration: string;
    is_available: boolean;
}

interface ServiceListProps {
    services: Service[];
}

const ServiceList = ({ services }: ServiceListProps) => {
    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between border-b border-sf-stroke py-4">
                <h3 className="text-lg font-semibold text-sf-black md:text-xl xl:text-2xl">
                    Services List
                </h3>
            </div>

            {/* Services List */}
            <div className="space-y-6">
                {services &&
                    services.map((service) => (
                        <ServiceSingle service={service} key={service.id} />
                    ))}
            </div>
        </div>
    );
};

export default ServiceList;
