import React from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
    locale?: string;
    twitterCard?: string;
    twitterSite?: string;
    robots?: string;
    canonical?: string;
    schema?: object | object[];
    noIndex?: boolean;
    noFollow?: boolean;
}

const SEOHead: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    siteName,
    locale = 'en_US',
    twitterCard = 'summary_large_image',
    twitterSite,
    robots,
    canonical,
    schema,
    noIndex = false,
    noFollow = false,
}) => {
    // Build robots content
    const robotsContent =
        noIndex || noFollow
            ? `${noIndex ? 'noindex' : 'index'}, ${noFollow ? 'nofollow' : 'follow'}`
            : robots || 'index, follow';

    return (
        <>
            {/* Basic Meta Tags */}
            {title && <title>{title}</title>}
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="robots" content={robotsContent} />
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Viewport for mobile */}
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />

            {/* Open Graph / Facebook */}
            {title && <meta property="og:title" content={title} />}
            {description && (
                <meta property="og:description" content={description} />
            )}
            <meta property="og:type" content={type} />
            {url && <meta property="og:url" content={url} />}
            {image && <meta property="og:image" content={image} />}
            {siteName && <meta property="og:site_name" content={siteName} />}
            <meta property="og:locale" content={locale} />

            {/* Twitter Card */}
            <meta name="twitter:card" content={twitterCard} />
            {twitterSite && <meta name="twitter:site" content={twitterSite} />}
            {title && <meta name="twitter:title" content={title} />}
            {description && (
                <meta name="twitter:description" content={description} />
            )}
            {image && <meta name="twitter:image" content={image} />}

            {/* Additional Meta Tags */}
            <meta name="format-detection" content="telephone=no" />
            <meta name="theme-color" content="#6366f1" />

            {/* Favicon */}
            <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/images/Background.png"
            />
            <link rel="apple-touch-icon" href="/images/Background.png" />

            {/* JSON-LD Schema */}
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                            Array.isArray(schema) ? schema : [schema],
                        ),
                    }}
                />
            )}
        </>
    );
};

export default SEOHead;
