import AnimatedSweep from '@/Components/common/AnimatedSweep';
import AppStoreSection from '@/Components/home/AppStoreSection';
import Cta from '@/Components/home/Cta';
import Faqs from '@/Components/home/Faqs';
import Featured from '@/Components/home/Featured';
import Hero from '@/Components/home/Hero';
import HowItWorks from '@/Components/home/HowItWorks';
import Services from '@/Components/home/Services';
// import Testimonial from '@/Components/home/Testimonial';
import Trending from '@/Components/home/Trending';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import { SchemaGenerator } from '@/Components/SEO/SchemaGenerator';
import SEOProvider from '@/Components/SEO/SEOProvider';
import { PageProps } from '@/types';
import { Service } from '@/types/custom_types';
import { Head } from '@inertiajs/react';

type HomeProps = {
    services: Service[];
    faqs: {
        id: number;
        question: string;
        answer: string;
    }[];
    stylists: {
        id: number;
        stylist_profile_id?: number | null;
        category: string | null;
        name: string;
        title: string;
        banner_image?: string | null;
        profile_image?: string | null;
        price_range?: string | null;
        location: string;
        categories: { id: number; name: string; category: string }[];
    }[];
    portfolios: {
        id: number;
        slug_id: number;
        banner_image?: string | null;
        category: string;
        name: string;
        description: string;
        price: number;
        stylist_name: string;
    }[];
};

export default function Home({
    auth,
    services,
    faqs,
    stylists,
    portfolios,
}: PageProps<HomeProps>) {
    // Generate schema for homepage
    const homeSchema = SchemaGenerator.localBusiness();

    return (
        <SEOProvider
            title="SnipFair - Professional Beauty Services at Your Doorstep"
            description="Book verified beauty professionals for hair styling, makeup, nails, and more. Convenient, professional, and trusted by thousands of customers."
            keywords="mobile beauty services, professional stylists, hair at home, makeup artist, nail technician, beauty booking, verified stylists"
            schema={homeSchema}
        >
            <Head title="Welcome" />
            <AnimatedSweep />
            <Navbar auth={auth} />
            <Hero auth={auth} services={services} />
            <Trending portfolios={portfolios} />
            <Services services={services} isServices={false} />
            <HowItWorks />
            <Featured stylists={stylists} />
            {/* <Testimonial /> */}
            <Faqs faqs={faqs} />
            {!auth.user && <Cta />}
            <AppStoreSection />
            <Footer />
        </SEOProvider>
    );
}
