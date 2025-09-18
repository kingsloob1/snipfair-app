import { Service as ServiceProp } from '@/types/custom_types';

interface ServiceProps {
    service: ServiceProp;
}

export default function Service({ service }: ServiceProps) {
    return (
        <div className="group flex cursor-pointer flex-col overflow-hidden rounded-xl hover:bg-sf-gradient-pink/5">
            <div className="h-40 w-full overflow-hidden">
                <img
                    src={service.image_url || '/images/temp/placeholder.svg'}
                    alt={service.name}
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
                />
            </div>
            <div className="flex flex-col gap-1 px-2 py-3 md:px-3 md:py-4">
                <h4 className="font-inter text-lg font-bold text-sf-primary-paragraph md:text-xl">
                    {service.name}
                </h4>
                <p className="font-inter text-sm text-sf-gray-zinc md:text-base">
                    {service.tags && service.tags.join(', ')}
                </p>
            </div>
        </div>
    );
}
