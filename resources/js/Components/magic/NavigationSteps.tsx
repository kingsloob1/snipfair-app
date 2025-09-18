import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import React, { Fragment } from 'react';
export interface Route {
    name: string;
    path: string;
    active?: boolean;
}
interface NavigationProps {
    routes: Route[];
    'data-id'?: string;
}
export const NavigationSteps: React.FC<NavigationProps> = ({
    routes,
    'data-id': dataId,
}) => {
    return (
        <nav
            className="mx-auto flex max-w-7xl items-center gap-2 px-5 py-6 md:py-8"
            data-id={dataId}
        >
            {routes.map((route, index) => {
                const isLast = index === routes.length - 1;
                return (
                    <Fragment key={route.path}>
                        {!isLast ? (
                            route.active ? (
                                <>
                                    <Link
                                        href={route.path}
                                        className="text-gray-600 transition-colors hover:text-gray-900"
                                    >
                                        {route.name}
                                    </Link>
                                    <ChevronRight className="h-4 w-4 text-gray-400" />
                                </>
                            ) : (
                                <>
                                    <span className="cursor-default text-gray-600 transition-colors hover:text-gray-900">
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
        </nav>
    );
};
