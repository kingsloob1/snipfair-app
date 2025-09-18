import { Link } from '@inertiajs/react';
import CustomButton from '../common/CustomButton';

export default function Contact() {
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 md:py-12">
            <div className="flex items-center justify-between rounded-2xl bg-sf-white-card p-5 md:p-7 lg:p-8">
                <header className="mb-5 flex flex-col gap-2 md:gap-3.5">
                    <h2 className="font-inter text-lg font-bold text-sf-black-secondary md:text-xl">
                        Still have questions?
                    </h2>
                    <p className="max-w-xl font-sans text-base text-sf-primary-paragraph">
                        Can't find the answer you're looking for? Please chat to
                        our friendly team.
                    </p>
                </header>
                <Link href={route('contact')}>
                    <CustomButton type="button" className="w-36">
                        Get in Touch
                    </CustomButton>
                </Link>
            </div>
        </section>
    );
}
