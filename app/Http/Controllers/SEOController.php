<?php

namespace App\Http\Controllers;

use App\Services\SitemapService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SEOController extends Controller
{
    protected $sitemapService;

    public function __construct(SitemapService $sitemapService)
    {
        $this->sitemapService = $sitemapService;
    }

    /**
     * Generate and return sitemap XML
     */
    public function sitemap(): Response
    {
        $xml = $this->sitemapService->generateSitemap();
        
        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=3600', // Cache for 1 hour
        ]);
    }

    /**
     * Generate and return robots.txt
     */
    public function robots(): Response
    {
        $content = $this->sitemapService->generateRobotsTxt();
        
        return response($content, 200, [
            'Content-Type' => 'text/plain',
            'Cache-Control' => 'public, max-age=86400', // Cache for 24 hours
        ]);
    }

    /**
     * Manually regenerate sitemap (admin only)
     */
    public function regenerateSitemap(): \Illuminate\Http\JsonResponse
    {
        try {
            $this->sitemapService->saveSitemap();
            $this->sitemapService->saveRobotsTxt();
            
            return response()->json([
                'success' => true,
                'message' => 'Sitemap and robots.txt regenerated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to regenerate sitemap: ' . $e->getMessage()
            ], 500);
        }
    }
}
