import defaultLogo from '@/assets/logo/logo.png';
import primaryLogo from '@/assets/logo/logo_primary.png';
import { cn } from '@/lib/utils';

export default function AppLogoImage({
    className,
    type = 'default',
}: {
    className?: string;
    type?: 'default' | 'primary' | 'large';
}) {
    return (
        <img
            className={cn(
                'h-8 w-8 rounded-lg md:h-9 md:w-9 lg:h-12 lg:w-12',
                className,
            )}
            src={type === 'default' ? defaultLogo : primaryLogo}
        />
    );
}
