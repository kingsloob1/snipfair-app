export const OrangeNav = ({ text }: { text: string }) => {
    return (
        <div className="inline-flex items-center rounded-full border border-orange-400 bg-white px-2 py-1">
            <span className="mr-3 text-sm font-medium text-orange-500">
                {text}
            </span>
        </div>
    );
};

export const PurpleNav = ({ text }: { text: string }) => {
    return (
        <div className="inline-flex items-center rounded-full border border-purple-400 bg-white px-2 py-1">
            <span className="mr-3 text-sm font-medium text-purple-500">
                {text}
            </span>
        </div>
    );
};
