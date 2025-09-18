import { Heart } from 'lucide-react';
import React from 'react';

interface DeveloperCardProps {
    category?: string;
    title?: string;
    authorName?: string;
    authorRole?: string;
    authorImage?: string;
}

const ResumeTutorialCard: React.FC<DeveloperCardProps> = ({
    category = 'Frontend',
    title = "Beginner's Guide to becoming a professional frontend developer",
    authorName = 'Prashant Kumar singh',
    authorRole = 'Software Developer',
    authorImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
}) => {
    return (
        <button className="min-w-40 overflow-hidden rounded-2xl shadow-md transition-all duration-500 hover:scale-[1.02] hover:shadow-lg md:min-w-64">
            <div className="flex w-full flex-col items-start gap-3 bg-sf-white p-2.5 md:p-3">
                <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-gray-900">
                    <img
                        className="h-full w-full object-cover"
                        src="/images/temp/carousel1.jpg"
                    />
                    <button className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-shadow hover:shadow-xl">
                        <Heart className="h-5 w-5 text-gray-600 transition-colors hover:text-red-500" />
                    </button>
                </div>
                <div className="inline-block">
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-sf-gradient-purple">
                        {category}
                    </span>
                </div>
                <h2 className="text-left text-sm font-bold text-sf-black-secondary">
                    {title}
                </h2>
                <div className="relative h-1 w-full rounded-full bg-sf-stroke">
                    <div className="absolute left-0 top-0 h-1 w-[45%] rounded-full bg-purple-500"></div>
                </div>
                <div className="flex items-center space-x-2">
                    <img
                        src={authorImage}
                        alt={authorName}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                            {authorName}
                        </h3>
                        <p className="text-left text-xs text-sf-gray-zinc">
                            {authorRole}
                        </p>
                    </div>
                </div>
            </div>
        </button>
    );
};

export default ResumeTutorialCard;
