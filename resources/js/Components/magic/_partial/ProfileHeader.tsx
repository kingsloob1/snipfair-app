import CustomButton from '@/Components/common/CustomButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/Components/ui/dialog';
import { getInitials } from '@/lib/helper';
import { UserProfileProps } from '@/types/custom_types';
import { Link, useForm } from '@inertiajs/react';
import { Edit, Loader2, Pen, Settings, Verified } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ProfileForm from './ProfileForm';
interface ProfileHeaderProps {
    name: string;
    type: string;
    appointmentsCount: number;
    imageUrl: string;
    user: UserProfileProps['user'];
}
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    name,
    type,
    appointmentsCount,
    imageUrl,
    user,
}) => {
    // const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data, setData, post, processing, reset } = useForm({
        avatar: null as File | null,
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

        setData('avatar', file);
    };

    useEffect(() => {
        if (data.avatar) {
            post(route('customer.profile.avatar.update'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Avatar updated!');
                    reset();
                },
                onError: (errors) => {
                    toast.error(errors.avatar || 'Upload failed');
                    reset();
                },
            });
        }
    }, [data.avatar, post, reset]);

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            className="mb-6 flex flex-col-reverse items-center justify-between rounded-lg bg-white p-4 shadow-sm md:flex-row md:p-6"
        >
            <div className="flex w-full items-center justify-start gap-4">
                <div
                    className="group relative cursor-pointer"
                    // onMouseEnter={() => setIsHovering(true)}
                    // onMouseLeave={() => setIsHovering(false)}
                    onClick={handleAvatarClick}
                >
                    <Avatar className="h-28 w-28 rounded-full border-2 border-gray-100">
                        <AvatarImage
                            className="h-full w-full object-cover"
                            src={`/storage/${imageUrl}` || ''}
                            alt={name || 'User'}
                        />
                        <AvatarFallback className="font-inter text-2xl">
                            {getInitials(name)}
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

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">{name}</h2>
                        <Verified className="h-5 w-5 fill-success-normal text-sf-white" />
                    </div>
                    <p className="text-purple-600">{type}</p>
                    <p className="text-sm text-gray-500">
                        {appointmentsCount} Appointments
                    </p>
                </div>
            </div>
            <div className="flex w-full items-center justify-between gap-3 md:justify-end">
                <Link
                    href={route('customer.settings')}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                >
                    <Settings className="h-5 w-5 text-gray-600" />
                </Link>
                <Dialog>
                    <DialogTrigger asChild>
                        <CustomButton fullWidth={false} className="px-3">
                            <div className="flex gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </div>
                        </CustomButton>
                    </DialogTrigger>
                    <DialogContent className="no-scrollbar max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
                        <ProfileForm user={user} />
                    </DialogContent>
                </Dialog>
            </div>
        </motion.div>
    );
};
