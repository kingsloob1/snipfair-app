import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import SEOHead from './SEOHead';

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
        title: title || seoData?.title,
        description: description || seoData?.description,
        keywords: keywords || seoData?.keywords,
        image: image || seoData?.image,
        url: seoData?.url,
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
