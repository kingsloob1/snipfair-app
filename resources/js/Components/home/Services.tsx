import { Service as ServiceProps } from '@/types/custom_types';
import { router } from '@inertiajs/react';
import GradientText from '../common/GradientText';
import OutlineButton from '../common/OutlineButton';
import { ArrowRight } from '../icon/Icons';
import Service from './_partial/Service';

interface ServicesProps {
    services: ServiceProps[];
    isServices?: boolean;
}

export default function Services({
    services,
    isServices = false,
}: ServicesProps) {
    const services_to_show = isServices ? services : services.slice(0, 8);
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 md:py-10">
            <header className="mb-5 flex flex-col gap-2 md:gap-3.5">
                <p>
                    <GradientText className="bg-gradient-to-b font-inter text-base font-semibold">
                        OUR SERVICES
                    </GradientText>
                </p>
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    Your Style, Your Terms, Anytime, Anywhere
                </h2>
                <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                    Snipfair makes self-care simple. We bring you trusted,
                    pre-vetted professionals directly to your door, offering you
                    the freedom to indulge in world-class treatments whenever
                    and wherever you choose. Your self-care, elevated.
                </p>
            </header>
            <div className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {services_to_show.map((service) => (
                    <Service key={service.id} service={service} />
                ))}
            </div>
            {!isServices && (
                <div className="mt-5 text-center">
                    <OutlineButton
                        onClick={() => router.visit(route('services'))}
                        className="duration-400 flex gap-1.5 text-sf-gradient-purple transition-colors hover:text-sf-gradient-pink"
                    >
                        <span>See All Categories</span>
                        <ArrowRight />
                    </OutlineButton>
                </div>
            )}
        </section>
    );
}
