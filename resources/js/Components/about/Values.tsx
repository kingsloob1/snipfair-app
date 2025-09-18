import GradientText from '../common/GradientText';
// import StatCounter from './_partial/StatCounter';

export default function Values() {
    const values = [
        {
            id: 1,
            name: 'Customer First',
            description:
                'Every decision we make is centered around providing the best experience for our users',
        },
        {
            id: 2,
            name: 'Trust & Safety',
            description:
                'We ensure all stylists are verified professionals and maintain the highest safety standards',
        },
        {
            id: 3,
            name: 'Quality Excellence',
            description:
                'We partner only with top-rated professionals who meet our strict quality standards',
        },
        {
            id: 4,
            name: 'Community',
            description:
                'Building a supportive community where beauty professionals and customers thrive together',
        },
    ];

    // const stats = [
    //     {
    //         id: 1,
    //         name: 'Professional Stylists',
    //         count: 500,
    //         unit: '+',
    //     },
    //     {
    //         id: 2,
    //         name: 'Happy Customers',
    //         count: 50,
    //         unit: 'K+',
    //     },
    //     {
    //         id: 3,
    //         name: 'Services Completed',
    //         count: 200,
    //         unit: 'K+',
    //     },
    //     {
    //         id: 4,
    //         name: 'Customer Satisfaction',
    //         count: 99,
    //         unit: '%',
    //     },
    // ];

    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 md:py-10">
            <header className="mb-5 flex flex-col gap-2 md:gap-3.5">
                <p>
                    <GradientText className="bg-gradient-to-b font-inter text-base font-semibold">
                        OUR VALUES
                    </GradientText>
                </p>
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    Your Style, Your Terms — Anytime, Anywhere
                </h2>
                <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                    The principles that guide everything we do.
                </p>
            </header>
            <div className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
                {values.slice(0, 8).map((item) => (
                    <div key={item.id}>
                        <h2 className="font-inter text-lg font-bold text-sf-black-secondary md:text-xl">
                            {item.name}
                        </h2>
                        <p className="font-inter text-sm text-sf-gray-zinc">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
            {/* <div className="grid grid-cols-1 gap-8 pb-4 sm:grid-cols-2 md:grid-cols-4 md:gap-10"></div> */}
        </section>
    );
}
