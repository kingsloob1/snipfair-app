import CustomButton from '@/Components/common/CustomButton';
import FileInput from '@/Components/common/forms/FileInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import Modal from '@/Components/Modal';
import SelectInput from '@/Components/SelectInput';
import TextareaInput from '@/Components/TextareaInput';
import TextInput from '@/Components/TextInput';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { mergeInertiaFieldErrors } from '@/lib/helper';
import ToggleSwitch from '@/Pages/Admin/Settings/_Includes/ToggleSwitch';
import { router, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type WorkFormProps = {
    title: string;
    category: string;
    price: string;
    duration: string;
    description: string;
    tags: string;
    media: File[];
};

type WorkProps = {
    id: number;
    title: string;
    category: {
        name: string;
    };
    price: string;
    duration: string;
    description: string;
    tags: string;
    media_urls: string[];
    is_available?: boolean;
};

export default function Work({
    work,
    category_names,
}: {
    work: WorkProps;
    category_names: string[];
}) {
    const existingMedia = work.media_urls;
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deletingWork, setDeletingWork] = useState<boolean>(false);
    const { data, setData, post, put, reset, errors, processing, clearErrors } =
        useForm<WorkFormProps>({
            title: work.title || '',
            category: work.category.name || '',
            price: work.price || '',
            duration: work.duration || '',
            description: work.description || '',
            tags: work.tags || 'snipfair',
            media: [],
        });

    const routes = [
        {
            name: 'Work',
            path: route('stylist.work'),
            active: true,
        },
        {
            name: 'Update Work',
            path: route('stylist.work.edit', work.id),
            active: false,
        },
    ];

    const mergedErrors = mergeInertiaFieldErrors(errors, 'media');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('stylist.work.update', work.id), {
            onFinish: () => {
                route('stylist.work');
            },
        });
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.media.length === 0) return;

        post(route('stylist.work.media.upload', work.id), {
            onSuccess: () => {
                reset('media');
                router.reload({ only: ['work'] });
            },
        });
    };

    const confirmDelete = (path: string) => {
        setDeleting(path);
    };

    const handleDelete = () => {
        if (!deleting) return;

        router.delete(route('stylist.work.media.delete', work.id), {
            data: { path: deleting },
            onSuccess: () => {
                setDeleting(null);
                router.reload({ only: ['work'] });
            },
        });
    };

    const deleteWork = () => {
        if (!deletingWork) return;

        router.delete(route('stylist.work.delete', work.id), {
            data: {},
            onSuccess: () => {
                router.visit(route('stylist.work'));
            },
        });
    };

    const [isAvailable, setIsAvailable] = useState(work.is_available);
    const [isProcessing, setIsProcessing] = useState(false);

    const toggleService = (id: number) => {
        if (isProcessing) return;
        setIsProcessing(true);
        router.put(
            route('stylist.work.toggle', id),
            {},
            {
                onSuccess: () => {
                    setIsAvailable(!isAvailable);
                    setIsProcessing(false);
                },
                onError: () => setIsProcessing(false),
            },
        );
    };

    return (
        <StylistAuthLayout header="Edit Work">
            <StylistNavigationSteps
                routes={routes}
                sub="Showcase your latest works"
            />
            <section className="mx-auto grid max-w-7xl px-5 lg:grid-cols-3">
                <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-sf-black">
                            Work Details
                        </h2>
                        <ToggleSwitch
                            enabled={isAvailable ?? false}
                            onChange={() => toggleService(work.id)}
                            disabled={isProcessing}
                        />
                    </div>
                    <hr />
                    <form onSubmit={submit} className="py-6">
                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel value="Title" isRequired={true} />
                                <TextInput
                                    name="title"
                                    value={data.title}
                                    className="my-2 w-full"
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    onFocus={() => clearErrors('title')}
                                />
                                <InputError
                                    className="text-xs"
                                    message={errors.title}
                                />
                            </div>
                            <div>
                                <InputLabel
                                    value="Category"
                                    isRequired={true}
                                />
                                <SelectInput
                                    name="category"
                                    value={data.category}
                                    className="my-2 w-full"
                                    onChange={(e) =>
                                        setData('category', e.target.value)
                                    }
                                    onFocus={() => clearErrors('category')}
                                    options={category_names.map((item) => ({
                                        label: item,
                                        value: item,
                                    }))}
                                />
                                <InputError
                                    className="text-xs"
                                    message={errors.category}
                                />
                            </div>
                        </div>
                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel
                                    value="Add Price"
                                    isRequired={true}
                                />
                                <TextInput
                                    type="number"
                                    step="0.01"
                                    className="my-2 w-full"
                                    name="price"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData('price', e.target.value)
                                    }
                                    onFocus={() => clearErrors('price')}
                                />
                                <InputError
                                    className="text-xs"
                                    message={errors.price}
                                />
                            </div>
                            <div>
                                <InputLabel
                                    value="Set Duration"
                                    isRequired={true}
                                />
                                <SelectInput
                                    value={data.duration}
                                    onChange={(e) =>
                                        setData('duration', e.target.value)
                                    }
                                    name="duration"
                                    className="my-2 w-full"
                                    onFocus={() => clearErrors('duration')}
                                    options={[
                                        '1 hour',
                                        '2 hours',
                                        '3 hours',
                                        '4 hours',
                                        '5 hours',
                                        '6 hours',
                                    ].map((item) => ({
                                        label: item,
                                        value: item,
                                    }))}
                                />
                                <InputError
                                    className="text-xs"
                                    message={errors.duration}
                                />
                            </div>
                        </div>
                        <div className="mb-4 grid gap-4 md:grid-cols-1">
                            <div>
                                <InputLabel
                                    value="Description"
                                    isRequired={true}
                                />
                                <TextareaInput
                                    name="description"
                                    value={data.description}
                                    className="my-2 w-full"
                                    placeholder="Describe the work, techniques and any special detail"
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    onFocus={() => clearErrors('description')}
                                />
                                <InputError
                                    className="text-xs"
                                    message={errors.description}
                                />
                            </div>
                            <div className="hidden">
                                <InputLabel value="Tags" isRequired={true} />
                                <TextInput
                                    name="tags"
                                    value={data.tags}
                                    placeholder="tag1, tag2, tag3"
                                    className="my-2 w-full"
                                    onChange={(e) =>
                                        setData('tags', e.target.value)
                                    }
                                    onFocus={() => clearErrors('tags')}
                                />
                                {errors.tags ? (
                                    <InputError
                                        className="text-xs"
                                        message={errors.tags}
                                    />
                                ) : (
                                    <p className="text-xs text-sf-gray">
                                        Separate tags with commas
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 flex gap-4">
                            <CustomButton
                                onClick={() => setDeletingWork(true)}
                                variant="secondary"
                            >
                                Delete Work
                            </CustomButton>
                            <CustomButton
                                type="submit"
                                loading={processing}
                                disabled={processing}
                            >
                                Save Changes
                            </CustomButton>
                        </div>
                    </form>
                </div>
                <Modal
                    maxWidth="sm"
                    show={!!deletingWork}
                    onClose={() => setDeletingWork(false)}
                >
                    <div className="mx-auto max-w-80 p-5 text-center">
                        <p>Are you sure you want to delete this work?</p>
                        <CustomButton
                            className="mt-6 bg-danger-normal text-sf-white"
                            onClick={deleteWork}
                        >
                            Yes, Proceed
                        </CustomButton>
                    </div>
                </Modal>
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
                {existingMedia.length > 0 && (
                    <form
                        className="p-4 shadow-sm md:p-6"
                        onSubmit={handleUpload}
                    >
                        <div className="group relative w-full rounded-lg">
                            <img
                                // src={existingMedia[0]}
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
                        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-2">
                            {existingMedia.slice(1).map((url, idx) => (
                                <div
                                    key={idx}
                                    className="group relative w-full rounded-lg"
                                >
                                    <img
                                        // src={url}
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
                                maxFiles={10 - work.media_urls.length}
                                disabled={processing}
                                error={mergedErrors[0] ?? ''}
                                isRequired={true}
                                label="Add more media"
                                extra="(Up to 10 files)"
                            />
                        </div>
                        <CustomButton
                            variant="secondary"
                            type="submit"
                            disabled={processing || !data.media.length}
                            fullWidth={false}
                            className="mx-auto mb-6 mt-4"
                        >
                            Update Images
                        </CustomButton>
                    </form>
                )}
            </section>
        </StylistAuthLayout>
    );
}
