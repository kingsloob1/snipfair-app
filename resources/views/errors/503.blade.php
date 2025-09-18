@extends('errors.__base')
@section('title')
    {{ $title ?? 'Service Unavailable' }}
@endsection
@section('content')
    <div id="app" data-page="{{ json_encode([
        'component' => 'Errors/GlobalError',
        'props' => [
            'status' => $status ?? 503,
            'title' => $title ?? 'Service Unavailable',
            'message' => $message ?? 'We are currently performing maintenance. Please try again in a few minutes.',
            'action' => $action ?? 'Check back soon',
            'canGoBack' => $canGoBack ?? true,
            'homeUrl' => $homeUrl ?? url('/'),
            'previousUrl' => $previousUrl ?? url()->previous(),
        ],
        'url' => request()->url(),
        'version' => null
    ]) }}"></div>
@endsection
