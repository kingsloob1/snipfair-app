import CustomButton from '@/Components/common/CustomButton';
import FileInput from '@/Components/common/forms/FileInput';
import Modal from '@/Components/Modal';
import { mergeInertiaFieldErrors } from '@/lib/helper';
import { router, useForm } from '@inertiajs/react';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type FormProps = {
    media: File[];
    variant: 'styles' | 'media';
};

interface StylesMedia {
    id: number;
    model_id: string;
    type: 'styles' | 'media';
    url: string;
}

interface ImagesMedia {
    id: number;
    slug: string;
    type: 'portfolio' | 'proof';
    image: string;
}

const SECTIONS = [
    { name: 'portfolio', title: 'Portfolio Images' },
    { name: 'proof', title: 'Appointment Images' },
];

export default function StylesMedia({
    styles_media,
    all_media,
    variant,
}: {
    styles_media: StylesMedia[];
    all_media: ImagesMedia[];
    variant: 'styles' | 'media';
}) {
    const [deleting, setDeleting] = useState<number | null>(null);
    const [addNew, setAddNew] = useState(false);
    const [activeTab, setActiveTab] = useState<'add' | 'remove'>('remove');
    const { data, setData, post, reset, errors, processing } =
        useForm<FormProps>({
            media: [],
            variant: variant,
        });

    useEffect(() => {
        setData('variant', variant);
        setActiveTab('remove');
    }, [variant, setData]);

    const mergedErrors = mergeInertiaFieldErrors(errors, 'media');

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.media.length === 0) return;

        post(route('admin.contents.styles_media.upload'), {
            onSuccess: () => {
                reset('media');
                setAddNew(false);
                router.reload({ only: ['styles_media', 'all_media'] });
            },
        });
    };

    const confirmDelete = (id: number) => {
        setDeleting(id);
    };

    const handleDelete = () => {
        if (!deleting) return;

        router.delete(route('admin.contents.styles_media.delete'), {
            data: { item_id: deleting },
            onSuccess: () => {
                setDeleting(null);
                router.reload({ only: ['styles_media', 'all_media'] });
            },
        });
    };

    const handleAdd = (
        path: string,
        slug: string,
        type: 'proof' | 'portfolio',
    ) => {
        if (!(variant === 'styles' || variant === 'media')) return;

        router.post(
            route('admin.contents.styles_media.add'),
            { path, slug, type, variant },
            {
                onSuccess: () => {
                    router.reload({ only: ['styles_media', 'all_media'] });
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    <span className="hidden md:inline">Manage</span>
                    {variant === 'styles'
                        ? 'Trending Styles'
                        : 'Featured Media'}
                </h2>
                <CustomButton
                    variant="black"
                    disabled={addNew}
                    onClick={() => setAddNew(true)}
                    fullWidth={false}
                >
                    Upload Custom
                </CustomButton>
            </div>
            <div className="mt-4 min-h-[50vh] border border-sf-gray">
                <div className="grid grid-cols-2">
                    {['remove', 'add'].map((action, i) => (
                        <button
                            key={i}
                            onClick={() =>
                                action === 'add'
                                    ? setActiveTab('add')
                                    : setActiveTab('remove')
                            }
                            className={`${
                                activeTab === action
                                    ? 'border-sf-black bg-sf-primary-paragraph text-sf-white'
                                    : 'border-gray-300 text-sf-primary-paragraph'
                            } inline-flex w-full items-center justify-center border px-3 py-2 text-sm font-medium shadow-sm hover:bg-sf-gray-zinc hover:text-sf-white`}
                        >
                            {action === 'add' ? 'Add New' : 'Remove Existing'}
                        </button>
                    ))}
                </div>
                {activeTab === 'remove' ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 p-2 md:grid-cols-2 md:py-6 lg:grid-cols-3">
                            {styles_media.map((media, idx) => (
                                <div
                                    key={idx}
                                    className="group relative w-full rounded-lg"
                                >
                                    <img
                                        src={`/storage/${media.url}`}
                                        className="h-full w-full rounded-lg object-cover"
                                        alt={`media-${idx}`}
                                    />
                                    <button
                                        onClick={() => confirmDelete(media.id)}
                                        type="button"
                                        className="absolute right-1 top-1 hidden rounded-full border border-sf-white bg-red-500 p-1.5 text-white group-hover:block"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="p-2">
                        {SECTIONS.map((section) => {
                            const stylesMediaIds = new Set(
                                styles_media.map((sm) => sm.model_id),
                            );
                            const sectionImages = all_media.filter((media) => {
                                if (media.type !== section.name) {
                                    return false;
                                }
                                const mediaId = `${media.type}:${media.slug}`;
                                return !stylesMediaIds.has(mediaId);
                            });
                            if (sectionImages.length === 0) return null;
                            return (
                                <div key={section.name}>
                                    <h2 className="mt-5 font-inter text-xl font-bold text-sf-black md:mt-10 md:text-2xl">
                                        {section.title}
                                    </h2>
                                    <div className="grid grid-cols-1 gap-6 py-2 md:grid-cols-2 md:py-6 lg:grid-cols-3">
                                        {sectionImages.map((media, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative w-full rounded-lg"
                                            >
                                                <img
                                                    src={`/storage/${media.image}`}
                                                    className="h-full w-full rounded-lg object-cover"
                                                    alt={`media-${idx}`}
                                                />
                                                <button
                                                    onClick={() =>
                                                        handleAdd(
                                                            media.image,
                                                            media.slug,
                                                            media.type,
                                                        )
                                                    }
                                                    type="button"
                                                    className="absolute right-1 top-1 hidden rounded-full border border-sf-white bg-success-normal p-1.5 text-white group-hover:block"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <hr />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Modal maxWidth="lg" show={addNew} onClose={() => setAddNew(false)}>
                <div className="p-5 text-center">
                    <form
                        className="p-4 shadow-sm md:p-6"
                        onSubmit={handleUpload}
                    >
                        <FileInput
                            value={data.media}
                            onChange={(files) => setData('media', files)}
                            type="image"
                            maxFiles={10}
                            disabled={processing}
                            error={mergedErrors[0] ?? ''}
                            isRequired={true}
                            label="Upload images"
                            extra="(Up to 10 files)"
                        />
                        <CustomButton
                            type="submit"
                            disabled={processing || !data.media.length}
                            fullWidth={false}
                            className="mx-auto mb-6 mt-4"
                        >
                            Upload Files
                        </CustomButton>
                    </form>
                </div>
            </Modal>
            <Modal
                maxWidth="sm"
                show={!!deleting}
                onClose={() => setDeleting(null)}
            >
                <div className="mx-auto max-w-80 p-5 text-center">
                    <p>Are you sure you want to remove this image?</p>
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
