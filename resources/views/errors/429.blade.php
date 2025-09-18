@extends('errors.__base')
@section('title')
    {{ $title ?? 'Too Many Requests' }}
@endsection
@section('content')
    <div id="app" data-page="{{ json_encode([
        'component' => 'Errors/GlobalError',
        'props' => [
            'status' => $status ?? 429,
            'title' => $title ?? 'Too Many Requests',
            'message' => $message ?? 'You have made too many requests. Please wait a moment and try again.',
            'action' => $action ?? 'Try again later',
            'canGoBack' => $canGoBack ?? true,
            'homeUrl' => $homeUrl ?? url('/'),
            'previousUrl' => $previousUrl ?? url()->previous(),
        ],
        'url' => request()->url(),
        'version' => null
    ]) }}"></div>
@endsection
