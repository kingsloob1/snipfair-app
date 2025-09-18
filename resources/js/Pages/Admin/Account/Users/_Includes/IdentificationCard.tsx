interface IdentificationCardProps {
    identification_id?: string | null;
    identification_image?: string | null;
}

const IdentificationCard: React.FC<IdentificationCardProps> = ({
    identification_id,
    identification_image,
}) => {
    return (
        <div className="w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 font-sans shadow-sm shadow-sf-gray/20 md:p-6">
            <div className="mb-6 text-center">
                {/* Display the identification ID if it exists */}
                {identification_id && (
                    <div className="mb-2 bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-clip-text font-inter text-2xl font-bold text-transparent">
                        {identification_id}
                    </div>
                )}
                {/* Display a fallback message if ID is not available */}
                {!identification_id && (
                    <div className="mb-2 text-2xl font-bold text-sf-primary-paragraph">
                        No ID Provided
                    </div>
                )}
                {/* Descriptive label for the ID */}
                <div className="text-sf-primary-paragraph">Document ID</div>
            </div>

            {/* Section for the identification image */}
            <div className="flex flex-col items-center justify-center space-y-2">
                {/* Conditionally render a link if an image URL is provided */}
                {identification_image ? (
                    <a
                        href={identification_image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-sf-primary px-4 py-2 font-semibold text-white transition-all duration-200 hover:bg-sf-primary-paragraph"
                    >
                        View Document
                    </a>
                ) : (
                    // Render a disabled button or message if no image URL
                    <button
                        className="bg-sf-dark-primary-blue cursor-not-allowed rounded-full px-6 py-3 font-semibold text-white opacity-50"
                        disabled
                    >
                        No Document Attached
                    </button>
                )}
            </div>
        </div>
    );
};

export default IdentificationCard;
