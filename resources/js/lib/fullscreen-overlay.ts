interface FullscreenOverlayState {
    imageUrl: string | null;
    isOpen: boolean;
}

class FullscreenOverlayManager {
    private state: FullscreenOverlayState = {
        imageUrl: null,
        isOpen: false,
    };

    private listeners: Set<() => void> = new Set();

    // Subscribe to state changes
    subscribe(callback: () => void) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // Notify all listeners
    private notify() {
        this.listeners.forEach((callback) => callback());
    }

    // Open overlay with image
    open(imageUrl: string) {
        this.state = {
            imageUrl,
            isOpen: true,
        };
        this.notify();
    }

    // Close overlay
    close() {
        this.state = {
            imageUrl: null,
            isOpen: false,
        };
        this.notify();
    }

    // Get current state
    getState(): FullscreenOverlayState {
        return { ...this.state };
    }
}

// Create global instance
export const fullscreenOverlay = new FullscreenOverlayManager();
