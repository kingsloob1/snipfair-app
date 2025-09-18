import { Clock, Edit3Icon, Trash2 } from 'lucide-react';

interface Service {
    id: string;
    title: string;
    price: number;
    duration: string;
}

type ServiceCardProps = Service & {
    deleteService: (id: string) => void;
    editService: (id: string) => void;
};

const ServiceCard = ({
    id,
    title,
    price,
    duration,
    deleteService,
    editService,
}: ServiceCardProps) => {
    return (
        <div className="flex flex-col gap-5 rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            <div className="flex items-start justify-between gap-5">
                <h5 className="text-sf-black-secondary">{title}</h5>
                <div className="flex items-center gap-2">
                    <button
                        className="text-sf-primary"
                        onClick={() => editService(id)}
                    >
                        <Edit3Icon size={15} />
                    </button>
                    <button
                        className="text-danger-normal"
                        onClick={() => deleteService(id)}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
            <div className="flex items-end justify-between gap-5">
                <h3 className="font-inter text-lg font-bold text-sf-gradient-purple md:text-xl">
                    R{price}
                </h3>
                <span className="flex gap-1.5 text-sm text-sf-primary-paragraph">
                    <Clock size={15} />
                    <span>{duration}</span>
                </span>
            </div>
        </div>
    );
};

export default ServiceCard;
