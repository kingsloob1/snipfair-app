import {
    forwardRef,
    SelectHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

interface Option {
    label: string;
    value: string | number;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
    isFocused?: boolean;
    options: Option[];
}

export default forwardRef(function SelectInput(
    { className = '', isFocused = false, options, ...props }: SelectInputProps,
    ref,
) {
    const localRef = useRef<HTMLSelectElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <select
            {...props}
            ref={localRef}
            className={
                'rounded-md border-sf-stroke bg-sf-primary-background shadow-sm focus:border-sf-primary focus:ring-sf-primary ' +
                className
            }
        >
            <option value="">Select option</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
});
