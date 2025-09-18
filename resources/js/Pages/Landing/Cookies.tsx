import AnimatedSweep from '@/Components/common/AnimatedSweep';
import Cta from '@/Components/home/Cta';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface CookiesProps extends Record<string, unknown> {
    content: string;
}

export default function Cookies({ auth, content }: PageProps<CookiesProps>) {
    return (
        <>
            <Head title="Cookies Policy" />
            <AnimatedSweep />
            <Navbar auth={auth} />

            {/* Header Section */}
            <section className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 pb-16 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                        Cookies Policy
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-white/90">
                        Understand how we use cookies to enhance your browsing
                        experience
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 md:py-10">
                <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </section>

            <Cta />
            <Footer />
        </>
    );
}
