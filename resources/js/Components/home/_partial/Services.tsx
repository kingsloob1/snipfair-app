import { cn } from '@/lib/utils';
import { Service } from '@/types/custom_types';
import Marquee from 'react-fast-marquee';

export default function Services({ services }: { services: Service[] }) {
    const more = {
        name: 'More',
        banner: '',
        description: '',
        image_url: '',
        tags: [''],
    };

    const allServices = [...services, more];

    return (
        <div className="relative z-10 mt-12 flex w-full max-w-3xl flex-col items-center overflow-hidden px-4">
            <div className="w-full">
                <Marquee pauseOnClick autoFill>
                    {allServices.map((service, idx) => (
                        <div
                            key={`content-${idx}`}
                            className={cn(
                                'mr-12 flex min-w-[81px] select-none items-center justify-center text-base font-semibold text-white md:mr-20 md:min-w-[100px] md:text-lg',
                                idx === services.length && 'mr-32 underline',
                            )}
                        >
                            {service.name}
                        </div>
                    ))}
                </Marquee>
            </div>
        </div>
    );
}
