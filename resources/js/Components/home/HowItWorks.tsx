import GradientText from '../common/GradientText';

export default function HowItWorks() {
    const data = [
        {
            name: 'Select Your Hairstyle',
            step: 'Browse our gallery of trend-setting and timeless looks, curated to inspire and suit your unique style.',
            color: '#EE06DB',
        },
        {
            name: 'Pick Your Pre-Vetted Pro Stylist',
            step: 'Choose from our hand-selected professionals, each vetted for skill, reliability, and exceptional service.',
            color: '#17C964',
        },
        {
            name: 'Book An Appointment',
            step: 'Secure your preferred date and time in just a few taps. Your beauty, on your schedule.',
            color: '#5F6CE3',
        },
        {
            name: 'We Take Care of the Rest',
            step: 'From confirmation to arrival, we handle every detail, ensuring a seamless, stress-free experience.',
            color: '#08B0FF',
        },
    ];

    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 space-y-5 px-5 py-7 md:py-10">
            <div className="grid grid-cols-5 items-center gap-6 xl:gap-8">
                <header className="col-span-5 flex flex-col gap-2 lg:col-span-3">
                    <p>
                        <GradientText className="bg-gradient-to-r font-inter text-base font-bold">
                            HOW IT WORKS
                        </GradientText>
                    </p>
                    <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                        Beauty, Perfected for Your Lifestyle
                    </h2>
                    <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                        Indulge in a seamless beauty experience. Select from our
                        exclusive range of services, connect with a carefully
                        vetted professional, and enjoy premium treatments in the
                        comfort of your own space. At Snipfair, every detail is
                        designed to fit your schedule — without compromising on
                        elegance or excellence.
                    </p>
                </header>
                <div className="col-span-5 lg:col-span-2">
                    <img
                        src="/images/temp/how.jpg"
                        alt="How it works"
                        className="w-full rounded-lg object-cover"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="cursor-pointer rounded-2xl border border-sf-stroke bg-sf-white-card p-4 transition-all duration-500 hover:scale-110 md:rounded-3xl md:py-6"
                    >
                        <div
                            className="mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl text-white"
                            style={{ backgroundColor: item.color }}
                        >
                            {index + 1}
                        </div>
                        <h2 className="font-inter text-base font-bold text-sf-black">
                            {item.name}
                        </h2>
                        <p className="font-sans text-sm text-sf-primary-paragraph">
                            {item.step}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
