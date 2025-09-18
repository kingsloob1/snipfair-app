import { openFullscreenOverlay } from '@/lib/helper';
import { motion } from 'motion/react';
import React, { useState } from 'react';

interface MediaCardProps {
    imageUrl: string;
    altText: string;
}

const MediaCard: React.FC<MediaCardProps> = ({ imageUrl, altText }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <motion.div
            className="relative h-48 w-full overflow-hidden rounded-lg bg-gray-200"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
            {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            )}
            <img
                src={imageUrl}
                alt={altText}
                className={`h-full w-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
                onClick={() =>
                    imageLoaded ? openFullscreenOverlay(imageUrl) : undefined
                }
            />
        </motion.div>
    );
};

export default MediaCard;
