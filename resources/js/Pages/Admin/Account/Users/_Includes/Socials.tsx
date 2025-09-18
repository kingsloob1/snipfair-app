import {
    Check,
    Copy,
    ExternalLink,
    Facebook,
    Globe,
    Instagram,
    Linkedin,
    MessageCircle,
    Twitter,
    Youtube,
} from 'lucide-react';
import React, { useState } from 'react';

interface Social {
    id?: string;
    social_app: string;
    url: string;
}

interface SocialLinksCardProps {
    socials: Social[];
    title?: string;
    className?: string;
}

// Platform icon mapping
const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();

    if (platformLower.includes('instagram') || platformLower.includes('ig')) {
        return <Instagram className="h-5 w-5" />;
    }
    if (platformLower.includes('twitter') || platformLower.includes('x')) {
        return <Twitter className="h-5 w-5" />;
    }
    if (platformLower.includes('facebook') || platformLower.includes('fb')) {
        return <Facebook className="h-5 w-5" />;
    }
    if (platformLower.includes('youtube') || platformLower.includes('yt')) {
        return <Youtube className="h-5 w-5" />;
    }
    if (platformLower.includes('linkedin')) {
        return <Linkedin className="h-5 w-5" />;
    }
    if (
        platformLower.includes('tiktok') ||
        platformLower.includes('whatsapp') ||
        platformLower.includes('telegram')
    ) {
        return <MessageCircle className="h-5 w-5" />;
    }
    return <Globe className="h-5 w-5" />;
};

// Platform color mapping
const getPlatformColor = (platform: string) => {
    const platformLower = platform.toLowerCase();

    if (platformLower.includes('instagram'))
        return 'from-pink-500 to-purple-600';
    if (platformLower.includes('twitter') || platformLower.includes('x'))
        return 'from-blue-400 to-blue-600';
    if (platformLower.includes('facebook')) return 'from-blue-600 to-blue-800';
    if (platformLower.includes('youtube')) return 'from-red-500 to-red-700';
    if (platformLower.includes('linkedin')) return 'from-blue-700 to-blue-900';
    if (platformLower.includes('tiktok')) return 'from-black to-gray-800';
    if (platformLower.includes('whatsapp'))
        return 'from-green-500 to-green-700';
    if (platformLower.includes('telegram')) return 'from-blue-500 to-blue-700';
    return 'from-gray-500 to-gray-700';
};

const SocialLinksCard: React.FC<SocialLinksCardProps> = ({
    socials,
    title = 'Social Media Links',
    className = '',
}) => {
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    const handleCopyUrl = async (url: string, platform: string) => {
        try {
            if (!platform) return;
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

    // Filter out empty socials
    const validSocials = socials.filter(
        (social) => social.social_app.trim() !== '' && social.url.trim() !== '',
    );

    if (validSocials.length === 0) {
        return (
            <div
                className={`rounded-2xl border border-gray-100 bg-white p-4 shadow-lg ${className}`}
            >
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
                    <Globe className="h-6 w-6 text-gray-600" />
                    {title}
                </h3>
                <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Globe className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                        No social media links added yet
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg ${className}`}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
                <h3 className="flex items-center gap-2 text-xl font-semibold">
                    <Globe className="h-6 w-6" />
                    {title}
                </h3>
            </div>

            {/* Social Links */}
            <div className="p-4">
                <div className="space-y-3">
                    {validSocials.map((social, index) => (
                        <div
                            key={social.id || index}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition-all duration-300 hover:border-gray-300 hover:shadow-md"
                        >
                            {/* Background gradient overlay on hover */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-r ${getPlatformColor(social.social_app)} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}
                            />

                            <div className="relative flex items-center justify-between p-2">
                                <div className="flex min-w-0 flex-1 items-center gap-4">
                                    {/* Platform Icon */}
                                    <div
                                        className={`h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-r ${getPlatformColor(social.social_app)} flex items-center justify-center text-white shadow-lg`}
                                    >
                                        {getPlatformIcon(social.social_app)}
                                    </div>

                                    {/* Platform Info */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate font-semibold capitalize text-gray-800">
                                            {social.social_app}
                                        </h4>
                                        <p className="truncate text-sm text-gray-500">
                                            {social.url}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-shrink-0 items-center gap-2">
                                    {/* Copy Button */}
                                    <button
                                        onClick={() =>
                                            handleCopyUrl(
                                                social.url,
                                                social.social_app,
                                            )
                                        }
                                        className="group/copy relative rounded-lg bg-gray-100 p-1 text-gray-600 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-800"
                                        title="Copy link"
                                    >
                                        {copiedUrl === social.url ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}

                                        {/* Tooltip */}
                                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/copy:opacity-100">
                                            {copiedUrl === social.url
                                                ? 'Copied!'
                                                : 'Copy link'}
                                        </div>
                                    </button>

                                    {/* Visit Button */}
                                    <button
                                        onClick={() =>
                                            handleOpenLink(social.url)
                                        }
                                        className={`rounded-lg bg-gradient-to-r p-1 ${getPlatformColor(social.social_app)} group/visit relative transform text-white transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                                        title="Visit profile"
                                    >
                                        <ExternalLink className="h-3 w-3" />

                                        {/* Tooltip */}
                                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/visit:opacity-100">
                                            Visit profile
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-4">
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400">
                    <span>
                        {validSocials.length} platform
                        {validSocials.length !== 1 ? 's' : ''} connected
                    </span>
                    <span>Click to visit or copy links</span>
                </div>
            </div>
        </div>
    );
};

export default SocialLinksCard;
