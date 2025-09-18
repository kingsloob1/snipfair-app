import { Link } from '@inertiajs/react';

const LogoWrapper = ({
    title = 'Welcome to Snipfair',
    subtitle = '',
    onlyLogo = false,
}: {
    title?: string;
    subtitle?: string;
    onlyLogo?: boolean;
}) => {
    return (
        <Link className="flex flex-col items-center" href={route('home')}>
            <div className="flex flex-col items-center gap-4">
                <img
                    className="h-11 w-11 rounded-lg"
                    src="/images/logo/logo_primary.png"
                />

                {/* Welcome text */}
                {!onlyLogo && (
                    <div className="text-center font-inter text-base font-bold text-sf-black-secondary">
                        {title}
                    </div>
                )}
            </div>

            {/* Subtitle */}
            {!onlyLogo && (
                <div className="text-center text-sm text-sf-primary-paragraph">
                    {subtitle}
                </div>
            )}
        </Link>
    );
};

export default LogoWrapper;
