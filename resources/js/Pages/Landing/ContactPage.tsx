import AnimatedSweep from '@/Components/common/AnimatedSweep';
import Contact from '@/Components/contact/Contact';
import MapForm from '@/Components/contact/MapForm';
import Cta from '@/Components/home/Cta';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

export default function ContactPage({ auth }: PageProps) {
    return (
        <>
            <Head title="Contact Us" />
            <AnimatedSweep />
            <Navbar auth={auth} />
            <Contact />
            <MapForm />
            <Cta />
            <Footer />
        </>
    );
}
