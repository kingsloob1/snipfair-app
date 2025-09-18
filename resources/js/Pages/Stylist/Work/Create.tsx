import CustomButton from '@/Components/common/CustomButton';
import FileInput from '@/Components/common/forms/FileInput';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import SelectInput from '@/Components/SelectInput';
import TextareaInput from '@/Components/TextareaInput';
import TextInput from '@/Components/TextInput';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { mergeInertiaFieldErrors } from '@/lib/helper';
import { router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type WorkFormProps = {
    title: string;
    category: string;
    price: string;
    duration: string;
    description: string;
    tags: string;
    media: File[];
};

export default function Work({ services }: { services: string[] }) {
    const { data, setData, post, errors, processing, clearErrors } =
        useForm<WorkFormProps>({
            title: '',
            category: '',
            price: '',
            duration: '',
            description: '',
            tags: 'snipfair',
            media: [],
        });
    const routes = [
        {
            name: 'Work',
            path: route('stylist.work'),
            active: true,
        },
        {
            name: 'Add New Work',
            path: route('stylist.work.create'),
            active: false,
        },
    ];

    const mergedErrors = mergeInertiaFieldErrors(errors, 'media');

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('stylist.work.save'), {
            onFinish: () => {
                route('stylist.work');
            },
        });
    };

    return (
        <StylistAuthLayout header="Create Stylist Work">
            <StylistNavigationSteps
                routes={routes}
                sub="Showcase your latest works"
            />
            <section className="mx-auto max-w-7xl px-5">
                <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-sf-black">
                            Work Details
                        </h2>
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
                                    options={
                                        services &&
                                        services.map((item) => ({
                                            label: item,
                                            value: item,
                                        }))
                                    }
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
                                        '7 hours',
                                        '8 hours',
                                        '9 hours',
                                        '10 hours',
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
                        <div className="mb-4 grid gap-4 md:grid-cols-2">
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
                        <div>
                            <FileInput
                                value={data.media}
                                onChange={(files) => setData('media', files)}
                                type="image"
                                maxFiles={10}
                                disabled={processing}
                                error={mergedErrors[0] ?? ''}
                                isRequired={true}
                                label="Media"
                                extra="(Up to 10 files)"
                                fullWidth={true}
                            />
                        </div>
                        <div className="mt-4 flex gap-4">
                            <CustomButton
                                onClick={() =>
                                    router.visit(route('stylist.work'))
                                }
                                variant="secondary"
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                type="submit"
                                loading={processing}
                                disabled={processing}
                            >
                                Add Work
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </section>
        </StylistAuthLayout>
    );
}
