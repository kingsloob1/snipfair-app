import CustomButton from '@/Components/common/CustomButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import { getInitials } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    CloudUpload,
    Image,
    Loader2,
    MapPin,
    Pen,
    Phone,
    Star,
    UserCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ProfileForm from './ProfileForm';

interface ProfileCardProps {
    profile_details: {
        name: string;
        first_name: string;
        last_name: string;
        email: string;
        gender: string | null;
        title?: string;
        avatar: string;
        banner?: string;
        rating: number;
        reviews_count: number;
        years_of_experience: string;
        experience: string;
        schedule: string;
        location: string;
        phone: string;
        visits_count: number;
        bio?: string;
    };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile_details }) => {
    const { url } = usePage();
    const [type, setType] = useState<'banner' | 'avatar' | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const params = new URLSearchParams(
            new URL(url, window.location.origin).search,
        );
        const tab = params.get('tab');
        if (tab === 'banner') {
            setShowBanner(true);
        }
        if (tab === 'edit') {
            setShowBanner(false);
            setIsOpen(true);
        }
    }, [url]);
    const { data, setData, post, processing, reset } = useForm({
        avatar: null as File | null,
    });
    const handleAvatarClick = () => {
        setType('avatar');
        fileInputRef.current?.click();
    };
    const handleBannerClick = () => {
        setType('banner');
        fileInputRef.current?.click();
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!type) return;
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

        setData('avatar', file);
    };

    useEffect(() => {
        if (!type) return;
        if (data.avatar) {
            post(window.route(`stylist.profile.${type}.update`), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `${type === 'avatar' ? 'Avatar' : 'Banner'} updated!`,
                    );
                    setType(null);
                    reset();
                },
                onError: (errors) => {
                    toast.error(errors.avatar || 'Upload failed');
                    setType(null);
                    reset();
                },
            });
        }
    }, [data.avatar, post, reset, type]);
    return (
        <div
            className={cn(
                'mb-6 rounded-xl border border-sf-stroke p-4 shadow-sm md:p-6',
                // Common styles for the banner
                showBanner
                    ? 'bg-sf-gradient-primary bg-cover bg-center bg-no-repeat'
                    : 'bg-sf-white',
            )}
            style={
                showBanner && profile_details.banner
                    ? { backgroundImage: `url(${profile_details.banner})` }
                    : {}
            }
        >
            {/* Header */}
            <div className="mb-8">
                <h1
                    className={cn(
                        'mb-1 text-xl font-semibold md:text-2xl',
                        showBanner
                            ? 'text-sf-primary-paragraph'
                            : 'text-sf-black',
                    )}
                    style={{ textShadow: '0.5px 0.5px 1px white' }}
                >
                    {showBanner ? 'Update Cover Photo' : 'Profile Information'}
                </h1>
            </div>

            {/* People Section */}
            <div className="relative mb-5 flex items-center justify-between">
                {/* Beautician */}
                <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
                    <div
                        className="group relative cursor-pointer"
                        onClick={handleAvatarClick}
                    >
                        <Avatar className="h-28 w-28 rounded-full border-2 border-gray-100">
                            <AvatarImage
                                className="h-full w-full object-cover"
                                src={profile_details.avatar ?? ''}
                                alt={profile_details.name || 'User'}
                            />
                            <AvatarFallback className="font-inter text-2xl">
                                {getInitials(profile_details.name)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Active indicator / Pen icon / Loading icon */}
                        <div className="absolute bottom-2 right-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-400 transition-all duration-200 group-hover:h-6 group-hover:w-6 group-hover:bg-blue-500">
                            {processing ? (
                                <Loader2 className="h-3 w-3 animate-spin text-white" />
                            ) : (
                                <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                    <Pen className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div
                        className={cn(
                            'transition-all',
                            showBanner ? 'opacity-0' : 'opacity-100',
                        )}
                    >
                        <h3 className="text-xl font-semibold text-sf-black">
                            {profile_details.name}
                        </h3>
                        <p className="text-sf-secondary">
                            {profile_details.title}
                        </p>
                        <div className="flex gap-6 text-sm">
                            <div className="flex items-center gap-1.5">
                                <Star
                                    size="16"
                                    className="fill-sf-yellow-47 text-sf-yellow-47"
                                />
                                <span>
                                    {profile_details.rating} (
                                    <span className="text-sf-black-secondary">
                                        {profile_details.reviews_count} review
                                        {profile_details.reviews_count !== 1
                                            ? 's'
                                            : ''}
                                    </span>
                                    )
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar
                                    size="16"
                                    className="text-sf-black-secondary"
                                />
                                {profile_details.visits_count} total visits
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute -top-4 right-0 flex gap-1.5">
                    <CustomButton
                        fullWidth={false}
                        variant="secondary"
                        className="px-2 py-1.5 md:px-2 md:py-1.5"
                        onClick={() => setShowBanner(!showBanner)}
                    >
                        {showBanner ? (
                            <div className="flex items-center gap-1">
                                <UserCircle size={16} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <Image size={16} />
                            </div>
                        )}
                    </CustomButton>
                    {showBanner ? (
                        <CustomButton
                            onClick={handleBannerClick}
                            fullWidth={false}
                            variant="black"
                            className="px-2 py-1.5 md:px-2 md:py-1.5"
                        >
                            <div className="flex items-center gap-1 text-sf-white">
                                <CloudUpload size={18} />
                            </div>
                        </CustomButton>
                    ) : (
                        <CustomButton
                            onClick={() => setIsOpen(true)}
                            fullWidth={false}
                            className="px-2 py-1.5 md:px-2 md:py-1.5"
                        >
                            <div className="flex items-center gap-1">
                                <Pen size={14} />
                                <span className="hidden sm:inline">
                                    Edit Profile
                                </span>
                            </div>
                        </CustomButton>
                    )}
                </div>
            </div>
            <div
                className={cn(
                    'mb-4 grid grid-cols-2 gap-7 transition-all',
                    showBanner ? 'opacity-0' : 'opacity-100',
                )}
            >
                <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-4 w-4 shrink-0 text-sf-secondary" />
                    <span className="text-sm">
                        {profile_details.experience}
                    </span>
                </div>
                <div className="flex items-center justify-start gap-3 text-gray-700">
                    <Clock className="h-4 w-4 shrink-0 text-sf-secondary" />
                    <span className="text-sm">{profile_details.schedule}</span>
                </div>
            </div>
            <div
                className={cn(
                    'grid grid-cols-2 gap-7 transition-all',
                    showBanner ? 'opacity-0' : 'opacity-100',
                )}
            >
                {/* Location */}
                <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="h-4 w-4 shrink-0 text-sf-secondary" />
                    <span className="text-sm">{profile_details.location}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-start gap-3 text-gray-700">
                    <Phone className="h-4 w-4 shrink-0 text-sf-secondary" />
                    <span className="text-sm">{profile_details.phone}</span>
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="no-scrollbar max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
                    <ProfileForm profile_details={profile_details} />
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProfileCard;
