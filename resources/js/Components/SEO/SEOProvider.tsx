import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import SEOHead from './SEOHead';
import urlJoin from 'url-join'

interface PageSEO {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    site_name?: string;
    locale?: string;
    twitter_card?: string;
    twitter_site?: string;
    robots?: string;
    canonical?: string;
    schema?: object | object[];
}

interface PageProps {
    seo?: PageSEO;
    appBaseURL: string;
    requestUrl: string;
    [key: string]: unknown;
}

interface SEOProviderProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    type?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    schema?: object | object[];
    children?: React.ReactNode;
}

const SEOProvider: React.FC<SEOProviderProps> = ({
    title,
    description,
    keywords,
    image,
    type,
    noIndex = false,
    noFollow = false,
    schema,
    children,
}) => {
    const { props } = usePage<PageProps>();
    const seoData = props.seo;

    // Merge provided props with global SEO data
    const finalSeoData = {
        title: title || seoData?.title || `Snipfair- Book Top-Rated Stylists for In-Person Appointments`,
        description: description || seoData?.description || `Connect with professional stylists in your area. Book hair, nails, makeup, and grooming services at your convenience.`,
        keywords: keywords || seoData?.keywords || 'Book hair, nails, makeup, and grooming services, Stylist, Booking, Online Booking',
        image: image || seoData?.image || urlJoin(props.appBaseURL, '/images/logo/logo.png'),
        url: seoData?.url || props.requestUrl,
        type: type || seoData?.type,
        siteName: seoData?.site_name,
        locale: seoData?.locale,
        twitterCard: seoData?.twitter_card,
        twitterSite: seoData?.twitter_site,
        robots: seoData?.robots,
        canonical: seoData?.canonical,
        schema: schema || seoData?.schema,
        noIndex,
        noFollow,
    };

    return (
        <>
            <Head>
                <SEOHead {...finalSeoData} />
            </Head>
            {children}
        </>
    );
};

export default SEOProvider;
