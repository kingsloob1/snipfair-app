import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import FooterLinks from './_partial/FooterLinks';
import FooterLogo from './_partial/FooterLogo';
import FooterSubscribe from './_partial/FooterSubscribe';

export default function Footer() {
    const { auth, category_names } = usePage().props;
    const categories = category_names as string[];
    const auth_object = auth as PageProps;
    const quickLinks = {
        title: 'Quick Links',
        links: [
            { text: 'About Us', href: route('about') },
            { text: 'Explore Styles', href: route('explore') },
            { text: 'FAQs', href: route('faqs') },
            { text: 'Contact Us', href: route('contact') },
            ...(!auth_object.user
                ? [
                      {
                          text: 'Join as a Stylist',
                          href: route('stylist.register'),
                      },
                  ]
                : []),
        ],
        underlineLast: true,
    };

    const services = {
        title: 'Services',
        links: categories.map((service: string, i: number) => ({
            text: String(service),
            href: route('customer.stylists', { q: i + 1, c: service }),
        })),
        underlineLast: false,
    };

    const resources = {
        title: 'Resources',
        links: [
            // { text: 'FAQs', href: route('faqs') },
            { text: 'Cookies', href: route('cookies') },
            { text: 'Privacy Policy', href: route('privacy-policy') },
            { text: 'Terms & Conditions', href: route('terms') },
        ],
        underlineLast: false,
    };

    return (
        <footer className="w-full bg-sf-secondary py-12 md:py-16">
            <div className="mx-auto w-full max-w-7xl px-5">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-7 lg:grid-cols-12">
                    <div className="order-1 col-span-1 md:order-1 md:col-span-1 lg:order-1 lg:col-span-3">
                        <FooterLogo />
                    </div>

                    <div className="order-3 col-span-1 md:order-2 md:col-span-1 lg:order-2 lg:col-span-2">
                        <FooterLinks
                            title={quickLinks.title}
                            links={quickLinks.links}
                            underlineLast={quickLinks.underlineLast}
                        />
                    </div>

                    <div className="order-4 col-span-1 md:order-4 md:col-span-1 lg:order-3 lg:col-span-2">
                        <FooterLinks
                            title={services.title}
                            links={services.links}
                            underlineLast={services.underlineLast}
                        />
                    </div>

                    <div className="col-span-12 hidden md:order-5 md:col-span-1 md:block lg:col-span-2 lg:hidden"></div>

                    <div className="order-5 col-span-1 md:order-6 md:col-span-1 lg:order-4 lg:col-span-2">
                        <FooterLinks
                            title={resources.title}
                            links={resources.links}
                            underlineLast={resources.underlineLast}
                        />
                    </div>

                    <div className="order-2 col-span-1 md:order-3 md:col-span-1 lg:order-5 lg:col-span-3">
                        <FooterSubscribe />
                    </div>
                </div>
                <hr className="my-5 mt-8 border-sf-gray" />
                <p className="text-center font-inter text-sf-white">
                    © {new Date().getFullYear()} Snipfair. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}
