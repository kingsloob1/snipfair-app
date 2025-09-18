import { cn } from '@/lib/utils';
import { Award } from 'lucide-react';

interface AboutProps {
    className?: string;
    name?: string;
    aboutText?: string;
    specialties?: string[];
    education?: string[];
    awards?: string[];
}

export default function About({
    className = '',
    name = '',
    aboutText = 'Passionate hair colorist',
    specialties,
    education,
}: AboutProps) {
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
                <p className="leading-relaxed text-gray-600">{aboutText}</p>
            </div>

            {/* Specialties Section */}
            <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Specialties
                </h3>
                <div className="flex flex-wrap gap-3">
                    {specialties &&
                        specialties.map((specialty, index) => (
                            <span
                                key={index}
                                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                            >
                                {specialty}
                            </span>
                        ))}
                </div>
            </div>

            {/* Education & Certifications Section */}
            <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Education & Certifications
                </h3>
                <div className="flex flex-wrap gap-3">
                    {education &&
                        education.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md"
                            >
                                <Award className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">{item}</span>
                            </div>
                        ))}
                </div>
            </div>

            {/* Awards & Recognition Section */}
            {/* <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Awards & Recognition
                </h3>
                <div className="flex flex-wrap gap-3">
                    {awards.map((award, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-medium text-white shadow-md"
                        >
                            <Award className="h-4 w-4" />
                            <span>{award}</span>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
}
