import CookiePopup from '@/Pages/CookiePopup';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import FullscreenOverlay from './FullscreenOverlay';
import { Toaster } from './ui/sonner';

declare global {
    interface Window {
        Tawk_API?: {
            toggle: () => void;
            showWidget: () => void;
            hideWidget: () => void;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            //     route().current('terms') ||
            //     route().current('privacy-policy') ||
            //     route().current('cookies') ||
            //     route().current('faqs') ||
            //     route().current('contact') ||
            //     route().current('support.*');
            const isShowRoute =
                route().current('admin.*') ||
                route().current('login') ||
                route().current('register') ||
                route().current('stylist.register');

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
            {!route().current('admin.*') && <CookiePopup />}
            {children}
        </>
    );
}
