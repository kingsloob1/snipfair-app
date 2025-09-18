import { Head } from '@inertiajs/react';
import React from 'react';

interface MetaTagsProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
    locale?: string;
    robots?: string;
    canonical?: string;
    twitterCard?: string;
    twitterSite?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    author?: string;
    published?: string;
    modified?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    siteName = 'SnipFair',
    locale = 'en_US',
    robots,
    canonical,
    twitterCard = 'summary_large_image',
    twitterSite = '@snipfair',
    noIndex = false,
    noFollow = false,
    author,
    published,
    modified,
}) => {
    const robotsContent =
        robots ||
        `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`;

    return (
        <Head>
            {/* Basic Meta Tags */}
            {title && <title>{title}</title>}
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="robots" content={robotsContent} />
            {canonical && <link rel="canonical" href={canonical} />}
            {author && <meta name="author" content={author} />}
            {published && (
                <meta name="article:published_time" content={published} />
            )}
            {modified && (
                <meta name="article:modified_time" content={modified} />
            )}

            {/* Open Graph / Facebook */}
            {title && <meta property="og:title" content={title} />}
            {description && (
                <meta property="og:description" content={description} />
            )}
            <meta property="og:type" content={type} />
            {url && <meta property="og:url" content={url} />}
            {image && <meta property="og:image" content={image} />}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content={locale} />

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:site" content={twitterSite} />
            {title && <meta name="twitter:title" content={title} />}
            {description && (
                <meta name="twitter:description" content={description} />
            )}
            {image && <meta name="twitter:image" content={image} />}

            {/* Additional Meta Tags */}
            <meta name="theme-color" content="#6366f1" />
            <meta name="msapplication-TileColor" content="#6366f1" />

            {/* Mobile Optimization */}
            <meta name="format-detection" content="telephone=no" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta
                name="apple-mobile-web-app-status-bar-style"
                content="default"
            />

            {/* Preconnect to external domains for performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
                rel="preconnect"
                href="https://fonts.gstatic.com"
                crossOrigin="anonymous"
            />
        </Head>
    );
};

export default MetaTags;
