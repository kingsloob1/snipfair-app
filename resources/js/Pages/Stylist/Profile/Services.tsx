import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { router } from '@inertiajs/react';
import ServiceList from './_Partials/ServiceList';

interface Service {
    id: number;
    title: string;
    price: number;
    duration: string;
    is_available: boolean;
}

export default function Services({ portfolios }: { portfolios: Service[] }) {
    const routes = [
        {
            name: 'Profile',
            path: route('stylist.profile'),
            active: true,
        },
        {
            name: 'Services',
            path: '',
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Earnings">
            <StylistNavigationSteps
                routes={routes}
                sub="Manage your service offerings and pricing"
            >
                <CustomButton
                    onClick={() => router.visit(route('stylist.work.create'))}
                    fullWidth={false}
                >
                    <div className="flex gap-1">Add Service</div>
                </CustomButton>
            </StylistNavigationSteps>
            <section className="mx-auto max-w-7xl px-5">
                <ServiceList services={portfolios} />
            </section>
        </StylistAuthLayout>
    );
}
