/* eslint-disable no-unused-vars */
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '../ui/select';

export default function ExperienceSelect({
    value,
    onChange,
    disabled,
    placeholder = '',
    isRequired,
    options,
    className,
    isReadOnly = false,
}: {
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    isRequired?: boolean;
    className?: string;
    options?: {
        label: string;
        value: string;
    }[];
    isReadOnly?: boolean;
}) {
    // min: number;
    // max: number;
    // const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    return (
        <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled || isReadOnly}
            required={isRequired}
        >
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>{placeholder}</SelectLabel>
                    {options &&
                        options.map((option, i) => (
                            <SelectItem key={i} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
