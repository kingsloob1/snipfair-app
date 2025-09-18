import {
    ClipboardEvent,
    KeyboardEvent,
    useEffect,
    useRef,
    useState,
} from 'react';

interface OtpInputProps {
    length?: number;
    value?: string;
    onChange: (otp: string) => void;
    disabled?: boolean;
    className?: string;
}

export default function OtpInput({
    length = 6,
    value = '',
    onChange,
    disabled = false,
    className = '',
}: OtpInputProps) {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (value.length === length) {
            setOtp(value.split(''));
        }
    }, [value, length]);

    const handleChange = (index: number, digit: string) => {
        if (disabled) return;

        if (digit.length > 1) {
            digit = digit.slice(0, 1);
        }

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        onChange(newOtp.join(''));

        // Move to next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        event: KeyboardEvent<HTMLInputElement>,
    ) => {
        if (disabled) return;

        const isNumberKey = event.key >= '0' && event.key <= '9';
        const isBackspace = event.key === 'Backspace';
        const isPaste = (event.ctrlKey || event.metaKey) && event.key === 'v';

        if (!isNumberKey && !isBackspace && !isPaste) {
            event.preventDefault();
            return;
        }

        if (isBackspace && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        event.preventDefault();

        const pastedData = event.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, length);
        const pastedOtp = pastedData.slice(0, length).split('');

        const newOtp = [...otp];
        pastedOtp.forEach((digit, index) => {
            if (index < length && /^\d$/.test(digit)) {
                newOtp[index] = digit;
            }
        });

        setOtp(newOtp);
        onChange(newOtp.join(''));

        // Focus last filled input or next empty one
        const lastFilledIndex = newOtp.findIndex((digit) => digit === '');
        const focusIndex =
            lastFilledIndex === -1
                ? length - 1
                : Math.max(0, lastFilledIndex - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className={`flex space-x-2 ${className}`}>
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="h-12 w-12 rounded-md border border-gray-300 text-center text-lg font-semibold focus:border-sf-primary focus:outline-none focus:ring-1 focus:ring-sf-primary disabled:cursor-not-allowed disabled:bg-gray-100"
                    autoComplete="off"
                />
            ))}
        </div>
    );
}
