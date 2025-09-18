import { Link } from '@inertiajs/react';
import CustomButton from '../common/CustomButton';

export default function Story() {
    return (
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 pb-5 md:grid-cols-2 md:pb-10 lg:gap-12">
            <div className="h-full min-h-96 overflow-hidden md:min-h-[600px]">
                <img
                    src="/images/temp/values_one.png"
                    className="h-full w-full object-cover"
                    alt="Snipfair"
                />
            </div>
            <div className="flex flex-col gap-4">
                <h2 className="font-inter text-xl font-bold text-sf-black md:text-2xl">
                    Our Story
                </h2>
                <p className="font-inter text-sf-gray-zinc">
                    Founded in 2025, Snipfair was born from a simple
                    observation: finding quality beauty services shouldn't be
                    complicated, expensive, or unreliable. Our founders, having
                    experienced countless frustrations with traditional booking
                    systems and inconsistent service quality, decided to create
                    a better solution. What started as a small platform
                    connecting a handful of stylists with local customers has
                    grown into a comprehensive beauty ecosystem serving
                    thousands of customers across multiple cities. We've
                    maintained our core mission: making beauty services
                    accessible, affordable, and excellent for everyone. Today,
                    Snipfair is proud to be the trusted bridge between talented
                    beauty professionals and customers seeking quality services.
                    We're not just a booking platform – we're a community that
                    celebrates beauty, creativity, and professional excellence.
                </p>
                <div className="flex justify-start">
                    <Link href={route('register')}>
                        <CustomButton type="button" className="w-40">
                            Join Our Journey
                        </CustomButton>
                    </Link>
                </div>
            </div>
        </section>
    );
}
