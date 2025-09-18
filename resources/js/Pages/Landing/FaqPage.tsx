import AnimatedSweep from '@/Components/common/AnimatedSweep';
import Contact from '@/Components/faqs/Contact';
import FAQ from '@/Components/faqs/FAQ';
import Cta from '@/Components/home/Cta';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

type FAQ = {
    id: number;
    question: string;
    answer: string;
};

export default function FaqPage({ auth, faqs }: PageProps<{ faqs: FAQ[] }>) {
    return (
        <>
            <Head title="FAQs" />
            <AnimatedSweep />
            <Navbar auth={auth} />
            <FAQ faqs={faqs} />
            <Contact />
            <Cta />
            <Footer />
        </>
    );
}
