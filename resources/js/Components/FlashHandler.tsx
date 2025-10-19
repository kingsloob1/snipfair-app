import CookiePopup from '@/Pages/CookiePopup';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { waitFor } from 'poll-until-promise';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import FullscreenOverlay from './FullscreenOverlay';
import { Toaster } from './ui/sonner';

declare global {
    // eslint-disable-next-line no-unused-vars
    interface Window {
        Tawk_API?: {
            toggle: () => void;
            showWidget: () => void;
            hideWidget: () => void;
            [key: string]: any;
        };
    }
}

export default function FlashHandler({
    children,
}: {
    children: React.ReactNode;
}) {
    const {
        url,
        props: { flash, 'auth:from:app': authenticatedFromApp },
    } = usePage<
        PageProps & {
            flash?: {
                success?: string;
                error?: string;
                info?: string;
                warning?: string;
                message?: string;
            };
        }
    >();

    useEffect(() => {
        if (typeof window.Tawk_API !== 'undefined') {
            // const isShowRoute =
            //     window.route().current('terms') ||
            //     window.route().current('privacy-policy') ||
            //     window.route().current('cookies') ||
            //     window.route().current('faqs') ||
            //     window.route().current('contact') ||
            //     window.route().current('support.*');
            const isInAuthRoutes =
                window.route().current('admin.*') ||
                window.route().current('login') ||
                window.route().current('register') ||
                window.route().current('stylist.register');

            const shouldHide = authenticatedFromApp || isInAuthRoutes;
            waitFor(
                () => {
                    if (
                        !(
                            window.Tawk_API &&
                            'isChatHidden' in window.Tawk_API &&
                            'hideWidget' in window.Tawk_API &&
                            'showWidget' in window.Tawk_API
                        )
                    ) {
                        throw new Error('Tawk API is not yet available');
                    }

                    if (shouldHide && !window.Tawk_API.isChatHidden()) {
                        window.Tawk_API.hideWidget();
                    } else if (!shouldHide && window.Tawk_API.isChatHidden()) {
                        window.Tawk_API.showWidget();
                    }
                },
                {
                    interval: 100,
                    backoffFactor: 1,
                    stopOnFailure: false,
                    timeout: 50000,
                },
            );
        }
    }, [url, authenticatedFromApp]);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.info(flash.info);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.message) toast(flash.message);
    }, [flash]);

    return (
        <>
            <Toaster richColors position="top-right" />
            <FullscreenOverlay />
            {!window.window.route().current('admin.*') && <CookiePopup />}
            {children}
        </>
    );
}
