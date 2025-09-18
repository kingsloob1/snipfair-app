import axios from 'axios';
import { useState } from 'react';

interface LikeResponse {
    success: boolean;
    is_liked: boolean;
    likes_count: number;
    message: string;
}

export const useLike = () => {
    const [isLoading, setIsLoading] = useState(false);

    const toggleLike = async (
        type: 'profile' | 'portfolio' | 'tutorial',
        typeId: number,
    ): Promise<LikeResponse | null> => {
        setIsLoading(true);

        try {
            const response = await axios.post(route('like.toggle'), {
                type,
                type_id: typeId,
            });

            return response.data as LikeResponse;
        } catch (error) {
            console.error('Error toggling like:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        toggleLike,
        isLoading,
    };
};
