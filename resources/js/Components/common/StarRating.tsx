import { cn } from '@/lib/utils';
import { StarIcon } from '../icon/Icons';

interface StarRatingProps {
    rating?: number;
    reviewCount?: number;
    showRating?: boolean;
    showCount?: boolean;
    ratingDate?: string;
    size?: 'small' | 'normal' | 'big';
}

const StarRating = ({
    rating = 4.5,
    reviewCount = 500,
    showRating = true,
    showCount = true,
    ratingDate = undefined,
    size = 'normal',
}: StarRatingProps) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-1">
                <div className="flex items-center space-x-0">
                    {[...Array(fullStars)].map((_, i) => (
                        <StarIcon
                            key={`full-${i}`}
                            filled={true}
                            size={
                                size === 'normal'
                                    ? 'w-4 h-4'
                                    : size === 'small'
                                      ? 'w-3 h-3'
                                      : 'w-5 h-5'
                            }
                        />
                    ))}
                    {hasHalfStar && (
                        <StarIcon
                            key="half"
                            half={true}
                            size={
                                size === 'normal'
                                    ? 'w-4 h-4'
                                    : size === 'small'
                                      ? 'w-3 h-3'
                                      : 'w-5 h-5'
                            }
                        />
                    )}
                    {[...Array(emptyStars)].map((_, i) => (
                        <StarIcon
                            key={`empty-${i}`}
                            filled={false}
                            size={
                                size === 'normal'
                                    ? 'w-4 h-4'
                                    : size === 'small'
                                      ? 'w-3 h-3'
                                      : 'w-5 h-5'
                            }
                        />
                    ))}
                </div>
                {showRating && (
                    <span
                        className={cn(
                            'ml-1 font-medium text-white',
                            size === 'normal'
                                ? 'text-sm'
                                : size === 'small'
                                  ? 'text-xs'
                                  : 'text-lg',
                        )}
                    >
                        {rating}
                    </span>
                )}
                {ratingDate && (
                    <span
                        className={cn(
                            'ml-1 font-inter text-sf-gray',
                            size === 'normal'
                                ? 'text-sm font-medium'
                                : size === 'small'
                                  ? 'text-xs'
                                  : 'text-lg',
                        )}
                    >
                        {ratingDate}
                    </span>
                )}
            </div>
            {reviewCount && showCount && (
                <span className="text-xs text-white opacity-80">
                    from {reviewCount}+ Reviews
                </span>
            )}
        </div>
    );
};

export default StarRating;
