import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { configureEcho } from '@laravel/echo-react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import FlashHandler from './Components/FlashHandler';

configureEcho({
    broadcaster: 'reverb',
});

const appName = import.meta.env.VITE_APP_NAME || 'Snipfair';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ).then((module: any) => {
            const component = module.default;
            component.layout =
                component.layout ||
                ((page: React.ReactNode) => (
                    <FlashHandler>{page}</FlashHandler>
                ));
            return component;
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#9333EA',
    },
});
