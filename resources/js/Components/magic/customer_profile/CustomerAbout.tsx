import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';

interface CustomerAboutProps {
    className?: string;
    name?: string;
    bio?: string;
    preferredServices?: string[];
}

export default function CustomerAbout({
    className = '',
    name = '',
    bio = 'No bio available',
    preferredServices,
}: CustomerAboutProps) {
    return (
        <div
            className={cn(
                'w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6',
                className,
            )}
        >
            <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    About {name}
                </h3>
                <p className="leading-relaxed text-gray-600">{bio}</p>
            </div>

            {/* Preferred Services Section */}
            {preferredServices && preferredServices.length > 0 && (
                <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Preferred Services
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {preferredServices.map((service, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 rounded-full bg-sf-gradient-secondary px-3 py-1.5 text-sm font-medium text-white shadow-md"
                            >
                                <Heart className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="text-xs">{service}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
