<?php

namespace App\Console\Commands;

use App\Services\SitemapService;
use Illuminate\Console\Command;

class GenerateSitemap extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'seo:generate-sitemap';

    /**
     * The console command description.
     */
    protected $description = 'Generate XML sitemap and robots.txt file';

    /**
     * Execute the console command.
     */
    public function handle(SitemapService $sitemapService): int
    {
        $this->info('Generating sitemap...');
        
        try {
            // Generate and save sitemap
            $sitemapService->saveSitemap();
            $this->info('✓ Sitemap generated successfully at public/sitemap.xml');
            
            // Generate and save robots.txt
            $sitemapService->saveRobotsTxt();
            $this->info('✓ Robots.txt generated successfully at public/robots.txt');
            
            $this->info('SEO files generated successfully!');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to generate sitemap: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
