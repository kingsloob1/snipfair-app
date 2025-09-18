import GradientText from '../common/GradientText';

export default function Contact() {
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-12 md:py-16">
            <header className="mb-5 flex flex-col items-center gap-2 md:gap-3.5">
                <p className="text-center">
                    <GradientText className="bg-gradient-to-b font-inter text-base font-semibold">
                        CONTACT US
                    </GradientText>
                </p>
                <h2 className="font-inter text-3xl font-bold text-sf-black md:text-4xl">
                    Let's Connect
                </h2>
                <p className="max-w-2xl text-center font-sans text-base text-sf-primary-paragraph">
                    Have questions, suggestions, or need help with your booking?
                    Our support team is here to assist you.
                </p>
            </header>
        </section>
    );
}
