import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    // server: {
    //     host: '0.0.0.0', // allow external access (important for ngrok)
    //     port: 5173,
    //     hmr: {
    //         host: '9aad0c8d49e9.ngrok-free.app', // 👈 your ngrok URL (without https://)
    //         protocol: 'wss',
    //     },
    // },
});
