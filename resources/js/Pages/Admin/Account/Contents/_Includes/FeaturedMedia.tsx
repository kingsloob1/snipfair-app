import CustomButton from '@/Components/common/CustomButton';
import FileInput from '@/Components/common/forms/FileInput';
import Modal from '@/Components/Modal';
import { mergeInertiaFieldErrors } from '@/lib/helper';
import { router, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';

type WorkFormProps = {
    media: File[];
};

export default function FeaturedMedia({
    featured_media,
}: {
    featured_media: string[];
}) {
    const existingMedia = featured_media;
    const [deleting, setDeleting] = useState<string | null>(null);
    const { data, setData, post, reset, errors, processing } =
        useForm<WorkFormProps>({
            media: [],
        });

    const mergedErrors = mergeInertiaFieldErrors(errors, 'media');

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.media.length === 0) return;

        post(route('admin.contents.media.upload'), {
            onSuccess: () => {
                reset('media');
                router.reload({ only: ['featured_media'] });
            },
        });
    };

    const confirmDelete = (path: string) => {
        setDeleting(path);
    };

    const handleDelete = () => {
        if (!deleting) return;

        router.delete(route('admin.contents.media.delete'), {
            data: { path: deleting },
            onSuccess: () => {
                setDeleting(null);
                router.reload({ only: ['featured_media'] });
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Featured Media Management
                </h2>
                <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
                    Total Media: {featured_media.length}
                </div>
            </div>
            <form className="p-4 shadow-sm md:p-6" onSubmit={handleUpload}>
                {existingMedia.length > 0 && (
                    <div className="group relative w-full rounded-lg">
                        <img
                            src={`/storage/${existingMedia[0]}`}
                            className="w-full rounded-lg object-cover"
                            alt={`media-1`}
                        />
                        <button
                            onClick={() => confirmDelete(existingMedia[0])}
                            type="button"
                            className="absolute right-1 top-1 hidden rounded-full border border-sf-white bg-red-500 p-1.5 text-white group-hover:block"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-2">
                    {existingMedia.slice(1).map((url, idx) => (
                        <div
                            key={idx}
                            className="group relative w-full rounded-lg"
                        >
                            <img
                                src={`/storage/${url}`}
                                className="h-full w-full rounded-lg object-cover"
                                alt={`media-${idx}`}
                            />
                            <button
                                onClick={() => confirmDelete(url)}
                                type="button"
                                className="absolute right-1 top-1 hidden rounded-full border border-sf-white bg-red-500 p-1.5 text-white group-hover:block"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <FileInput
                        value={data.media}
                        onChange={(files) => setData('media', files)}
                        type="image"
                        maxFiles={6 - featured_media.length}
                        disabled={processing}
                        disableInput={
                            featured_media.length + data.media.length >= 6
                        }
                        error={mergedErrors[0] ?? ''}
                        isRequired={true}
                        label="Upload media"
                        extra="(Up to 6 files)"
                    />
                </div>
                <CustomButton
                    type="submit"
                    disabled={processing || !data.media.length}
                    fullWidth={false}
                    className="mx-auto mb-6 mt-4"
                >
                    Update Images
                </CustomButton>
            </form>
            <Modal
                maxWidth="sm"
                show={!!deleting}
                onClose={() => setDeleting(null)}
            >
                <div className="mx-auto max-w-80 p-5 text-center">
                    <p>Are you sure you want to delete this file?</p>
                    <CustomButton
                        className="mt-6 bg-danger-normal text-sf-white"
                        onClick={handleDelete}
                    >
                        Yes, Proceed
                    </CustomButton>
                </div>
            </Modal>
        </div>
    );
}
