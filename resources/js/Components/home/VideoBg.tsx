import { useEffect, useRef, useState } from 'react';

const VideoBg = () => {
    const [isPosterLoaded, setIsPosterLoaded] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const posterRef = useRef<HTMLImageElement>(null);

    // Handle poster image load
    useEffect(() => {
        const img = new Image();
        img.src = '/images/hero-bg.png';
        img.onload = () => {
            setIsPosterLoaded(true);
        };
    }, []);

    // Handle video load
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleCanPlay = () => {
                setIsVideoLoaded(true);
            };
            video.addEventListener('canplay', handleCanPlay);
            return () => {
                video.removeEventListener('canplay', handleCanPlay);
            };
        }
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Purple/black gradient: shown until poster is loaded */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-purple-900 to-black transition-opacity duration-300 ${
                    isPosterLoaded ? 'opacity-0' : 'opacity-100'
                }`}
            />
            {/* Poster image: shown after loading, until video is ready */}
            <img
                ref={posterRef}
                src="/images/hero-bg.png"
                alt="Background poster"
                className={`absolute left-1/2 top-1/2 h-auto min-h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-300 ${
                    isPosterLoaded && !isVideoLoaded
                        ? 'opacity-100'
                        : 'opacity-0'
                }`}
            />
            {/* Video: shown only when fully loaded */}
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className={`absolute left-1/2 top-1/2 h-auto min-h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 object-cover transition-opacity duration-300 ${
                    isVideoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <source src="/videos/horizontal.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay: shown when video is loaded */}
            <div
                className={`pointer-events-none absolute inset-0 bg-black opacity-20 transition-opacity duration-300 ${
                    isVideoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
            {/* Bottom gradient: shown when video is loaded */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black to-transparent transition-opacity duration-300 ${
                    isVideoLoaded ? 'opacity-100' : 'opacity-100'
                }`}
            />
        </div>
    );
};

export default VideoBg;
