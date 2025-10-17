import { apiCall } from '@/hooks/api';
import { getCookie, setCookie } from '@/lib/helper';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

interface LocationCoords {
    latitude: number;
    longitude: number;
    accuracy: number;
}

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
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState({
        cookie: false,
        location: false,
    });

    const [consentStatus, setConsentStatus] = useState<ConsentStatus>({
        cookieConsent: null,
        locationConsent: null,
        locationStatus: 'unknown',
    });

    // Check existing consents on component mount
    useEffect(() => {
        checkExistingConsents();
    }, []);

    const updateUserLocation = useCallback(async () => {
        try {
            setConsentStatus((prev) => ({
                ...prev,
                locationStatus: 'loading',
            }));

            const coords = await requestLocation();

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
    }, []);

    // Auto-update location every 5 minutes if consent is granted
    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval> | null = null;

        if (
            consentStatus.cookieConsent === 'accepted' &&
            consentStatus.locationConsent === true
        ) {
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
    }, [
        consentStatus.cookieConsent,
        consentStatus.locationConsent,
        updateUserLocation,
    ]);

    const checkExistingConsents = async () => {
        // Check cookie consent
        const cookieConsent = getCookie('cookieConsent-snipfair');

        // Check location consent from backend
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

        // Show popup if no consents are given
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
        setCookie('cookieConsent-snipfair', verdict, 365);
        setConsentStatus((prev) => ({ ...prev, cookieConsent: verdict }));

        // If accepting all, also handle location
        if (verdict === 'accepted') {
            await handleLocationConsent(true);
        } else {
            await handleLocationConsent(false);
        }

        document.body.classList.remove('no-scrollbar');
        document.body.classList.remove('no-bg-scroll');
        setIsVisible(false);
    };

    const handleLocationConsent = async (granted: boolean) => {
        try {
            // Record consent in backend
            await apiCall('/api/location-consent', {
                method: 'POST',
                body: JSON.stringify({ consent_given: granted }),
            });

            setConsentStatus((prev) => ({
                ...prev,
                locationConsent: granted,
                locationStatus: granted ? 'loading' : 'denied',
            }));

            if (granted) {
                // Request location
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

    const requestLocation = (): Promise<LocationCoords> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(
                    new Error('Geolocation is not supported by this browser'),
                );
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes cache
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords: LocationCoords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    };
                    resolve(coords);
                },
                (error) => {
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                options,
            );
        });
    };

    const fallbackToIPLocation = async () => {
        try {
            const response = await apiCall('/api/ip-location', {
                method: 'POST',
            });

            if (response.ok) {
                setConsentStatus((prev) => ({
                    ...prev,
                    locationStatus: 'granted',
                    locationDetails: {
                        accuracy: '~50km',
                        timestamp: new Date().toLocaleString(),
                        method: 'ip',
                    },
                }));
            } else {
                throw new Error('IP location failed');
            }
        } catch (error) {
            console.error('IP location fallback failed:', error);
            setConsentStatus((prev) => ({
                ...prev,
                locationStatus: 'unavailable',
            }));
        }
    };

    const getLocationStatusDisplay = () => {
        switch (consentStatus.locationStatus) {
            case 'granted':
                return {
                    icon: '✅',
                    text:
                        consentStatus.locationDetails?.method === 'ip'
                            ? 'Approximate location enabled (IP-based)'
                            : 'Location enabled',
                    color: 'text-green-600',
                };
            case 'denied':
                return {
                    icon: '❌',
                    text: 'Location access declined',
                    color: 'text-red-600',
                };
            case 'loading':
                return {
                    icon: '⏳',
                    text: 'Getting your location...',
                    color: 'text-yellow-600',
                };
            case 'unavailable':
                return {
                    icon: '⚠️',
                    text: 'Location services unavailable',
                    color: 'text-gray-600',
                };
            default:
                return {
                    icon: '📍',
                    text: 'Location access not determined',
                    color: 'text-gray-600',
                };
        }
    };

    const locationDisplay = getLocationStatusDisplay();

    return (
        <>
            {/* Status indicator - always visible after initial consent */}
            {consentStatus.cookieConsent && (
                <div className="fixed bottom-4 left-4 z-50 max-w-sm rounded-lg border bg-white p-3 shadow-lg dark:bg-gray-800">
                    <div className="text-sm">
                        <div className="mb-2 flex items-center gap-2">
                            <span>🍪</span>
                            <span className="text-green-600">
                                Cookies: {consentStatus.cookieConsent}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>{locationDisplay.icon}</span>
                            <span className={locationDisplay.color}>
                                {locationDisplay.text}
                            </span>
                        </div>
                        {consentStatus.locationDetails && (
                            <div className="mt-1 text-xs text-gray-500">
                                Accuracy:{' '}
                                {consentStatus.locationDetails.accuracy}m |
                                Updated:{' '}
                                {consentStatus.locationDetails.timestamp}
                            </div>
                        )}
                        {consentStatus.locationStatus === 'denied' && (
                            <div className="mt-2 text-xs text-gray-600">
                                Distance calculations and nearby suggestions
                                will be limited.
                                <button
                                    onClick={() => handleLocationConsent(true)}
                                    className="ml-1 text-blue-600 underline"
                                >
                                    Enable location
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Consent Modal */}
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
                        <div className="fixed bottom-4 right-8 w-full max-w-md rounded-lg border border-sf-gray bg-sf-black-secondary p-6 shadow-xl">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            >
                                <div className="flex flex-col gap-4">
                                    <h2 className="text-2xl font-semibold text-sf-black dark:text-white">
                                        🔐 Consent Preferences
                                    </h2>

                                    {/* Cookie Section */}
                                    <div>
                                        <button
                                            onClick={() =>
                                                setShowDetails((prev) => ({
                                                    ...prev,
                                                    cookie: !prev.cookie,
                                                }))
                                            }
                                            className="w-full text-left font-medium text-sf-primary"
                                        >
                                            🍪 We use cookies{' '}
                                            {showDetails.cookie ? '▲' : '▼'}
                                        </button>
                                        {showDetails.cookie && (
                                            <p className="mt-2 text-sm text-sf-primary-paragraph">
                                                This website uses essential
                                                cookies to ensure its proper
                                                operation. These cookies are
                                                necessary for basic
                                                functionality and cannot be
                                                disabled.
                                            </p>
                                        )}
                                    </div>

                                    {/* Location Section */}
                                    <div>
                                        <button
                                            onClick={() =>
                                                setShowDetails((prev) => ({
                                                    ...prev,
                                                    location: !prev.location,
                                                }))
                                            }
                                            className="w-full text-left font-medium text-sf-primary"
                                        >
                                            📍 Location Access{' '}
                                            {showDetails.location ? '▲' : '▼'}
                                        </button>
                                        {showDetails.location && (
                                            <div className="mt-2 space-y-2 text-sm text-sf-primary-paragraph">
                                                <p>We use your location to:</p>
                                                <ul className="list-disc pl-5">
                                                    <li>
                                                        Find nearby providers
                                                    </li>
                                                    <li>
                                                        Show accurate distances
                                                        and availability
                                                    </li>
                                                    <li>
                                                        Improve safety and
                                                        compliance
                                                    </li>
                                                </ul>
                                                <p>
                                                    Your data is encrypted and
                                                    never sold. You can disable
                                                    location sharing anytime in
                                                    your account settings.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleCookieConsent('denied')
                                            }
                                            className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-white"
                                        >
                                            Deny All
                                        </motion.button>

                                        <motion.button
                                            whileHover={{
                                                scale: 1.05,
                                                backgroundColor: '#00FF00',
                                            }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                handleCookieConsent('accepted')
                                            }
                                            className="rounded-md bg-sf-primary px-4 py-2 text-sm font-medium text-white"
                                        >
                                            Accept All
                                        </motion.button>
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
