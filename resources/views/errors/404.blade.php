@extends('errors.__base')
@section('title')
    {{ $title ?? 'Page Not Found' }}
@endsection
@section('content')
    <div id="app" data-page="{{ json_encode([
        'component' => 'Errors/GlobalError',
        'props' => [
            'status' => $status ?? 404,
            'title' => $title ?? 'Page Not Found',
            'message' => $message ?? 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
            'action' => $action ?? 'Go back to safety',
            'canGoBack' => $canGoBack ?? true,
            'homeUrl' => $homeUrl ?? url('/'),
            'previousUrl' => $previousUrl ?? url()->previous(),
        ],
        'url' => request()->url(),
        'version' => null
    ]) }}"></div>
@endsection