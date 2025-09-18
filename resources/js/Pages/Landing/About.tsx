import StatCounter from '@/Components/about/_partial/StatCounter';
import Header from '@/Components/about/Header';
import Story from '@/Components/about/Story';
import Values from '@/Components/about/Values';
import AnimatedSweep from '@/Components/common/AnimatedSweep';
import Cta from '@/Components/home/Cta';
// import Faqs from '@/Components/home/Faqs';
// import Services from '@/Components/home/Services';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import { PageProps } from '@/types';
import { Service } from '@/types/custom_types';
import { Head } from '@inertiajs/react';

type FAQ = {
    id: number;
    question: string;
    answer: string;
};

type UserStatistics = {
    id: number;
    name: string;
    count: number;
    unit: string;
};

export default function About({
    // services,
    user_statistics,
    auth,
    // faqs,
}: PageProps<{
    services: Service[];
    faqs: FAQ[];
    user_statistics: UserStatistics[];
}>) {
    return (
        <>
            <Head title="About Us" />
            <AnimatedSweep />
            <Navbar auth={auth} />
            <Header />
            <Story />
            <Values />
            <StatCounter stats={user_statistics} />
            {/* <Services services={services} /> */}
            {/* <section className="py-8 md:py-11">
                <Faqs faqs={faqs} heading="middle" />
            </section> */}
            <Cta />
            <Footer />
        </>
    );
}
