import { PencilLine, Trash2 } from 'lucide-react';

interface CertificationCardProps {
    logoSrc?: string | null;
    title: string;
    issuer: string;
    verified: boolean;
    role?: string;
    description?: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

const CertificationCard = ({
    logoSrc,
    title,
    issuer,
    verified,
    role,
    description,
    onEdit,
    onDelete,
}: CertificationCardProps) => {
    return (
        <div className="rounded-lg border border-sf-stroke bg-sf-white p-4 shadow-sm transition-shadow hover:shadow-md md:p-6">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border-2 border-sf-gradient-purple bg-sf-gradient-purple/10">
                        {logoSrc ? (
                            <img
                                src={logoSrc}
                                alt={issuer}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="text-center text-sm font-bold text-sf-gradient-purple">
                                {issuer.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-sf-black">
                                {title}
                            </h3>
                            {verified && (
                                <span className="rounded-xl bg-success-light/30 px-2 py-1 text-xs font-medium text-success-normal">
                                    Verified
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-sf-primary-paragraph">
                            {issuer}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit?.()}
                        className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
                        title="Edit"
                    >
                        <PencilLine size={16} />
                    </button>
                    <button
                        onClick={() => onDelete?.()}
                        className="rounded p-2 text-danger-normal transition-colors hover:bg-danger-normal/10 hover:text-sf-gradient-pink"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Role */}
            {role && (
                <div className="mb-3">
                    <span className="text-sm font-medium text-gray-900">
                        {role}
                    </span>
                </div>
            )}

            {/* Description */}
            {description && (
                <p className="text-sm leading-relaxed text-gray-600">
                    {description}
                </p>
            )}
        </div>
    );
};

export default CertificationCard;
