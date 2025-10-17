import CustomButton from '@/Components/common/CustomButton';
import { CustomToast } from '@/Components/common/CustomToast';
import CommonAvatar from '@/Components/common/forms/CommonAvatar';
import CustomInput from '@/Components/common/forms/CustomInput';
import FileInput from '@/Components/common/forms/FileInput';
import InputLabel from '@/Components/InputLabel';
import { mergeInertiaFieldErrors, openFullscreenOverlay } from '@/lib/helper';
import { router, useForm } from '@inertiajs/react';
import { ExternalLink, Loader2, Pen, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Social {
    id?: string; // Add unique identifier
    social_app: string;
    url: string;
}

export default function VerificationForm({
    name,
    business_name,
    socials,
    avatar,
    has_portfolio,
    media,
    profile_completeness,
    stylist_status,
}: {
    name?: string;
    business_name?: string;
    socials?: Social[];
    avatar?: string;
    has_portfolio?: boolean;
    media?: string[];
    profile_completeness?: {
        portfolio: boolean;
        payment_method: boolean;
        status_approved: boolean;
        location_service: boolean;
        address: boolean;
        social_links: boolean;
        works: boolean;
        user_banner: boolean;
        subscription_status: boolean;
        user_avatar: boolean;
        user_bio: boolean;
    };
    stylist_status?:
        | 'unverified'
        | 'approved'
        | 'pending'
        | 'flagged'
        | 'rejected';
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [completeness, setCompleteness] = useState(0);
    // Helper function to generate unique IDs
    const generateId = () => Math.random().toString(36).substr(2, 9);

    useEffect(() => {
        if (profile_completeness) {
            const completedItems = [
                profile_completeness?.portfolio,
                profile_completeness?.payment_method,
                profile_completeness?.status_approved,
                profile_completeness?.location_service,
                profile_completeness?.address,
                profile_completeness?.social_links,
                profile_completeness?.user_banner,
                profile_completeness?.works,
                profile_completeness?.user_avatar,
                profile_completeness?.user_bio,
            ].filter(Boolean).length;
            setCompleteness(completedItems);
        }
    }, [profile_completeness]);

    // Initialize social fields with unique IDs
    const [socialFields, setSocialFields] = useState<Social[]>(() => {
        if (socials && socials.length > 0) {
            return socials.map((social) => ({
                ...social,
                id: social.id || generateId(),
            }));
        }
        return [{ id: generateId(), social_app: '', url: '' }];
    });

    // Form for avatar upload
    const {
        data: avatarData,
        setData: setAvatarData,
        post: postAvatar,
        processing: avatarProcessing,
        reset: resetAvatar,
    } = useForm({
        avatar: null as File | null,
    });

    // Form for verification data
    const { data, setData, errors, clearErrors } = useForm<{
        media: File[];
        business_name: string;
    }>({
        // name: name || '',
        media: [],
        business_name: business_name || '',
    });

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.warning(
                'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
            );
            return;
        }

        setAvatarData('avatar', file);
    };

    useEffect(() => {
        if (avatarData.avatar) {
            postAvatar(window.route('stylist.profile.avatar.update'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Avatar updated!');
                    router.reload({ only: ['profile_completeness'] });
                    resetAvatar();
                },
                onError: (errors) => {
                    toast.error(errors.avatar || 'Upload failed');
                    resetAvatar();
                },
            });
        }
    }, [avatarData.avatar, postAvatar, resetAvatar]);

    const handlePortfolioRedirect = () => {
        router.visit(window.route('stylist.work.create'));
    };

    const handleSocialChange = (
        id: string,
        field: keyof Omit<Social, 'id'>,
        value: string,
    ) => {
        setSocialFields((prevFields) =>
            prevFields.map((social) =>
                social.id === id ? { ...social, [field]: value } : social,
            ),
        );
    };

    const addSocialField = () => {
        // Check if the last row is filled
        const lastSocial = socialFields[socialFields.length - 1];
        if (
            lastSocial.social_app.trim() === '' ||
            lastSocial.url.trim() === ''
        ) {
            toast.warning(
                'Please fill in the social media fields before adding a new one.',
            );
            return;
        }

        // Add a new empty row
        setSocialFields((prev) => [
            ...prev,
            { id: generateId(), social_app: '', url: '' },
        ]);
    };

    const removeSocialField = (id: string) => {
        if (socialFields.length > 1) {
            setSocialFields((prev) => prev.filter((social) => social.id != id));
        }
    };

    const handleSubmit = () => {
        if (completeness === 9 && !profile_completeness?.status_approved) {
            CustomToast({
                message:
                    'Be sure to complete the steps before proceeding to submit, continue?',
                action: 'Submit For Verification',
                onConfirm: () => {
                    router.post(
                        window.route('stylist.profile.verification.update'),
                        {
                            completeness,
                            status: profile_completeness?.status_approved
                                ? 'true'
                                : 'false',
                        },
                        {
                            onStart: () => setLoading(true),
                            onSuccess: () => {
                                router.reload({
                                    only: ['profile_completeness'],
                                });
                                toast.success(
                                    'Verification request submitted successfully.',
                                );
                            },
                            onError: (error) => {
                                const errorMessage =
                                    error.message ||
                                    (error && Object.values(error)[0]) ||
                                    'Failed to submit verification request.';

                                toast.error(errorMessage);
                                console.log(error);
                            },
                            onFinish: () => setLoading(false),
                        },
                    );
                },
            });
        } else {
            const filteredSocials = socialFields.filter(
                (social) =>
                    social.social_app.trim() !== '' && social.url.trim() !== '',
            );

            // Submit directly with the data
            router.post(
                window.route('stylist.profile.verification.update'),
                {
                    // name: data.name,
                    media: data.media,
                    business_name: data.business_name,
                    socials: JSON.stringify(filteredSocials),
                },
                {
                    onStart: () => setLoading(true),
                    onSuccess: () => {
                        router.reload({ only: ['profile_completeness'] });
                        toast.success(
                            'Verification requirements updated successfully.',
                        );
                    },
                    onError: (error) => {
                        const errorMessage =
                            error.message ||
                            (error && Object.values(error)[0]) ||
                            'Failed to submit verification requirements.';

                        toast.error(errorMessage);
                        console.log(error);
                    },
                    onFinish: () => setLoading(false),
                },
            );
        }
    };
    const mergedErrors = mergeInertiaFieldErrors(errors, 'media');

    const calculateProgress = () => {
        if (stylist_status === 'approved') {
            return {
                isDisabled: true,
                text: 'Account Already Approved',
            };
        }

        if (stylist_status === 'flagged') {
            return {
                isDisabled: true,
                text: 'Account Flagged',
            };
        }

        if (stylist_status === 'rejected') {
            return {
                isDisabled: false,
                text: 'Resubmit Requirements',
            };
        }

        if (
            // !profile_completeness?.user_bio ||
            !profile_completeness?.social_links ||
            !profile_completeness?.works
        ) {
            return {
                isDisabled: false,
                text: 'Next',
            };
        }

        if (!profile_completeness?.user_avatar) {
            return {
                isDisabled: true,
                text: 'Upload Avatar',
            };
        }

        if (!profile_completeness?.user_banner) {
            return {
                isDisabled: true,
                text: 'Upload Banner',
            };
        }

        if (!profile_completeness?.user_bio) {
            return {
                isDisabled: true,
                text: 'Add Your Bio',
            };
        }

        if (!profile_completeness?.portfolio) {
            return {
                isDisabled: true,
                text: 'Add A Portfolio',
            };
        }

        if (!profile_completeness?.address) {
            return {
                isDisabled: true,
                text: 'Set Your Address',
            };
        }

        if (!profile_completeness?.location_service) {
            return {
                isDisabled: true,
                text: 'Enable Location Service',
            };
        }

        if (!profile_completeness?.payment_method) {
            return {
                isDisabled: true,
                text: 'Add Payment Method',
            };
        }

        if (
            completeness === 9 &&
            !profile_completeness?.status_approved &&
            stylist_status !== 'pending'
        ) {
            return {
                isDisabled: false,
                text: 'Request Approval',
            };
        }

        if (
            completeness === 9 &&
            !profile_completeness?.status_approved &&
            stylist_status === 'pending'
        ) {
            return {
                isDisabled: true,
                text: 'Awaiting Approval',
            };
        } else {
            return {
                isDisabled: false,
                text: 'Update Requirements',
            };
        }
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex">
                    {/* Avatar Upload Section */}
                    <div
                        className="group relative cursor-pointer"
                        onClick={handleAvatarClick}
                    >
                        <CommonAvatar
                            className="h-28 w-28"
                            image={avatar ?? ''}
                            name={name || 'User'}
                        />

                        <div className="absolute bottom-2 right-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-400 transition-all duration-200 group-hover:h-6 group-hover:w-6 group-hover:bg-blue-500">
                            {avatarProcessing ? (
                                <Loader2 className="h-3 w-3 animate-spin text-white" />
                            ) : (
                                <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <Pen className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>

                {/* Business Name Input */}
                <CustomInput
                    className="w-full px-1 py-1 text-sm"
                    label="Business Name"
                    name="business_name"
                    value={data.business_name as string}
                    placeholder="Your business name"
                    onChange={(e) => setData('business_name', e.target.value)}
                    error={errors.business_name}
                    handleFocus={() => clearErrors('business_name')}
                    isRequired={true}
                />

                {/* Portfolio Section */}
                <div className="space-y-2">
                    <InputLabel value="Portfolio" />
                    <div className="flex items-center justify-between rounded-md border border-gray-300 p-3">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm">
                                {has_portfolio
                                    ? 'Portfolio added'
                                    : 'Portfolio not set up'}
                            </span>
                            {has_portfolio && (
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            )}
                        </div>
                        <CustomButton
                            type="button"
                            fullWidth={false}
                            disabled={has_portfolio}
                            onClick={handlePortfolioRedirect}
                        >
                            <div className="flex items-center space-x-1">
                                <span>
                                    {has_portfolio
                                        ? 'View Portfolio'
                                        : 'Set Up Portfolio'}
                                </span>
                                <ExternalLink className="h-3 w-3" />
                            </div>
                        </CustomButton>
                    </div>
                </div>

                <div>
                    {media && media.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {media.map((file, index) => (
                                <div key={index} className="group relative">
                                    <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                        <img
                                            src={`/storage/${file}`}
                                            onClick={() =>
                                                openFullscreenOverlay(
                                                    `/storage/${file}`,
                                                )
                                            }
                                            alt={'Upload work ' + index}
                                            className="h-full w-full cursor-pointer object-cover"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <FileInput
                            value={data.media}
                            onChange={(files) => setData('media', files)}
                            type="image"
                            maxFiles={10}
                            disabled={loading}
                            error={mergedErrors[0] ?? ''}
                            isRequired={true}
                            label="Upload Past works"
                            extra="(Up to 10 files)"
                        />
                    )}
                </div>

                {/* Social Media Section */}
                <div className="space-y-3">
                    <InputLabel
                        value="Social Media Accounts"
                        isRequired={true}
                    />

                    {socialFields.map((social, index) => (
                        <div
                            key={social.id} // Use stable ID instead of index
                            className="grid grid-cols-7 items-end gap-2"
                        >
                            <div className="col-span-3">
                                <CustomInput
                                    className="w-full px-1 py-1 text-sm"
                                    label={index === 0 ? 'Social App' : ''}
                                    name={`social_app_${social.id}`}
                                    value={social.social_app}
                                    placeholder="e.g., Instagram, Twitter, TikTok"
                                    onChange={(e) =>
                                        handleSocialChange(
                                            social.id!,
                                            'social_app',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="col-span-3">
                                <CustomInput
                                    className="w-full px-1 py-1 text-sm"
                                    label={index === 0 ? 'Your URL' : ''}
                                    name={`url_${social.id}`}
                                    value={social.url}
                                    placeholder="https://..."
                                    onChange={(e) =>
                                        handleSocialChange(
                                            social.id!,
                                            'url',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="col-span-1 flex w-full items-center justify-center">
                                {index === socialFields.length - 1 ? (
                                    <CustomButton
                                        type="button"
                                        onClick={addSocialField}
                                        className="mb-1.5 p-1.5 md:p-1.5"
                                        fullWidth={false}
                                    >
                                        <div className="flex">
                                            <Plus className="h-4 w-4" />
                                        </div>
                                    </CustomButton>
                                ) : (
                                    socialFields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeSocialField(social.id!)
                                            }
                                            className="mb-1 flex h-8 w-8 items-center justify-center rounded-md border border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CustomButton
                type="submit"
                className={`mt-4 ${calculateProgress().isDisabled && 'italic'}`}
                onClick={handleSubmit}
                loading={loading}
                disabled={loading || calculateProgress().isDisabled}
            >
                {calculateProgress().text}
            </CustomButton>
        </>
    );
}
