import Thumbnail from './_partial/Thumbnail';

export default function Trending({
    title = 'Trending Styles',
    portfolios,
}: {
    title?: string;
    portfolios: {
        id: number;
        slug_id: number;
        banner_image?: string | null;
        category: string;
        name: string;
        description: string;
        price: number;
        stylist_name: string;
    }[];
}) {
    return (
        <section className="mx-auto max-w-7xl px-5 pb-12 pt-8 md:pb-16 md:pt-12">
            <h2 className="pb-8 font-inter text-2xl font-bold text-sf-black-secondary md:pb-12 md:text-3xl">
                {title}
            </h2>
            <div>
                <Thumbnail portfolios={portfolios} />
            </div>
        </section>
    );
}
