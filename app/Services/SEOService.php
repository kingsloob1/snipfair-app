<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class SEOService
{
    /**
     * Generate SEO data for a page
     */
    public function generatePageSEO(string $page, array $data = []): array
    {
        $defaults = config('seo.default');
        $pageConfig = $this->getPageConfig($page);
        
        return array_merge($defaults, $pageConfig, $data, [
            'url' => request()->url(),
            'canonical' => request()->url(),
        ]);
    }

    /**
     * Get page-specific configuration
     */
    private function getPageConfig(string $page): array
    {
        switch ($page) {
            case 'home':
                return [
                    'title' => 'SnipFair - Professional Beauty Services at Your Doorstep',
                    'description' => 'Book verified beauty professionals for hair styling, makeup, nails, and more. Convenient, professional, and trusted by thousands.',
                    'keywords' => 'mobile beauty services, professional stylists, hair at home, makeup artist, nail technician, beauty booking',
                    'type' => 'website',
                ];

            case 'about':
                return [
                    'title' => 'About SnipFair - Your Trusted Beauty Service Platform',
                    'description' => 'Learn about SnipFair\'s mission to connect customers with verified beauty professionals. Safe, convenient, and professional beauty services.',
                    'keywords' => 'about snipfair, beauty platform, professional stylists, mobile beauty services',
                ];

            case 'services':
                return [
                    'title' => 'Beauty Services - Hair, Makeup, Nails & More | SnipFair',
                    'description' => 'Explore our wide range of professional beauty services. From hair styling to makeup and nail care, find the perfect service for you.',
                    'keywords' => 'hair services, makeup services, nail services, beauty treatments, professional styling',
                ];

            case 'explore':
                return [
                    'title' => 'Explore Professional Stylists Near You | SnipFair',
                    'description' => 'Discover talented beauty professionals in your area. Browse portfolios, read reviews, and book your perfect stylist today.',
                    'keywords' => 'find stylist, beauty professionals, local stylists, book beauty services',
                ];

            case 'stylists':
                return [
                    'title' => 'Professional Stylists Directory | SnipFair',
                    'description' => 'Browse our directory of verified professional stylists. View portfolios, ratings, and book appointments with top-rated beauty experts.',
                    'keywords' => 'stylist directory, professional stylists, beauty experts, verified stylists',
                ];

            case 'faqs':
                return [
                    'title' => 'Frequently Asked Questions | SnipFair',
                    'description' => 'Get answers to common questions about booking beauty services, payments, cancellations, and more on SnipFair.',
                    'keywords' => 'SnipFair FAQ, beauty services questions, booking help, customer support',
                ];

            case 'contact':
                return [
                    'title' => 'Contact Us | SnipFair Support',
                    'description' => 'Get in touch with SnipFair support team. We\'re here to help with your beauty service bookings and any questions you may have.',
                    'keywords' => 'contact SnipFair, customer support, help, beauty services support',
                ];

            default:
                return [];
        }
    }

    /**
     * Generate dynamic SEO for stylist profile
     */
    public function generateStylistSEO(array $stylist): array
    {
        $name = $stylist['name'] ?? 'Professional Stylist';
        $location = $stylist['location'] ?? '';
        $services = $stylist['services'] ?? [];
        
        $serviceNames = is_array($services) ? implode(', ', array_column($services, 'name')) : '';
        
        return [
            'title' => "{$name} - Professional Beauty Stylist" . ($location ? " in {$location}" : '') . " | SnipFair",
            'description' => "Book appointments with {$name}, a verified professional beauty stylist" . ($location ? " in {$location}" : '') . ". " . ($serviceNames ? "Specializing in {$serviceNames}." : "Expert beauty services.") . " View portfolio and book now.",
            'keywords' => "stylist {$name}, beauty professional" . ($location ? ", {$location} stylist" : '') . ($serviceNames ? ", {$serviceNames}" : ''),
            'type' => 'profile',
            'image' => $stylist['profile_image'] ?? config('seo.default.image'),
        ];
    }

    /**
     * Generate service-specific SEO
     */
    public function generateServiceSEO(array $service): array
    {
        $name = $service['name'] ?? 'Beauty Service';
        $category = $service['category'] ?? '';
        $description = $service['description'] ?? '';
        
        return [
            'title' => "{$name} - Professional {$category} Service | SnipFair",
            'description' => $description ?: "Professional {$name} service available for booking. Expert {$category} specialists ready to serve you at your convenience.",
            'keywords' => "{$name}, {$category}, professional beauty service, mobile beauty, home service",
            'type' => 'service',
        ];
    }

    /**
     * Get cached sitemap
     */
    public function getCachedSitemap(): ?string
    {
        return Cache::get('sitemap_xml', null);
    }

    /**
     * Cache sitemap
     */
    public function cacheSitemap(string $xml): void
    {
        $duration = config('seo.sitemap.cache_duration', 3600);
        Cache::put('sitemap_xml', $xml, $duration);
    }

    /**
     * Clear sitemap cache
     */
    public function clearSitemapCache(): void
    {
        Cache::forget('sitemap_xml');
    }

    /**
     * Generate Open Graph image URL
     */
    public function generateOGImage(array $data = []): string
    {
        // You can implement dynamic OG image generation here
        // For now, return default image
        return asset(config('seo.default.image'));
    }

    /**
     * Get analytics configuration
     */
    public function getAnalyticsConfig(): array
    {
        return config('seo.analytics', []);
    }

    /**
     * Check if rich snippets are enabled
     */
    public function isRichSnippetEnabled(string $type): bool
    {
        return config("seo.rich_snippets.{$type}", false);
    }

    /**
     * Get business schema data
     */
    public function getBusinessSchema(): array
    {
        $business = config('seo.business');
        $social = config('seo.social.social_links');
        
        return [
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            'name' => $business['name'],
            'description' => $business['description'],
            'url' => config('app.url'),
            'logo' => asset($business['logo']),
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => $business['contact']['telephone'] ?? '',
                'email' => $business['contact']['email'],
                'contactType' => $business['contact']['contact_type'],
                'availableLanguage' => $business['contact']['available_language'],
            ],
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => $business['address']['street_address'] ?? '',
                'addressLocality' => $business['address']['address_locality'] ?? '',
                'addressRegion' => $business['address']['address_region'] ?? '',
                'postalCode' => $business['address']['postal_code'] ?? '',
                'addressCountry' => $business['address']['address_country'],
            ],
            'sameAs' => array_filter(array_values($social)),
        ];
    }
}
