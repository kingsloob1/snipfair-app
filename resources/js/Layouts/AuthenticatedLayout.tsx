import AuthNavbar from '@/Components/layout/AuthNavbar';
import { NavigationSteps } from '@/Components/magic/NavigationSteps';
import { cn } from '@/lib/utils';
import { NavRoute, PagePropsWithNotifiers } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PropsWithChildren } from 'react';

type ExploreRoute = {
    path: string;
    name: string;
};

export default function Authenticated({
    navigation,
    showToExplore,
    exploreRoute,
    fullScreen = false,
    children,
}: PropsWithChildren<{
    navigation?: NavRoute[];
    showToExplore?: boolean;
    exploreRoute?: ExploreRoute;
    fullScreen?: boolean;
}>) {
    const { auth, recentChats, recentNotifications } =
        usePage<PagePropsWithNotifiers>().props;

    return (
        <div
            className={cn(
                'bg-sf-white-neutral',
                fullScreen ? 'flex h-screen flex-col' : 'min-h-screen',
            )}
        >
            <AuthNavbar
                auth={auth}
                recentChats={recentChats}
                recentNotifications={recentNotifications}
            />
            {navigation && <NavigationSteps routes={navigation} />}
            {showToExplore && exploreRoute && (
                <nav className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-2 md:py-4 xl:py-6">
                    <Link
                        href={exploreRoute.path}
                        className="flex items-center gap-2 font-semibold text-gray-600 transition-all hover:gap-3 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {exploreRoute.name}
                    </Link>
                </nav>
            )}
            <main className={cn(fullScreen && 'flex flex-1 overflow-y-auto')}>
                {children}
            </main>
        </div>
    );
}
