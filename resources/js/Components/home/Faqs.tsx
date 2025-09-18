import { cn } from '@/lib/utils';
import GradientText from '../common/GradientText';
import FaqCard from './_partial/FaqCard';

export default function Faqs({
    heading = 'normal',
    faqs,
}: {
    heading?: string;
    faqs?: { question: string; answer: string }[];
}) {
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 md:py-10">
            <header className="mb-5 flex flex-col gap-2 md:gap-3.5">
                <p className={cn(heading === 'middle' && 'text-center')}>
                    <GradientText className="bg-gradient-to-b font-inter text-base font-semibold">
                        FAQS
                    </GradientText>
                </p>
                <h2
                    className={cn(
                        'font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl',
                        heading === 'middle' && 'text-center',
                    )}
                >
                    Questions We Get Asked by Our Users
                </h2>
            </header>
            <div className="flex flex-col gap-3.5 md:gap-4">
                {faqs &&
                    faqs.length > 0 &&
                    faqs.map((faq, i) => (
                        <FaqCard
                            key={i}
                            question={faq.question}
                            answer={faq.answer}
                        />
                    ))}
            </div>
        </section>
    );
}
