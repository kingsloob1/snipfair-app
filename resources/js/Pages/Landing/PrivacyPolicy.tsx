import AnimatedSweep from '@/Components/common/AnimatedSweep';
import Cta from '@/Components/home/Cta';
import Footer from '@/Components/layout/Footer';
import Navbar from '@/Components/layout/Navbar';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface PrivacyPolicyProps extends Record<string, unknown> {
    content: string;
}

export default function PrivacyPolicy({
    auth,
    content,
}: PageProps<PrivacyPolicyProps>) {
    return (
        <>
            <Head title="Privacy Policy" />
            <AnimatedSweep />
            <Navbar auth={auth} />

            {/* Header Section */}
            <section className="bg-gradient-to-br from-green-500 via-teal-600 to-blue-600 pb-16 pt-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">
                        Privacy Policy
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-white/90">
                        Learn how we collect, use, and protect your personal
                        information
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
