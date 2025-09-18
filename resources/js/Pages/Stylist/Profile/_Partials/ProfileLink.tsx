import { Check, Copy, ExternalLink, Globe } from 'lucide-react';
import React, { useState } from 'react';

interface SocialLinksCardProps {
    className?: string;
    profile_link: string;
}

const ProfileLink: React.FC<SocialLinksCardProps> = ({
    className = '',
    profile_link,
}) => {
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    const handleOpenLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            className={`w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg ${className}`}
        >
            {/* Social Links */}
            <div className="p-4">
                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-300 hover:border-gray-300 hover:shadow-md">
                    {/* Background gradient overlay on hover */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                    />

                    <div className="relative flex items-center justify-between p-2">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                            {/* Platform Icon */}
                            <div
                                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink text-white shadow-lg`}
                            >
                                <Globe className="h-5 w-5" />
                            </div>

                            {/* Platform Info */}
                            <div className="min-w-0 flex flex-1">
                                <p className="w-0 flex-1 truncate text-sm text-gray-500">
                                    {profile_link}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-shrink-0 items-center gap-2">
                            {/* Copy Button */}
                            <button
                                onClick={() => handleCopyUrl(profile_link)}
                                className="group/copy relative rounded-lg bg-gray-100 p-1 text-gray-600 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800"
                                title="Copy link"
                            >
                                {copiedUrl ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                    <Copy className="h-3 w-3" />
                                )}
                            </button>

                            {/* Visit Button */}
                            <button
                                onClick={() => handleOpenLink(profile_link)}
                                className={`group/visit relative transform rounded-lg bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink p-1 text-white transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                                title="Preview profile"
                            >
                                <ExternalLink className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLink;
