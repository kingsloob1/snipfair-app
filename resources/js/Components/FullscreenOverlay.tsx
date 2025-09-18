import { useFullscreenOverlay } from '@/lib/useFullscreenOverlay';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const FullscreenOverlay = () => {
    const [isMaximize, setIsMaximize] = useState(false);
    const { imageUrl, isOpen, close } = useFullscreenOverlay();
    useEffect(() => {
        if (imageUrl) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [imageUrl]);

    useEffect(() => {
        setIsMaximize(false);
    }, [isOpen]);

    const imgRef = useRef<HTMLImageElement>(null);

    const applyStyles = () => {
        const img = imgRef.current;
        if (!img) return;

        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const viewportRatio = window.innerWidth / window.innerHeight;

        if (aspectRatio > viewportRatio) {
            img.style.height = isMaximize ? '96vh' : '50vh';
            img.style.width = 'auto';
            img.style.minHeight = isMaximize ? '96vh' : '50vh';
            img.style.minWidth = 'unset';
            img.style.maxWidth = 'none';
        } else {
            img.style.width = isMaximize ? '96vw' : '50vw';
            img.style.height = 'auto';
            img.style.minWidth = isMaximize ? '96vw' : '50vw';
            img.style.minHeight = 'unset';
            img.style.maxHeight = 'none';
        }
    };

    useEffect(applyStyles, [isMaximize]);

    return (
        <AnimatePresence>
            {isOpen && imageUrl && (
                <motion.div
                    className={`slim-scrollbar fixed inset-0 z-[52] flex overflow-auto bg-black bg-opacity-90 ${
                        isMaximize
                            ? 'items-start justify-start'
                            : 'items-center justify-center'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.button
                        className="fixed right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl font-bold text-gray-800"
                        onClick={close}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        &times;
                    </motion.button>

                    <img
                        src={imageUrl}
                        alt="Fullscreen"
                        onClick={() => setIsMaximize(!isMaximize)}
                        className="no-scrollbar block"
                        style={{
                            minHeight: isMaximize ? '96vh' : '50vh',
                            paddingTop: isMaximize ? '20px' : 0,
                            paddingLeft: isMaximize ? '20px' : 0,
                            width: 'auto',
                            height: 'auto',
                            maxWidth: 'none',
                            cursor: isMaximize ? 'zoom-out' : 'zoom-in',
                        }}
                        ref={imgRef}
                        onLoad={applyStyles}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullscreenOverlay;
