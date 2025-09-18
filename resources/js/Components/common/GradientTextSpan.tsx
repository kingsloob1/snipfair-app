export default function GradientTextSpan({ text }: { text: string }) {
    return (
        <span className="bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-clip-text text-xl font-bold text-transparent">
            {text}
        </span>
    );
}
