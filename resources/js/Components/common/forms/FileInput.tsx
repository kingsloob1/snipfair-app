/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { cn } from '@/lib/utils';
import { FolderPlus } from 'lucide-react';
import mime from 'mime/lite';
import React, { useRef, useState } from 'react';

interface CustomFileSetting {
    acceptMime: string[];
    acceptExt: string;
    description: string;
}

interface PortfolioUploadProps {
    value?: File[];
    type?: 'file' | 'image' | 'document_or_image' | 'custom';
    onChange: (files: File[]) => void;
    maxFiles?: number;
    disabled?: boolean;
    error?: string;
    label: string;
    isRequired?: boolean;
    extra?: string;
    fullWidth?: boolean;
    disableInput?: boolean;
    customFileSetting?: CustomFileSetting;
}

const FileInput: React.FC<PortfolioUploadProps> = ({
    value = [],
    type = 'file',
    onChange,
    maxFiles = 10,
    disabled = false,
    error,
    isRequired = false,
    label,
    extra,
    fullWidth,
    disableInput = false,
    customFileSetting = {
        acceptMime: ['*'],
        acceptExt: '*',
        description: 'Any file (Max 5MB each)',
    } as CustomFileSetting,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const fileSettings: Record<
        NonNullable<PortfolioUploadProps['type']>,
        CustomFileSetting
    > = {
        image: {
            acceptMime: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/jpg',
            ],
            acceptExt: '.jpg,.jpeg,.png,.gif,.webp',
            description: 'JPG, PNG, GIF (Max 5MB each)',
        },
        file: {
            acceptMime: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            acceptExt: '.pdf,.doc,.docx',
            description: 'PDF, DOC, DOCX (Max 5MB each)',
        },
        document_or_image: {
            acceptMime: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/jpg',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            acceptExt: '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx',
            description: 'JPG, PNG, GIF, PDF, DOC, DOCX (Max 5MB each)',
        },
        custom: customFileSetting,
    };

    const settings = fileSettings[type];

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const maxSize = 5 * 1024 * 1024; // 5MB
        const validFiles: File[] = [];

        Array.from(files).forEach((file) => {
            if (
                settings.acceptMime.includes(file.type) &&
                file.size <= maxSize
            ) {
                validFiles.push(file);
            }
        });

        const newFiles = [...value, ...validFiles].slice(0, maxFiles);
        onChange(newFiles);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (!disabled) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const removeFile = (index: number) => {
        const newFiles = value.filter((_, i) => i !== index);
        onChange(newFiles);
    };

    const openFileDialog = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const isFileImage = (file: File) => {
        return mime.getType(file.name)?.startsWith('image/');
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

            <div
                className={cn(
                    'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                    dragActive
                        ? 'border-sf-gradient-purple bg-blue-50'
                        : 'border-sf-gradient-purple hover:border-sf-gradient-pink',
                    disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer',
                    disableInput && '!hidden',
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
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
                    {value.length > 0 && (
                        <p className="text-xs text-gray-500">
                            {value.length} file{value.length !== 1 ? 's' : ''}{' '}
                            selected
                        </p>
                    )}
                </div>
            </div>

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            {value.length > 0 && (
                <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium text-gray-900">
                        Selected Files ({value.length}/{maxFiles})
                    </h4>
                    <div
                        className={cn(
                            'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4',
                            fullWidth && '!grid-cols-6',
                        )}
                    >
                        {value.map((file, index) => (
                            <div key={index} className="group relative">
                                {(type === 'image' || isFileImage(file)) && (
                                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                        {type === 'image' ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-600">
                                                {file.name}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
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
                                    {file.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileInput;
