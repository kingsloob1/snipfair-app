import CustomButton from '@/Components/common/CustomButton';
import { apiCall } from '@/hooks/api';
import { getCookie, setCookie } from '@/lib/helper';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { useGeolocated } from 'react-geolocated';
import { toast } from 'sonner';

interface ConsentStatus {
    cookieConsent: string | null;
    locationConsent: boolean | null;
    locationStatus:
        | 'unknown'
        | 'granted'
        | 'denied'
        | 'unavailable'
        | 'loading';
    locationDetails?: {
        accuracy: number | string;
        timestamp: string;
        method: 'gps' | 'ip' | null;
    };
}

const CookiePopup = () => {
    const {
        url,
        props: {
            'auth:from:app': authenticatedFromApp,
            auth: { user },
        },
    } = usePage();
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [consentStatus, setConsentStatus] = useState<ConsentStatus>({
        cookieConsent: null,
        locationConsent: null,
        locationStatus: 'unknown',
    });

    const {
        coords,
        isGeolocationAvailable,
        isGeolocationEnabled,
        getPosition,
    } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: true,
            maximumAge: 300000, // 5 minutes cache
            timeout: 10000,
        },
        userDecisionTimeout: 10000,
    });

    // Check existing consents on component mount
    useEffect(() => {
        if (
            !!user &&
            !authenticatedFromApp &&
            !window.route().current('terms') &&
            !window.route().current('privacy-policy') &&
            !window.route().current('cookies') &&
            !window.route().current('login') &&
            !window.route().current('register') &&
            !window.route().current('stylist.register') &&
            !window.route().current('dashboard') &&
            !window.route().current('stylist.dashboard')
        ) {
            checkExistingConsents();
        } else setIsVisible(false);
    }, [url, user, authenticatedFromApp]);

    // In updateUserLocation
    const updateUserLocation = useCallback(async () => {
        try {
            if (!user || authenticatedFromApp) {
                return;
            }

            if (
                !['customer.', 'stylist.'].some((namePrefix) =>
                    window.route().current()?.startsWith(namePrefix),
                )
            ) {
                return;
            }

            if (!isGeolocationAvailable) {
                toast.error('Geolocation is not supported by this browser');
                throw new Error('Geolocation is not supported by this browser');
            }

            if (!isGeolocationEnabled) {
                toast.error('Location access denied');
                throw new Error('Location access denied by user');
            }

            setConsentStatus((prev) => ({
                ...prev,
                locationStatus: 'loading',
            }));

            if (!coords) {
                getPosition();
                return;
            }

            const response = await apiCall('/api/update-location', {
                method: 'POST',
                body: JSON.stringify({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update location on server');
            }

            // const data = await response.json(); // Parse JSON response
            setConsentStatus((prev) => ({
                ...prev,
                locationStatus: 'granted',
                locationDetails: {
                    accuracy: Math.round(coords.accuracy),
                    timestamp: new Date().toLocaleString(),
                    method: 'gps',
                },
            }));
        } catch (error) {
            console.error('Location error:', error);
            await fallbackToIPLocation();
        }
    }, [
        coords,
        isGeolocationAvailable,
        isGeolocationEnabled,
        getPosition,
        url,
        user,
        authenticatedFromApp,
    ]);

    // In handleLocationConsent
    const handleLocationConsent = async (granted: boolean) => {
        try {
            const response = await apiCall('/api/location-consent', {
                method: 'POST',
                body: JSON.stringify({ consent_given: granted }),
            });

            if (!response.ok) {
                throw new Error('Failed to update location consent');
            }

            setConsentStatus((prev) => ({
                ...prev,
                locationConsent: granted,
                locationStatus: granted ? 'loading' : 'denied',
            }));

            if (granted) {
                await updateUserLocation();
            } else {
                setConsentStatus((prev) => ({
                    ...prev,
                    locationStatus: 'denied',
                }));
            }
        } catch (error) {
            console.error('Error handling location consent:', error);
            setConsentStatus((prev) => ({
                ...prev,
                locationStatus: 'unavailable',
            }));
        }
    };

    // In fallbackToIPLocation
    const fallbackToIPLocation = async () => {
        try {
            const response = await apiCall('/api/ip-location', {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('IP location failed');
            }

            setConsentStatus((prev) => ({
                ...prev,
                locationStatus: 'granted',
                locationDetails: {
                    accuracy: '~50km',
                    timestamp: new Date().toLocaleString(),
                    method: 'ip',
                },
            }));
        } catch (error) {
            console.error('IP location fallback failed:', error);
            setConsentStatus((prev) => ({
                ...prev,
                locationStatus: 'unavailable',
            }));
        }
    };

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;

        if (consentStatus.cookieConsent === 'accepted') {
            intervalId = setInterval(
                () => {
                    updateUserLocation();
                },
                5 * 60 * 1000,
            ); // 5 minutes in milliseconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [consentStatus.cookieConsent, updateUserLocation]);

    const checkExistingConsents = async () => {
        const cookieConsent = getCookie('cookieConsent-snipfair');
        let locationConsent = null;
        let locationStatus: ConsentStatus['locationStatus'] = 'unknown';

        try {
            const response = await apiCall('/api/location-consent-status', {});

            if (response.ok) {
                const data = await response.json();
                locationConsent = data.consent_given;
                locationStatus = data.consent_given ? 'granted' : 'denied';
            }
        } catch (error) {
            console.error('Error checking location consent status:', error);
        }

        setConsentStatus({
            cookieConsent,
            locationConsent,
            locationStatus,
        });

        if (!cookieConsent) {
            const timer = setTimeout(() => {
                document.body.classList.add('no-scrollbar');
                document.body.classList.add('no-bg-scroll');
                setIsVisible(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    };

    const handleCookieConsent = async (verdict: 'accepted' | 'denied') => {
        setLoading(true);
        setCookie('cookieConsent-snipfair', verdict, 365);
        setConsentStatus((prev) => ({ ...prev, cookieConsent: verdict }));

        if (verdict === 'accepted') {
            await handleLocationConsent(true);
        } else {
            await handleLocationConsent(false);
        }

        setLoading(false);
        document.body.classList.remove('no-scrollbar');
        document.body.classList.remove('no-bg-scroll');
        setIsVisible(false);
    };

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        style={{
                            zIndex: 1009,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="fixed inset-0 bg-sf-black"
                        />
                        <div className="fixed bottom-4 left-0 w-full max-w-md rounded-lg border border-sf-gray bg-sf-black-secondary p-6 shadow-xl md:left-8">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            >
                                <div className="bg-sf-primary-paragraphs flex flex-col gap-4 rounded-lg p-6">
                                    <div>
                                        <p className="text-sm text-sf-primary-background">
                                            🍪 We use essential cookies for
                                            website functionality and your
                                            location to enable nearby user
                                            connections, accurate distance
                                            display, and improved safety. Your
                                            data is encrypted and never sold.
                                            Location sharing can be disabled in
                                            your account settings. Learn more in
                                            our{' '}
                                            <Link
                                                href="/terms"
                                                className="text-sf-white underline transition-all duration-300 hover:no-underline"
                                            >
                                                Terms of Service
                                            </Link>
                                            ,{' '}
                                            <Link
                                                href="/privacy-policy"
                                                className="text-sf-white underline transition-all duration-300 hover:no-underline"
                                            >
                                                Privacy Policy
                                            </Link>
                                            , and{' '}
                                            <Link
                                                href="/cookies"
                                                className="text-sf-white underline transition-all duration-300 hover:no-underline"
                                            >
                                                Cookie Policy
                                            </Link>
                                            .
                                        </p>
                                    </div>
                                    <div className="flex justify-start gap-4">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <CustomButton
                                                variant="secondary"
                                                fullWidth={false}
                                                disabled={loading}
                                                onClick={() =>
                                                    handleCookieConsent(
                                                        'denied',
                                                    )
                                                }
                                                className="text-sm font-medium"
                                            >
                                                Deny All
                                            </CustomButton>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{
                                                scale: 1.05,
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <CustomButton
                                                fullWidth={false}
                                                disabled={loading}
                                                onClick={() =>
                                                    handleCookieConsent(
                                                        'accepted',
                                                    )
                                                }
                                                className="text-sm font-medium"
                                            >
                                                Accept All
                                            </CustomButton>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CookiePopup;
