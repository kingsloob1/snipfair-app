import { AnimatePresence, motion } from 'motion/react';
import { PropsWithChildren } from 'react';

interface OverlayProps {
    isOpen: boolean;
    onClose: () => void;
    canClose: boolean;
}

const OverlayComponent = ({
    children,
    isOpen,
    onClose,
    canClose,
}: PropsWithChildren<OverlayProps>) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={canClose ? onClose : undefined}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                        }}
                        className="relative mx-4 w-full max-w-md rounded-2xl bg-sf-white shadow-2xl"
                        onClick={(e) =>
                            canClose ? e.stopPropagation() : undefined
                        }
                    >
                        {canClose && (
                            <button
                                onClick={onClose}
                                className="fixed right-5 top-5 flex h-8 w-8 items-center justify-center rounded-md shadow-lg transition-colors hover:bg-sf-gray"
                            >
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    className="h-6 w-6 text-sf-white"
                                >
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        <div className="p-10">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OverlayComponent;
