/* eslint-disable no-unused-vars */
import ExperienceSelect from '@/Components/stylist/ExperienceSelect';
import { cn } from '@/lib/utils';
import { Eye, EyeClosed } from 'lucide-react';
import React, { ChangeEvent, FocusEvent, useEffect, useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type CustomInputProps = {
    placeholder?: string;
    Icon?: React.ElementType;
    showEyeIcon?: boolean;
    toggleEyeIcon?: (val: boolean) => void;
    showPassword?: boolean;
    onChange?: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    onPhoneChange?: (value: string) => void;
    error?: string;
    label?: string;
    inputType?:
        | 'text'
        | 'password'
        | 'email'
        | 'textarea'
        | 'custom-country'
        | 'custom-select';
    name?: string;
    isDisabled?: boolean;
    value?: string;
    className?: string;
    extra?: string | null;
    handleFocus?: (
        event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    isUpdate?: boolean;
    isRequired?: boolean;
    selectOptions?: {
        label: string;
        value: string;
    }[];
    totalWords?: number;
    isReadOnly?: boolean;
};

const CustomInput = ({
    placeholder = '',
    Icon,
    showEyeIcon = false,
    toggleEyeIcon,
    showPassword = false,
    onChange,
    onPhoneChange,
    error = '',
    label = '',
    inputType = 'text',
    name = '',
    isDisabled = false,
    value = '',
    className = '',
    extra = null,
    handleFocus,
    isUpdate = false,
    isRequired = false,
    selectOptions = [],
    totalWords = 20,
    isReadOnly = false,
}: CustomInputProps) => {
    const [inputValue, setInputValue] = useState<string | undefined>(
        value || '',
    );
    const [wordCount, setWordCount] = useState<number>(0);

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        if (inputValue && inputType === 'textarea') {
            const words = inputValue.trim().split(/\s+/).filter(Boolean);
            setWordCount(words.length);
        }
    }, [inputValue, inputType]);

    const handleChange = (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setInputValue(event.target.value);
        if (onChange) onChange(event);
    };

    const handlePhoneChange = (value?: string) => {
        setInputValue(value);
        if (value) {
            if (onPhoneChange) onPhoneChange(value);
        }
    };

    return (
        <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full justify-between">
                <label
                    htmlFor={label}
                    className={cn(
                        'font-inter text-sm',
                        isUpdate ? 'text-sf-black' : 'text-sf-black-secondary',
                    )}
                >
                    {label}
                    {isRequired && (
                        <span className="text-danger-normal">&nbsp;*</span>
                    )}
                </label>
            </div>

            <div
                className={cn(
                    'disable-element-input group relative flex h-auto w-full flex-col items-center gap-3 rounded-xl border px-2 py-1.5 font-inter duration-100 focus-within:border-sf-primary focus-within:shadow-md active:border-sf-primary',
                    error
                        ? 'border-danger-normal text-danger-normal'
                        : 'border-sf-stroke text-sf-primary-paragraph',
                    isDisabled && 'cursor-not-allowed opacity-50',
                )}
            >
                {Icon && <Icon className="text-sf-stroke" />}

                {inputType === 'custom-country' ? (
                    <PhoneInput
                        placeholder={placeholder}
                        // international
                        name={name}
                        disabled={isDisabled}
                        readOnly={isReadOnly}
                        value={inputValue}
                        defaultCountry="ZA"
                        onFocus={handleFocus}
                        onChange={handlePhoneChange}
                        className={cn(
                            'w-full flex-1 border-none text-base placeholder:text-sf-gray focus:border-none focus:outline-none focus:ring-0 disabled:bg-transparent',
                            className,
                        )}
                    />
                ) : inputType === 'custom-select' ? (
                    <ExperienceSelect
                        placeholder={placeholder}
                        disabled={isDisabled}
                        value={inputValue}
                        options={selectOptions}
                        isReadOnly={isReadOnly}
                        // onFocus={handleFocus}
                        onChange={handlePhoneChange}
                        className={cn(
                            'w-full flex-1 border-none text-base placeholder:text-sf-gray focus:border-none focus:outline-none focus:ring-0 disabled:bg-transparent',
                            className,
                        )}
                    />
                ) : inputType === 'textarea' ? (
                    <textarea
                        name={name}
                        value={inputValue}
                        placeholder={placeholder}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        className={cn(
                            'w-full flex-1 border-none text-base outline-none placeholder:text-sf-gray focus:border-none focus:outline-none focus:ring-0 disabled:bg-transparent',
                            className,
                            showEyeIcon && toggleEyeIcon && 'pr-20',
                        )}
                    />
                ) : (
                    <input
                        disabled={isDisabled}
                        name={name}
                        type={showPassword ? 'text' : inputType}
                        value={inputValue}
                        placeholder={placeholder}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        readOnly={isReadOnly}
                        className={cn(
                            'w-full flex-1 border-none text-base placeholder:text-sf-gray focus:border-none focus:outline-none focus:ring-0 disabled:bg-transparent',
                            className,
                        )}
                    />
                )}

                {showEyeIcon && toggleEyeIcon && (
                    <button
                        type="button"
                        className={cn(
                            'absolute right-2 top-1/2 -translate-y-1/2 p-1',
                            isUpdate
                                ? 'text-sf-black'
                                : 'text-sf-stroke group-focus-within:text-sf-gray',
                        )}
                        onClick={() => toggleEyeIcon(!showPassword)}
                    >
                        {showPassword ? (
                            <div className="flex items-center gap-1">
                                <EyeClosed size={20} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Eye size={20} />
                            </div>
                        )}
                    </button>
                )}

                {inputType === 'textarea' && (
                    <div className="flex w-full flex-row justify-end text-xs text-sf-gray">
                        <p>
                            {wordCount}/{totalWords} words
                        </p>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-danger-normal">{error}</p>}

            {!error && extra && (
                <div className="flex w-full flex-row text-xs text-sf-gray">
                    <p>{extra}</p>
                </div>
            )}
        </div>
    );
};

export default CustomInput;
