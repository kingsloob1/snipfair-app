<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" sizes="32x32" href="/images/Background.png">
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <title>{{ config('app.name') }} - @yield('title')</title>
        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        {{-- @inertiaHead --}}
    </head>
    <body class="font-sans antialiased">
        {{-- @inertia- --}}
        @yield('content')
    </body>
</html>
