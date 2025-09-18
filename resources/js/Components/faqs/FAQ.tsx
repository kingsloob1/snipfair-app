import GradientText from '../common/GradientText';
import {
    FaqIcon1,
    FaqIcon2,
    FaqIcon3,
    FaqIcon4,
    FaqIcon5,
    FaqIcon6,
} from '../icon/Icons';

export default function FAQ({
    faqs,
}: {
    faqs: { question: string; answer: string }[];
}) {
    const icons = [
        <FaqIcon1 key={1} />,
        <FaqIcon2 key={2} />,
        <FaqIcon3 key={3} />,
        <FaqIcon4 key={4} />,
        <FaqIcon5 key={5} />,
        <FaqIcon6 key={6} />,
    ];
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-12 md:py-16">
            <header className="mb-5 flex flex-col items-center gap-2 md:gap-3.5">
                <p className="text-center">
                    <GradientText className="bg-gradient-to-b font-inter text-base font-semibold">
                        FAQS
                    </GradientText>
                </p>
                <h2 className="font-inter text-3xl font-bold text-sf-black md:text-4xl">
                    Got Questions? We've Got Answers
                </h2>
                <p className="max-w-2xl text-center font-sans text-base text-sf-primary-paragraph">
                    We're here to help you get the most out of Snipfair. Here
                    are some common questions we hear from our users.
                </p>
            </header>
            <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-9 lg:grid-cols-3 lg:gap-14 xl:gap-8">
                {faqs.map((faq, i) => (
                    <div key={i} className="pb-8">
                        <div className="flex flex-col gap-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sf-primary-light text-sf-gradient-purple">
                                {icons[i % icons.length]}
                            </div>
                            <div className="5 flex flex-col gap-1">
                                <h4 className="font-inter font-semibold text-sf-black-secondary">
                                    {faq.question}
                                </h4>
                                <p className="font-inter text-sm text-sf-gray-zinc">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
