interface Organization {
    '@type': 'Organization';
    name: string;
    url: string;
    logo: string;
    description: string;
    contactPoint?: ContactPoint;
    sameAs?: string[];
}

interface ContactPoint {
    '@type': 'ContactPoint';
    telephone: string;
    contactType: string;
    availableLanguage: string[];
}

interface LocalBusiness {
    '@type': 'LocalBusiness';
    name: string;
    url: string;
    logo: string;
    description: string;
    contactPoint?: ContactPoint;
    sameAs?: string[];
    address?: PostalAddress;
    serviceType?: string;
    areaServed?: Place;
    hasOfferCatalog?: OfferCatalog;
}

interface PostalAddress {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry: string;
}

interface Place {
    '@type': 'Country' | 'City' | 'State';
    name: string;
}

interface OfferCatalog {
    '@type': 'OfferCatalog';
    name: string;
    itemListElement: Offer[];
}

interface Offer {
    '@type': 'Offer';
    itemOffered: Service;
}

interface Service {
    '@type': 'Service';
    name: string;
    description?: string;
}

interface Person {
    '@type': 'Person';
    name: string;
    url?: string;
    image?: string;
    jobTitle?: string;
    worksFor?: Organization;
    description?: string;
    sameAs?: string[];
}

interface WebPage {
    '@context': 'https://schema.org';
    '@type': 'WebPage';
    name: string;
    description: string;
    url: string;
    mainEntity?: Organization | Person | Service;
}

interface FAQPage {
    '@context': 'https://schema.org';
    '@type': 'FAQPage';
    mainEntity: Question[];
}

interface Question {
    '@type': 'Question';
    name: string;
    acceptedAnswer: Answer;
}

interface Answer {
    '@type': 'Answer';
    text: string;
}

export class SchemaGenerator {
    /**
     * Generate organization schema
     */
    static organization(): Organization {
        return {
            '@type': 'Organization',
            name: 'SnipFair',
            url: window.location.origin,
            logo: `${window.location.origin}/images/Background.png`,
            description:
                'Professional beauty services platform connecting customers with verified stylists.',
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-XXX-XXX-XXXX', // Replace with actual phone
                contactType: 'customer service',
                availableLanguage: ['English'],
            },
            sameAs: [
                'https://www.facebook.com/snipfair',
                'https://www.instagram.com/snipfair',
                'https://www.twitter.com/snipfair',
            ],
        };
    }

    /**
     * Generate local business schema for homepage
     */
    static localBusiness(): LocalBusiness {
        return {
            '@type': 'LocalBusiness',
            name: 'SnipFair',
            url: window.location.origin,
            logo: `${window.location.origin}/images/Background.png`,
            description: 'Professional mobile beauty services platform',
            address: {
                '@type': 'PostalAddress',
                addressCountry: 'US', // Update as needed
            },
            serviceType: 'Beauty Services',
            areaServed: {
                '@type': 'Country',
                name: 'United States', // Update as needed
            },
            hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Beauty Services',
                itemListElement: [
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Service',
                            name: 'Hair Styling Services',
                        },
                    },
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Service',
                            name: 'Makeup Services',
                        },
                    },
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Service',
                            name: 'Nail Services',
                        },
                    },
                ],
            },
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-XXX-XXX-XXXX',
                contactType: 'customer service',
                availableLanguage: ['English'],
            },
            sameAs: [
                'https://www.facebook.com/snipfair',
                'https://www.instagram.com/snipfair',
                'https://www.twitter.com/snipfair',
            ],
        };
    }

    /**
     * Generate person schema for stylist profiles
     */
    static person(stylist: {
        name: string;
        profileUrl?: string;
        image?: string;
        jobTitle?: string;
        description?: string;
    }): Person {
        return {
            '@type': 'Person',
            name: stylist.name,
            url: stylist.profileUrl,
            image: stylist.image,
            jobTitle: stylist.jobTitle || 'Beauty Professional',
            worksFor: this.organization(),
            description: stylist.description,
        };
    }

    /**
     * Generate service schema
     */
    static service(service: {
        name: string;
        description?: string;
        provider?: string;
    }): Service {
        return {
            '@type': 'Service',
            name: service.name,
            description: service.description,
        };
    }

    /**
     * Generate FAQ page schema
     */
    static faqPage(faqs: { question: string; answer: string }[]): FAQPage {
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                },
            })),
        };
    }

    /**
     * Generate web page schema
     */
    static webPage(data: {
        name: string;
        description: string;
        url: string;
        mainEntity?: Organization | Person | Service;
    }): WebPage {
        return {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: data.name,
            description: data.description,
            url: data.url,
            mainEntity: data.mainEntity,
        };
    }

    /**
     * Generate breadcrumb schema
     */
    static breadcrumb(items: { name: string; url: string }[]) {
        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url,
            })),
        };
    }
}
