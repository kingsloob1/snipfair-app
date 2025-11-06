import { apiCall } from '@/hooks/api';
import CookiePopup from '@/Pages/CookiePopup';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported } from 'firebase/messaging';
import { waitFor } from 'poll-until-promise';
import React, { useEffect } from 'react';
import { useLocalStorage } from 'react-use';
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
        props: {
            flash,
            'auth:from:app': authenticatedFromApp,
            auth: { user },
            firebaseVapidKey,
            firebaseWebConfig,
        },
    } = usePage<
        PageProps & {
            flash?: {
                success?: string;
                error?: string;
                info?: string;
                warning?: string;
                message?: string;
            };
            firebaseVapidKey?: string;
            firebaseWebConfig?: FirebaseOptions;
        }
    >();

    const [firebaseTokenData, setFirebaseTokenData, deleteFirebaseTokenData] =
        useLocalStorage<{
            user_id: string;
            token: string;
            isSaved: boolean;
        }>('firebase-messaging-token-data');

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

    useEffect(() => {
        if (!(user && firebaseVapidKey)) {
            deleteFirebaseTokenData();
            return () => null;
        }

        if (firebaseTokenData) {
            if (firebaseTokenData.user_id !== String(user.id)) {
                deleteFirebaseTokenData();
            } else if (firebaseTokenData.isSaved) {
                return () => null;
            }
        }

        const getFirebaseNotificationTokenForDevice = async (e: MouseEvent) => {
            if (!isSupported()) {
                console.error('Firebase is not supported in this browser');
                return;
            }

            if (user && firebaseVapidKey && firebaseWebConfig) {
                // Initialize Firebase
                const app = initializeApp(firebaseWebConfig);
                const prevNotificationStatus = window.Notification.permission;

                if (!['granted', 'denied'].includes(prevNotificationStatus)) {
                    console.log('Requesting permission...');
                }

                const permission = await Notification.requestPermission();
                switch (permission) {
                    case 'denied': {
                        if (prevNotificationStatus !== permission) {
                            console.log('Notification permission denied.');
                            toast.error('Notification permission denied.');
                        }

                        document.removeEventListener(
                            'click',
                            getFirebaseNotificationTokenForDevice,
                        );
                        break;
                    }

                    case 'granted': {
                        if (prevNotificationStatus !== permission) {
                            console.log('Notification permission granted.');
                            toast.success('Notification permission granted.');
                        }
                        const messaging = getMessaging(app);

                        try {
                            // Add the public key generated from the console here.
                            const firebaseDeviceToken = await getToken(
                                messaging,
                                {
                                    vapidKey: firebaseVapidKey,
                                },
                            );

                            if (firebaseDeviceToken) {
                                setFirebaseTokenData({
                                    user_id: String(user.id),
                                    token: firebaseDeviceToken,
                                    isSaved: false,
                                });
                                const response = await apiCall(
                                    '/api/user/update',
                                    {
                                        method: 'POST',
                                        body: JSON.stringify({
                                            firebase_device_token:
                                                firebaseDeviceToken,
                                        }),
                                    },
                                );

                                document.removeEventListener(
                                    'click',
                                    getFirebaseNotificationTokenForDevice,
                                );

                                setFirebaseTokenData({
                                    user_id: String(user.id),
                                    token: firebaseDeviceToken,
                                    isSaved: true,
                                });

                                console.log(
                                    'Response from setting firebase device token =====> ',
                                    response,
                                );
                            }
                        } catch (e) {
                            console.error(
                                'Failed to get firebase notification token with error ====> ',
                                e,
                            );
                        }
                        break;
                    }

                    case 'default':
                    default: {
                        getFirebaseNotificationTokenForDevice(e);
                        break;
                    }
                }
            }
        };

        document.addEventListener(
            'click',
            getFirebaseNotificationTokenForDevice,
        );

        return () => {
            document.removeEventListener(
                'click',
                getFirebaseNotificationTokenForDevice,
            );
        };
    }, [user, firebaseVapidKey]);

    return (
        <>
            <Toaster richColors position="top-right" />
            <FullscreenOverlay />
            {!window.window.route().current('admin.*') && <CookiePopup />}
            {children}
        </>
    );
}
