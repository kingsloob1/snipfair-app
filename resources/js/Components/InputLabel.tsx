import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    isRequired = false,
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & {
    value?: string;
    isRequired?: boolean;
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-sf-black-secondary ` + className
            }
        >
            {value ? value : children}
            {isRequired && <span className="ml-1 text-danger-normal">*</span>}
        </label>
    );
}
