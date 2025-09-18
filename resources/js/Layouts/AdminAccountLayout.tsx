import Navbar from '@/Components/admin/Navbar';
import { cn } from '@/lib/utils';
import { Head, usePage } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';
interface LayoutProps {
    fullScreen?: boolean;
    header?: string;
}
type Item = {
    type: 'reminder' | 'setting' | 'info' | 'chat';
    title: string;
    description: string;
    timestamp: string;
    isUnread?: boolean;
    image?: string;
};
type PageProps = {
    auth: {
        name: string;
        role: string;
    };
    recentChats?: Item[];
    recentNotifications?: Item[];
};

export const AdminAccountLayout = ({
    children,
    fullScreen = false,
    header,
}: PropsWithChildren<LayoutProps>) => {
    const { auth, recentNotifications, recentChats } =
        usePage<PageProps>().props;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    return (
        <div
            className={cn(
                'relative bg-sf-white-neutral',
                fullScreen ? 'flex h-screen flex-col' : 'min-h-screen',
            )}
        >
            <Head title={header ?? 'Stylist'} />
            <Navbar
                auth={auth}
                recentNotifications={recentNotifications}
                recentChats={recentChats}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />
            {/* Main Content */}
            <main
                className={cn(
                    'py-16 transition-all duration-300',
                    isSidebarOpen ? 'lg:ml-[240px]' : 'lg:ml-[80px]',
                    fullScreen && 'flex flex-1 overflow-y-auto',
                )}
            >
                {children}
            </main>
            <footer
                className={cn(
                    'absolute bottom-0 z-50 hidden w-full overflow-hidden transition-all duration-300 lg:block',
                    isSidebarOpen ? 'lg:pl-[239px]' : 'lg:pl-[79px]',
                )}
            >
                <div className="w-full border-t border-sf-stroke bg-sf-white px-5 py-2.5 text-center font-inter text-sm text-sf-primary-paragraph">
                    © {new Date().getFullYear()} By Snipfair.com
                </div>
            </footer>
        </div>
    );
};
