import CookiePopup from '@/Pages/CookiePopup';
import { usePage } from '@inertiajs/react';
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
    const { url } = usePage();
    const { flash } = usePage().props as {
        flash?: {
            success?: string;
            error?: string;
            info?: string;
            warning?: string;
            message?: string;
        };
    };

    useEffect(() => {
        if (typeof window.Tawk_API !== 'undefined') {
            // const isShowRoute =
            //     window.route().current('terms') ||
            //     window.route().current('privacy-policy') ||
            //     window.route().current('cookies') ||
            //     window.route().current('faqs') ||
            //     window.route().current('contact') ||
            //     window.route().current('support.*');
            const isShowRoute =
                window.route().current('admin.*') ||
                window.route().current('login') ||
                window.route().current('register') ||
                window.route().current('stylist.register');

            setTimeout(() => {
                if (!window.Tawk_API) return;
                if (!isShowRoute) {
                    window.Tawk_API.showWidget();
                } else {
                    window.Tawk_API.hideWidget();
                }
            }, 1200);
        }
    }, [url]);

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
