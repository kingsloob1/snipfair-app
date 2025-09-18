<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class SitemapService
{
    /**
     * Generate XML sitemap
     */
    public function generateSitemap(): string
    {
        $urls = collect();

        // Add static pages
        $staticPages = [
            ['url' => route('home'), 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => route('about'), 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['url' => route('services'), 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['url' => route('explore'), 'priority' => '0.9', 'changefreq' => 'daily'],
            ['url' => route('faqs'), 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => route('contact'), 'priority' => '0.6', 'changefreq' => 'monthly'],
        ];

        foreach ($staticPages as $page) {
            $urls->push([
                'loc' => $page['url'],
                'lastmod' => now()->toISOString(),
                'changefreq' => $page['changefreq'],
                'priority' => $page['priority']
            ]);
        }

        // Add dynamic stylist pages
        $this->addStylistPages($urls);

        // Add service category pages
        $this->addServicePages($urls);

        return $this->buildXml($urls);
    }

    /**
     * Add stylist profile pages to sitemap
     */
    private function addStylistPages($urls): void
    {
        try {
            // Get active stylists with public profiles
            $stylists = \App\Models\User::where('role', 'stylist')
                ->whereHas('stylist_profile', function ($query) {
                    $query->where('status', 'approved');
                })
                ->with('stylist_profile')
                ->get();

            foreach ($stylists as $stylist) {
                if ($stylist->stylist_profile) {
                    $urls->push([
                        'loc' => route('customer.stylists.show', $stylist->id),
                        'lastmod' => $stylist->updated_at->toISOString(),
                        'changefreq' => 'weekly',
                        'priority' => '0.8'
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Log error but continue generating sitemap
            Log::warning('Could not add stylist pages to sitemap: ' . $e->getMessage());
        }
    }

    /**
     * Add service category pages to sitemap
     */
    private function addServicePages($urls): void
    {
        try {
            // Get active service categories
            $categories = \App\Models\Category::where('status', true)->get();

            foreach ($categories as $category) {
                // You can add category-specific pages here if you have them
                // For now, we'll add them to the services page with anchor
                $urls->push([
                    'loc' => route('services') . '#' . Str::slug($category->name),
                    'lastmod' => $category->updated_at->toISOString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.7'
                ]);
            }
        } catch (\Exception $e) {
            // Log error but continue generating sitemap
            Log::warning('Could not add service pages to sitemap: ' . $e->getMessage());
        }
    }

    /**
     * Build XML from URLs collection
     */
    private function buildXml($urls): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        $xml .= "\n";

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars($url['loc']) . "</loc>\n";
            $xml .= "    <lastmod>" . $url['lastmod'] . "</lastmod>\n";
            $xml .= "    <changefreq>" . $url['changefreq'] . "</changefreq>\n";
            $xml .= "    <priority>" . $url['priority'] . "</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return $xml;
    }

    /**
     * Save sitemap to public directory
     */
    public function saveSitemap(): bool
    {
        try {
            $xml = $this->generateSitemap();
            File::put(public_path('sitemap.xml'), $xml);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to save sitemap: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Generate robots.txt content
     */
    public function generateRobotsTxt(): string
    {
        $content = "User-agent: *\n";
        $content .= "Allow: /\n";
        $content .= "\n";

        // Disallow admin and private areas
        $content .= "Disallow: /admin/\n";
        $content .= "Disallow: /customer/\n";
        $content .= "Disallow: /stylist/\n";
        $content .= "Disallow: /profile/\n";
        $content .= "Disallow: /dashboard/\n";
        $content .= "Disallow: /login/\n";
        $content .= "Disallow: /register/\n";
        $content .= "Disallow: /reset-password/\n";
        $content .= "Disallow: /verify-email/\n";
        $content .= "Disallow: /chat/\n";
        $content .= "Disallow: /disputes/\n";
        $content .= "Disallow: /support/\n";
        $content .= "\n";

        // Allow important directories
        $content .= "Allow: /images/\n";
        $content .= "Allow: /css/\n";
        $content .= "Allow: /js/\n";
        $content .= "\n";

        // Sitemap location
        $content .= "Sitemap: " . url('sitemap.xml') . "\n";

        return $content;
    }

    /**
     * Save robots.txt to public directory
     */
    public function saveRobotsTxt(): bool
    {
        try {
            $content = $this->generateRobotsTxt();
            File::put(public_path('robots.txt'), $content);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to save robots.txt: ' . $e->getMessage());
            return false;
        }
    }
}
