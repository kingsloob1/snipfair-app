import { PropsWithChildren } from 'react';

interface TextStrokeProps {
    strokeWidth?: string;
    strokeColor?: string;
    textColor?: string;
    className?: string;
    type?: 'normal' | 'thick';
}

const TextStroke = ({
    children,
    strokeWidth,
    strokeColor,
    textColor,
    className,
    type = 'normal',
}: PropsWithChildren<TextStrokeProps>) => {
    const textStyle = {
        color: textColor,
        ...(strokeWidth &&
            strokeColor && {
                WebkitTextStrokeWidth: strokeWidth,
                WebkitTextStrokeColor: strokeColor,
            }),
    };

    if (type === 'thick') {
        return (
            <span className="relative inline-block">
                <span
                    style={{
                        color: 'transparent',
                        ...(strokeWidth &&
                            strokeColor && {
                                WebkitTextStrokeWidth: strokeWidth,
                                WebkitTextStrokeColor: strokeColor,
                            }),
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                    className={`font-inter ${className || ''}`}
                    aria-hidden="true"
                >
                    {children}
                </span>
                <span
                    style={{
                        color: textColor,
                        position: 'relative',
                        zIndex: 2,
                    }}
                    className={`font-inter ${className || ''}`}
                >
                    {children}
                </span>
            </span>
        );
    } else {
        return (
            <span style={textStyle} className={`font-inter ${className || ''}`}>
                {children}
            </span>
        );
    }
};

export default TextStroke;
