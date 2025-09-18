import { StarIcon } from '@/Components/icon/Icons';
import { motion } from 'motion/react';

interface AvatarProps {
    imageUrl?: string;
    name?: string;
    color?: string;
    showCount?: boolean;
    count?: number;
}

const Avatar = ({
    imageUrl,
    name,
    color,
    showCount = false,
    count = 0,
}: AvatarProps) => {
    if (showCount) {
        return (
            <div className="relative">
                <div
                    className="-ml-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-medium"
                    style={{ backgroundColor: '#f0f4ff' }}
                >
                    <span style={{ color: '#7c3aed' }}>+{count}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <div
                className="-ml-3 h-8 w-8 overflow-hidden rounded-full border-2 border-white"
                style={{
                    backgroundColor: color,
                }}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-medium text-white">
                        {name?.charAt(0)?.toUpperCase()}
                    </div>
                )}
            </div>
        </div>
    );
};

type Avatar = {
    name?: string;
    imageUrl?: string;
    color?: string;
};

const AvatarGroup = ({
    avatars,
    maxDisplay = 5,
}: {
    avatars: Avatar[];
    maxDisplay: number;
}) => {
    const displayAvatars = avatars.slice(0, maxDisplay);
    const remainingCount = avatars.length - maxDisplay;

    return (
        <div className="flex items-center">
            {displayAvatars.map((avatar, index) => (
                <Avatar
                    key={index}
                    imageUrl={avatar.imageUrl}
                    name={avatar.name}
                    color={avatar.color}
                />
            ))}
            {remainingCount > 0 && (
                <Avatar showCount={true} count={remainingCount} />
            )}
        </div>
    );
};

const RatingDisplay = ({ rating = 4.5, reviewCount = 500 }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-0">
                    {[...Array(fullStars)].map((_, i) => (
                        <StarIcon key={`full-${i}`} filled={true} />
                    ))}
                    {hasHalfStar && <StarIcon key="half" half={true} />}
                    {[...Array(emptyStars)].map((_, i) => (
                        <StarIcon key={`empty-${i}`} filled={false} />
                    ))}
                </div>
                <span className="ml-1 text-sm font-medium text-white">
                    {rating}
                </span>
            </div>
            <span className="text-xs text-white opacity-80">
                from {reviewCount}+ Reviews
            </span>
        </div>
    );
};

interface TextRatingComponentProps {
    title?: string;
    description?: string;
    rating?: number;
    reviewCount?: number;
    avatars?: AvatarProps[];
}

const TextRatingComponent = ({
    title = 'Your Next Favorite Stylist Is Just a Click Away',
    description = "Discover a new era of grooming and beauty where convenience meets excellence. With Snipfair, you're always connected to skilled, verified professionals ready to style you wherever you are.",
    rating = 4.5,
    reviewCount = 500,
    avatars = [],
}: TextRatingComponentProps) => {
    // Default avatars with different colors if none provided
    const showElement = false;
    const defaultAvatars =
        avatars.length > 0
            ? avatars
            : [
                  { name: 'User 1', color: '#c7b3d9' },
                  { name: 'User 2', color: '#aa9b75' },
                  { name: 'User 3', color: '#d4b5ad' },
                  { name: 'User 4', color: '#bea887' },
                  { name: 'User 5', color: '#a2a8cd' },
                  { name: 'User 6', color: '#d1baa9' },
                  { name: 'User 7', color: '#d1dfc3' },
                  { name: 'User 8', color: '#cfc3a7' },
                  { name: 'User 9', color: '#d2c7ac' },
                  { name: 'User 10', color: '#dac0dd' },
                  { name: 'User 11', color: '#f9f6ff' },
                  { name: 'User 12', color: '#d0c3a7' },
              ];

    return (
        <motion.div
            className="flex w-full max-w-2xl flex-col space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Text Content Section */}
            <div className="flex flex-col space-y-3">
                <motion.h2
                    className="font-inter text-4xl font-bold leading-tight text-sf-white md:text-5xl xl:text-6xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {title}
                </motion.h2>
                <motion.p
                    className="text-lg leading-relaxed text-sf-primary-background"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {description}
                </motion.p>
            </div>

            {/* Review Section */}
            {showElement && (
                <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    {/* Avatar Group */}
                    <div className="flex items-center pl-3">
                        <AvatarGroup avatars={defaultAvatars} maxDisplay={5} />
                    </div>

                    {/* Rating Display */}
                    <RatingDisplay rating={rating} reviewCount={reviewCount} />
                </motion.div>
            )}
        </motion.div>
    );
};

// Export for use in other components
export default TextRatingComponent;
