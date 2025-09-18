<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SEOMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only process for Inertia responses
        if ($request->header('X-Inertia')) {
            return $response;
        }

        // Get the route name for dynamic SEO
        $routeName = $request->route()?->getName();
        
        // Default SEO data
        $seoData = $this->getDefaultSeoData();
        
        // Override with route-specific SEO data
        $routeSeoData = $this->getRouteSeoData($routeName, $request);
        $seoData = array_merge($seoData, $routeSeoData);

        // Share SEO data with Inertia
        Inertia::share('seo', $seoData);

        return $response;
    }

    /**
     * Get default SEO data
     */
    private function getDefaultSeoData(): array
    {
        return [
            'title' => config('app.name', 'SnipFair') . ' - Professional Beauty Services at Your Doorstep',
            'description' => 'Book professional beauty services with verified stylists in your area. Hair styling, makeup, nails, and more. Trusted by thousands of customers.',
            'keywords' => 'beauty services, hair stylist, makeup artist, nail technician, mobile beauty, home service, professional styling',
            'image' => asset('images/Background.png'),
            'url' => url()->current(),
            'type' => 'website',
            'site_name' => config('app.name', 'SnipFair'),
            'locale' => 'en_US',
            'twitter_card' => 'summary_large_image',
            'twitter_site' => '@snipfair',
            'robots' => 'index, follow',
            'canonical' => url()->current(),
            'schema' => $this->getDefaultSchema(),
        ];
    }

    /**
     * Get route-specific SEO data
     */
    private function getRouteSeoData(string $routeName = null, Request $request): array
    {
        switch ($routeName) {
            case 'home':
                return [
                    'title' => 'SnipFair - Professional Beauty Services at Your Doorstep',
                    'description' => 'Book verified beauty professionals for hair styling, makeup, nails, and more. Convenient, professional, and trusted by thousands.',
                    'keywords' => 'mobile beauty services, professional stylists, hair at home, makeup artist, nail technician, beauty booking',
                    'schema' => $this->getHomePageSchema(),
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

            case 'customer.stylists':
                return [
                    'title' => 'Professional Stylists Directory | SnipFair',
                    'description' => 'Browse our directory of verified professional stylists. View portfolios, ratings, and book appointments with top-rated beauty experts.',
                    'keywords' => 'stylist directory, professional stylists, beauty experts, verified stylists',
                ];

            case 'customer.stylists.show':
                return $this->getStylistPageSeo($request);

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

            case 'terms':
                return [
                    'title' => 'Terms of Service | SnipFair',
                    'description' => 'Read SnipFair\'s terms of service and user agreement for our beauty services platform.',
                    'keywords' => 'terms of service, user agreement, SnipFair terms',
                    'robots' => 'noindex, follow',
                ];

            case 'privacy-policy':
                return [
                    'title' => 'Privacy Policy | SnipFair',
                    'description' => 'Learn how SnipFair protects your privacy and handles your personal information.',
                    'keywords' => 'privacy policy, data protection, personal information',
                    'robots' => 'noindex, follow',
                ];

            default:
                return [];
        }
    }

    /**
     * Get stylist page SEO data
     */
    private function getStylistPageSeo(Request $request): array
    {
        // You can fetch stylist data here and customize SEO accordingly
        $stylistId = $request->route('id');
        
        return [
            'title' => 'Professional Beauty Stylist Profile | SnipFair',
            'description' => 'View professional stylist profile, portfolio, services, and book appointments. Verified beauty expert with customer reviews.',
            'keywords' => 'stylist profile, beauty professional, book stylist, verified stylist',
            'type' => 'profile',
        ];
    }

    /**
     * Get default JSON-LD schema
     */
    private function getDefaultSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'SnipFair',
            'url' => config('app.url'),
            'logo' => asset('images/Background.png'),
            'description' => 'Professional beauty services platform connecting customers with verified stylists.',
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => '+1-XXX-XXX-XXXX', // Replace with actual phone
                'contactType' => 'customer service',
                'availableLanguage' => ['English']
            ],
            'sameAs' => [
                'https://www.facebook.com/snipfair',
                'https://www.instagram.com/snipfair',
                'https://www.twitter.com/snipfair'
            ]
        ];
    }

    /**
     * Get homepage specific schema
     */
    private function getHomePageSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'LocalBusiness',
            'name' => 'SnipFair',
            'url' => config('app.url'),
            'logo' => asset('images/Background.png'),
            'description' => 'Professional mobile beauty services platform',
            'address' => [
                '@type' => 'PostalAddress',
                'addressCountry' => 'US', // Update as needed
            ],
            'serviceType' => 'Beauty Services',
            'areaServed' => [
                '@type' => 'Country',
                'name' => 'United States' // Update as needed
            ],
            'hasOfferCatalog' => [
                '@type' => 'OfferCatalog',
                'name' => 'Beauty Services',
                'itemListElement' => [
                    [
                        '@type' => 'Offer',
                        'itemOffered' => [
                            '@type' => 'Service',
                            'name' => 'Hair Styling Services'
                        ]
                    ],
                    [
                        '@type' => 'Offer',
                        'itemOffered' => [
                            '@type' => 'Service',
                            'name' => 'Makeup Services'
                        ]
                    ],
                    [
                        '@type' => 'Offer',
                        'itemOffered' => [
                            '@type' => 'Service',
                            'name' => 'Nail Services'
                        ]
                    ]
                ]
            ]
        ];
    }
}
