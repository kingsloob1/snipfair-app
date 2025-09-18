interface SeparatorProps {
    text?: string;
    className?: string;
}
const Separator = ({ text = 'OR', className = '' }: SeparatorProps) => {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <div className="h-px flex-1 bg-sf-stroke" />
            <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-sf-primary-paragraph">
                    {text}
                </span>
            </div>
            <div className="h-px flex-1 bg-sf-stroke" />
        </div>
    );
};

export default Separator;
