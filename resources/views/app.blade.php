<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- SEO Meta Tags -->
        @if(isset($page['props']['seo']))
            @php $seo = $page['props']['seo']; @endphp

            <title>{{ $seo['title'] ?? config('app.name', 'Laravel') }}</title>
            <meta name="description" content="{{ $seo['description'] ?? '' }}">
            <meta name="keywords" content="{{ $seo['keywords'] ?? '' }}">
            <meta name="robots" content="{{ $seo['robots'] ?? 'index, follow' }}">
            @if(isset($seo['canonical']))
                <link rel="canonical" href="{{ $seo['canonical'] }}">
            @endif

            <!-- Open Graph / Facebook -->
            <meta property="og:title" content="{{ $seo['title'] ?? config('app.name') }}">
            <meta property="og:description" content="{{ $seo['description'] ?? '' }}">
            <meta property="og:type" content="{{ $seo['type'] ?? 'website' }}">
            <meta property="og:url" content="{{ $seo['url'] ?? request()->url() }}">
            @if(isset($seo['image']))
                <meta property="og:image" content="{{ $seo['image'] }}">
            @endif
            <meta property="og:site_name" content="{{ $seo['site_name'] ?? config('app.name') }}">
            <meta property="og:locale" content="{{ $seo['locale'] ?? 'en_US' }}">

            <!-- Twitter Card -->
            <meta name="twitter:card" content="{{ $seo['twitter_card'] ?? 'summary_large_image' }}">
            @if(isset($seo['twitter_site']))
                <meta name="twitter:site" content="{{ $seo['twitter_site'] }}">
            @endif
            <meta name="twitter:title" content="{{ $seo['title'] ?? config('app.name') }}">
            <meta name="twitter:description" content="{{ $seo['description'] ?? '' }}">
            @if(isset($seo['image']))
                <meta name="twitter:image" content="{{ $seo['image'] }}">
            @endif

            <!-- JSON-LD Schema -->
            @if(isset($seo['schema']))
                <script type="application/ld+json">
                    {!! is_array($seo['schema']) ? json_encode($seo['schema']) : $seo['schema'] !!}
                </script>
            @endif
        @else
            <title inertia>{{ config('app.name', 'Snipfair') }}</title>
        @endif

        <link rel="icon" type="image/png" sizes="32x32" href="/images/Background.png">

        <!-- Additional SEO Meta Tags -->
        <meta name="format-detection" content="telephone=no">
        <meta name="theme-color" content="#6366f1">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'SnipFair') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/@geoapify/geocoder-autocomplete@^1/styles/minimal.css">

        <!-- Google tag (gtag.js) -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17623008085">
        </script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-17623008085');
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia

        <!--Start of Tawk.to Script-->
        <script type="text/javascript">
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            Tawk_API.customStyle = {
                visibility: {
                    desktop: {
                        position: 'br', // 'br' for bottom-right, 'bl' for bottom-left
                        xOffset: '20px', // Horizontal offset from the corner
                        yOffset: '30px'  // Vertical offset from the corner
                    },
                    mobile: {
                        position: 'br',
                        xOffset: '15px',
                        yOffset: '60px'
                    }
                }
            };

            (function(){
                var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                s1.async=true;
                s1.src='https://embed.tawk.to/6899a3a1a4fc79192a7c1675/1j2c2ecf4';
                s1.charset='UTF-8';
                s1.setAttribute('crossorigin','*');
                s0.parentNode.insertBefore(s1,s0);
            })();

            Tawk_API.onLoad = function(){
                Tawk_API.hideWidget();
            };
        </script>
        <!--End of Tawk.to Script-->
    </body>
</html>
