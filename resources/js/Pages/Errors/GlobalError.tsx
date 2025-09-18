import AppLogoImage from '@/Components/AppLogoImage';
import CustomButton from '@/Components/common/CustomButton';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Clock,
    Home,
    RefreshCw,
    Server,
    Shield,
    Zap,
} from 'lucide-react';

const GlobalError = ({
    status = 500,
    title = 'Something went wrong',
    message = 'An unexpected error occurred',
    action = 'Try again',
    canGoBack = false,
    homeUrl = '/',
}) => {
    const getIcon = () => {
        switch (status) {
            case 404:
                return <AlertCircle className="h-16 w-16 text-blue-500" />;
            case 419:
                return <Shield className="h-16 w-16 text-yellow-500" />;
            case 429:
                return <Clock className="h-16 w-16 text-orange-500" />;
            case 500:
                return <Server className="h-16 w-16 text-red-500" />;
            case 503:
                return <Zap className="h-16 w-16 text-purple-500" />;
            default:
                return <AlertCircle className="h-16 w-16 text-gray-500" />;
        }
    };

    const getGradient = () => {
        switch (status) {
            case 404:
                return 'from-blue-50 to-indigo-100';
            case 419:
                return 'from-yellow-50 to-amber-100';
            case 429:
                return 'from-orange-50 to-red-100';
            case 500:
                return 'from-red-50 to-pink-100';
            case 503:
                return 'from-purple-50 to-indigo-100';
            default:
                return 'from-gray-50 to-slate-100';
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleRetry = () => {
        if (status === 419) {
            handleRefresh();
        } else {
            router.reload();
        }
    };

    return (
        <>
            <Head title={`${status} - ${title}`} />

            <div
                className={`min-h-screen bg-gradient-to-br ${getGradient()} flex items-center justify-center p-4`}
            >
                <div className="w-full max-w-lg">
                    <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
                        <div className="flex justify-center">
                            <AppLogoImage
                                className="h-12 w-12 md:h-16 md:w-16"
                                type="primary"
                            />
                        </div>
                        <div className="my-5 flex items-center justify-center gap-2.5 text-6xl font-bold text-sf-gradient-purple">
                            {status} {getIcon()}
                        </div>

                        {/* Title */}
                        <h1 className="mb-4 text-2xl font-bold text-sf-primary-paragraph">
                            {title}
                        </h1>

                        {/* Message */}
                        <p className="mb-8 leading-relaxed text-gray-600">
                            {message}
                        </p>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {/* Primary Action */}
                            {(status === 419 ||
                                status === 500 ||
                                status === 503) && (
                                <CustomButton
                                    onClick={handleRetry}
                                    variant="black"
                                >
                                    <div className="flex w-full items-center justify-center">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        {status === 419
                                            ? 'Refresh Page'
                                            : action}
                                    </div>
                                </CustomButton>
                            )}

                            {/* Navigation Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                {canGoBack && (
                                    <CustomButton
                                        onClick={() => window.history.back()}
                                        variant="secondary"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ArrowLeft className="h-4 w-4" />
                                            Go Back
                                        </div>
                                    </CustomButton>
                                )}

                                <Link href={homeUrl}>
                                    <CustomButton variant="primary">
                                        <div className="flex items-center gap-2">
                                            <Home className="h-4 w-4" />
                                            Home
                                        </div>
                                    </CustomButton>
                                </Link>
                            </div>

                            {/* Rate Limit specific */}
                            {status === 429 && (
                                <div className="mt-4 rounded-lg bg-orange-50 p-3">
                                    <p className="text-sm text-danger-normal">
                                        Please wait a few minutes before trying
                                        again.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GlobalError;
