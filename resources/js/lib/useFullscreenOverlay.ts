import { fullscreenOverlay } from '@/lib/fullscreen-overlay';
import { useEffect, useState } from 'react';

export const useFullscreenOverlay = () => {
    const [state, setState] = useState(fullscreenOverlay.getState());

    useEffect(() => {
        const unsubscribe = fullscreenOverlay.subscribe(() => {
            setState(fullscreenOverlay.getState());
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return {
        ...state,
        open: fullscreenOverlay.open.bind(fullscreenOverlay),
        close: fullscreenOverlay.close.bind(fullscreenOverlay),
    };
};
