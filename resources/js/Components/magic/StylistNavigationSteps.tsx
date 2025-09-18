import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment, PropsWithChildren } from 'react';
import CustomButton from '../common/CustomButton';
export interface Route {
    name: string;
    path: string;
    active?: boolean;
}
interface NavigationProps {
    routes: Route[];
    sub?: string;
    cta?: string;
    ctaAction?: () => void;
}
export const StylistNavigationSteps = ({
    routes,
    sub,
    cta,
    ctaAction,
    children,
}: PropsWithChildren<NavigationProps>) => {
    return (
        <nav className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-6 md:flex-row md:py-8">
            <div className="w-full md:w-auto">
                <div className="flex items-center gap-2 text-lg font-medium md:text-xl">
                    {routes.map((route, index) => {
                        const isLast = index === routes.length - 1;
                        return (
                            <Fragment key={route.path}>
                                {!isLast ? (
                                    route.active ? (
                                        <>
                                            <Link
                                                href={route.path}
                                                className="text-sf-black transition-colors hover:text-gray-900"
                                            >
                                                {route.name}
                                            </Link>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </>
                                    ) : (
                                        <>
                                            <span className="cursor-default text-sf-black transition-colors hover:text-gray-900">
                                                {route.name}
                                            </span>
                                            <ChevronRight className="h-4 w-4 text-gray-400" />
                                        </>
                                    )
                                ) : (
                                    <span className="cursor-default font-medium text-sf-gradient-purple">
                                        {route.name}
                                    </span>
                                )}
                            </Fragment>
                        );
                    })}
                </div>
                {sub && (
                    <p className="font-inter text-sm font-normal text-sf-primary-paragraph">
                        {sub}
                    </p>
                )}
            </div>
            {cta && (
                <div>
                    <CustomButton onClick={ctaAction} fullWidth={false}>
                        {cta}
                    </CustomButton>
                </div>
            )}
            {children}
        </nav>
    );
};
