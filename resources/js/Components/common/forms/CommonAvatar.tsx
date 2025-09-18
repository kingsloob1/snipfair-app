import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { getInitials } from '@/lib/helper';
import { cn } from '@/lib/utils';

export default function CommonAvatar({
    image,
    name,
    className,
    fallBackClass,
}: {
    image?: string;
    name: string;
    className?: string;
    fallBackClass?: string;
}) {
    return (
        <Avatar className={cn('h-10 w-10 border border-sf-primary', className)}>
            <AvatarImage
                className={cn('h-10 w-10', className)}
                src={image || ''}
                alt={name || 'User'}
            />
            <AvatarFallback
                className={cn(
                    'bg-sf-gradient-primary text-sf-white',
                    fallBackClass,
                )}
            >
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}
