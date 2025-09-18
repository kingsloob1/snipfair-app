import { cn } from '@/lib/utils';
import { FolderPlus } from 'lucide-react';
import React, { useRef, useState } from 'react';

interface PortfolioUploadProps {
    value?: File | null;
    type?: 'file' | 'image';
    onChange: (file: File | null) => void;
    disabled?: boolean;
    error?: string;
    label: string;
    isRequired?: boolean;
    extra?: string;
    fullWidth?: boolean;
}

const SingleFileInput: React.FC<PortfolioUploadProps> = ({
    value = null,
    type = 'file',
    onChange,
    disabled = false,
    error,
    isRequired = false,
    label,
    extra,
    fullWidth,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const fileSettings = {
        image: {
            acceptMime: ['image/jpeg', 'image/png', 'image/gif'],
            acceptExt: '.jpg,.jpeg,.png,.gif',
            description: 'JPG, PNG, GIF (Max 5MB)',
        },
        file: {
            acceptMime: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            acceptExt: '.pdf,.doc,.docx',
            description: 'PDF, DOC, DOCX (Max 5MB)',
        },
    };

    const settings = fileSettings[type];

    const handleFile = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (settings.acceptMime.includes(file.type) && file.size <= maxSize) {
            onChange(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (!disabled) {
            handleFile(e.dataTransfer.files);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(e.target.files);
    };

    const removeFile = () => {
        onChange(null);
    };

    const openFileDialog = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div className="w-full">
            <div className="mb-2">
                <label
                    htmlFor={label}
                    className="font-inter text-sm text-sf-black-secondary"
                >
                    {label}
                    {isRequired && (
                        <span className="text-danger-normal">&nbsp;*</span>
                    )}
                    {extra && (
                        <span className="ml-3 text-xs text-sf-gray">
                            {extra}
                        </span>
                    )}
                </label>
            </div>

            {!value && (
                <div
                    className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                        dragActive
                            ? 'border-sf-gradient-purple bg-blue-50'
                            : 'border-sf-gradient-purple hover:border-sf-gradient-pink'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFileDialog}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={settings.acceptExt}
                        onChange={handleInputChange}
                        className="hidden"
                        disabled={disabled}
                    />

                    <div className="flex flex-col items-center">
                        <FolderPlus className="mb-2 h-8 w-8 text-sf-gray" />
                        <p className="mb-1 text-sm text-sf-gray">
                            Supports: {settings.description} or{' '}
                            <span className="text-sf-gradient-purple underline hover:no-underline">
                                Browse
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            {value && (
                <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                        Selected File
                    </h4>
                    <div
                        className={cn(
                            'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4',
                            fullWidth && '!grid-cols-6',
                        )}
                    >
                        <div className="group relative">
                            {type === 'image' ? (
                                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                    <img
                                        src={URL.createObjectURL(value)}
                                        alt={value.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 p-4 text-xs text-gray-600">
                                    {value.name}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile();
                                }}
                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                            <p className="mt-1 truncate text-xs text-gray-600">
                                {value.name}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleFileInput;
