import React, { useState } from 'react';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
}

export default function FallbackImage({
    fallback = '/images/snipfair_base.jpg',
    ...props
}: FallbackImageProps) {
    const [src, setSrc] = useState(props.src);

    return <img {...props} src={src} onError={() => setSrc(fallback)} />;
}
