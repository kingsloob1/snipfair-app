import imageSrc from '@/assets/images/auth-bg.jpg';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { PropsWithChildren, useEffect, useState } from 'react';
import TextRatingComponent from './TextRatingComponent';

interface AuthLayoutProps {
    className?: string;
}

export default function AdminAuthLayout({
    className = 'w-full max-w-md',
    children,
}: PropsWithChildren<AuthLayoutProps>) {
    const [showForm, setShowForm] = useState(false);

    // Only for small screens: show image first, then reveal form after delay
    useEffect(() => {
        const time = window.innerWidth < 768 ? 1500 : 500;
        const timer = setTimeout(() => {
            setShowForm(true);
        }, time);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative top-0 flex min-h-screen flex-col md:flex-row">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className={cn(
                    'relative h-[100vh] w-full md:h-auto md:w-[45%]',
                    !showForm ? 'z-10' : 'lg:z-0',
                )}
            >
                <img
                    src={imageSrc}
                    alt="Visual"
                    className="h-full w-full object-cover"
                />
                <div
                    className={cn(
                        'absolute bottom-0 flex w-full flex-col bg-[linear-gradient(358deg,var(--tw-gradient-stops))] p-4 pt-10 md:p-6 lg:p-8 xl:p-10',
                        'from-sf-primary via-sf-primary-hover/40 to-sf-primary-light/0',
                    )}
                >
                    <div className="flex justify-start pb-7">
                        <img
                            src="/images/icons/StarFourOrange.svg"
                            alt="Visual"
                            className="h-16 w-16"
                        />
                    </div>
                    <TextRatingComponent
                        title="Snipfair"
                        description="Administrator Account"
                        rating={4.5}
                        reviewCount={500}
                        avatars={[]}
                    />
                    <div className="flex justify-end">
                        <img
                            src="/images/icons/StarFour.svg"
                            alt="Visual"
                            className="h-16 w-16"
                        />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showForm ? 1 : 0 }}
                transition={{ duration: 0.8 }}
                className={cn(
                    'absolute left-0 top-0 flex min-h-full w-full items-center justify-center bg-white px-0 py-0 sm:px-2 sm:py-5 md:w-[55%] md:px-6 md:py-14',
                    'md:static md:h-auto',
                    showForm ? 'z-20' : 'z-0',
                )}
            >
                <div className={cn('rounded-3xl shadow-sf-custom', className)}>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
