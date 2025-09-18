import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set up Laravel Echo with Reverb
declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'pusher'>;
    }
}

window.Pusher = Pusher;

// Enable Pusher logging for debugging
if (import.meta.env.DEV) {
    Pusher.logToConsole = true;
}

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
});

// Test Echo connection
if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully');
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.Echo.connector.pusher.connection.bind('error', (err: unknown) => {
        console.error('❌ Pusher connection error:', err);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.Echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('📤 Pusher disconnected');
    });
}
