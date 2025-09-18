<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default SEO Configuration
    |--------------------------------------------------------------------------
    |
    | These values are used as defaults for SEO meta tags when specific
    | values are not provided for individual pages.
    |
    */

    'default' => [
        'title' => env('SEO_DEFAULT_TITLE', config('app.name', 'SnipFair') . ' - Professional Beauty Services at Your Doorstep'),
        'description' => env('SEO_DEFAULT_DESCRIPTION', 'Book professional beauty services with verified stylists in your area. Hair styling, makeup, nails, and more. Trusted by thousands of customers.'),
        'keywords' => env('SEO_DEFAULT_KEYWORDS', 'beauty services, hair stylist, makeup artist, nail technician, mobile beauty, home service, professional styling'),
        'image' => env('SEO_DEFAULT_IMAGE', '/images/Background.png'),
        'type' => 'website',
        'locale' => 'en_US',
        'site_name' => config('app.name', 'SnipFair'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Social Media Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for social media meta tags and structured data.
    |
    */

    'social' => [
        'twitter' => [
            'card' => 'summary_large_image',
            'site' => env('TWITTER_SITE', '@snipfair'),
            'creator' => env('TWITTER_CREATOR', '@snipfair'),
        ],
        'facebook' => [
            'app_id' => env('FACEBOOK_APP_ID'),
        ],
        'social_links' => [
            'facebook' => env('SOCIAL_FACEBOOK', 'https://www.facebook.com/snipfair'),
            'instagram' => env('SOCIAL_INSTAGRAM', 'https://www.instagram.com/snipfair'),
            'twitter' => env('SOCIAL_TWITTER', 'https://www.twitter.com/snipfair'),
            'linkedin' => env('SOCIAL_LINKEDIN'),
            'youtube' => env('SOCIAL_YOUTUBE'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Business Information
    |--------------------------------------------------------------------------
    |
    | Information about your business for structured data markup.
    |
    */

    'business' => [
        'name' => config('app.name', 'SnipFair'),
        'legal_name' => env('BUSINESS_LEGAL_NAME', 'SnipFair Inc.'),
        'description' => 'Professional beauty services platform connecting customers with verified stylists.',
        'logo' => env('BUSINESS_LOGO', '/images/Background.png'),
        'contact' => [
            'telephone' => env('BUSINESS_PHONE'),
            'email' => env('BUSINESS_EMAIL', 'support@snipfair.com'),
            'contact_type' => 'customer service',
            'available_language' => ['English'],
        ],
        'address' => [
            'street_address' => env('BUSINESS_STREET_ADDRESS'),
            'address_locality' => env('BUSINESS_CITY'),
            'address_region' => env('BUSINESS_STATE'),
            'postal_code' => env('BUSINESS_POSTAL_CODE'),
            'address_country' => env('BUSINESS_COUNTRY', 'US'),
        ],
        'operating_hours' => [
            'monday' => env('BUSINESS_HOURS_MONDAY', '09:00-17:00'),
            'tuesday' => env('BUSINESS_HOURS_TUESDAY', '09:00-17:00'),
            'wednesday' => env('BUSINESS_HOURS_WEDNESDAY', '09:00-17:00'),
            'thursday' => env('BUSINESS_HOURS_THURSDAY', '09:00-17:00'),
            'friday' => env('BUSINESS_HOURS_FRIDAY', '09:00-17:00'),
            'saturday' => env('BUSINESS_HOURS_SATURDAY', '10:00-16:00'),
            'sunday' => env('BUSINESS_HOURS_SUNDAY', 'closed'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Robots Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for robots.txt file generation.
    |
    */

    'robots' => [
        'disallow' => [
            '/admin/',
            '/customer/',
            '/stylist/',
            '/profile/',
            '/dashboard/',
            '/login/',
            '/register/',
            '/reset-password/',
            '/verify-email/',
            '/chat/',
            '/disputes/',
            '/support/',
            '/api/',
            '/storage/private/',
        ],
        'allow' => [
            '/images/',
            '/css/',
            '/js/',
            '/assets/',
            '/build/',
        ],
        'crawl_delay' => env('ROBOTS_CRAWL_DELAY', null),
        'additional_rules' => env('ROBOTS_ADDITIONAL_RULES', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Sitemap Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for XML sitemap generation.
    |
    */

    'sitemap' => [
        'static_pages' => [
            'home' => ['priority' => '1.0', 'changefreq' => 'daily'],
            'about' => ['priority' => '0.8', 'changefreq' => 'monthly'],
            'services' => ['priority' => '0.9', 'changefreq' => 'weekly'],
            'explore' => ['priority' => '0.9', 'changefreq' => 'daily'],
            'faqs' => ['priority' => '0.7', 'changefreq' => 'monthly'],
            'contact' => ['priority' => '0.6', 'changefreq' => 'monthly'],
        ],
        'dynamic_pages' => [
            'stylists' => ['priority' => '0.8', 'changefreq' => 'weekly'],
            'services' => ['priority' => '0.7', 'changefreq' => 'weekly'],
        ],
        'cache_duration' => env('SITEMAP_CACHE_DURATION', 3600), // 1 hour
    ],

    /*
    |--------------------------------------------------------------------------
    | Analytics and Tracking
    |--------------------------------------------------------------------------
    |
    | Configuration for analytics and tracking codes.
    |
    */

    'analytics' => [
        'google_analytics_id' => env('GOOGLE_ANALYTICS_ID'),
        'google_tag_manager_id' => env('GOOGLE_TAG_MANAGER_ID'),
        'facebook_pixel_id' => env('FACEBOOK_PIXEL_ID'),
        'hotjar_id' => env('HOTJAR_ID'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rich Snippets
    |--------------------------------------------------------------------------
    |
    | Enable/disable different types of rich snippets.
    |
    */

    'rich_snippets' => [
        'organization' => true,
        'local_business' => true,
        'breadcrumbs' => true,
        'faq' => true,
        'person' => true,
        'service' => true,
        'review' => true,
    ],
];
