import AnimatedSweep from '@/Components/common/AnimatedSweep';
import Cta from '@/Components/home/Cta';
import Services from '@/Components/home/Services';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import { PageProps } from '@/types';
import { Service } from '@/types/custom_types';
import { Head } from '@inertiajs/react';

type HomeProps = {
    services: Service[];
};

export default function AllServices({ auth, services }: PageProps<HomeProps>) {
    return (
        <>
            <Head title="Welcome" />
            <AnimatedSweep />
            <Navbar auth={auth} />
            <Services services={services} isServices={true} />
            <Cta />
            <Footer />
        </>
    );
}
