import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import GradientText from '../common/GradientText';
import OutlineButton from '../common/OutlineButton';
import StarRating from '../common/StarRating';
import { ArrowRight } from '../icon/Icons';

export default function Testimonial() {
    const reviews = [
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'Snipfaair has helped me connect with clients outside my usual circle. The app is easy to use, and the booking system is super organized. I’ve doubled my client base in 3 months!',
            rating: 3.0,
        },
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'I booked a home manicure session through Snipfaair and it was flawless. My nail tech arrived right on time and was super professional. I’m never going back to waiting at salons!',
            rating: 4.7,
        },
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'I needed a quick haircut before a wedding and found a barber through Snipfaair in under 5 minutes. Great app, smooth booking process, and reliable service.',
            rating: 3.5,
        },
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'Snipfaair has helped me connect with clients outside my usual circle. The app is easy to use, and the booking system is super organized. I’ve doubled my client base in 3 months!',
            rating: 3.0,
        },
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'Snipfaair has helped me connect with clients outside my usual circle. The app is easy to use, and the booking system is super organized. I’ve doubled my client base in 3 months!',
            rating: 4.7,
        },
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'Snipfaair has helped me connect with clients outside my usual circle. The app is easy to use, and the booking system is super organized. I’ve doubled my client base in 3 months!',
            rating: 3.5,
        },
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'Snipfaair has helped me connect with clients outside my usual circle. The app is easy to use, and the booking system is super organized. I’ve doubled my client base in 3 months!',
            rating: 3.0,
        },
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'Snipfaair has helped me connect with clients outside my usual circle. The app is easy to use, and the booking system is super organized. I’ve doubled my client base in 3 months!',
            rating: 4.7,
        },
        {
            image: '/images/temp/review.jpg',
            name: 'Zinny Michaels',
            title: 'Nail Technician',
            message:
                'Snipfaair has helped me connect with clients outside my usual circle. The app is easy to use, and the booking system is super organized. I’ve doubled my client base in 3 months!',
            rating: 3.5,
        },
    ];

    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-7 md:py-10">
            <header className="mb-5 flex flex-col gap-2 md:gap-3.5">
                <p>
                    <GradientText className="bg-gradient-to-b font-inter text-base font-semibold">
                        USER REVIEWS
                    </GradientText>
                </p>
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    Trusted by Clients, Loved by Stylists
                </h2>
                <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                    We're more than just bookings. Snipfair empowers independent
                    stylists with visibility and tools, while giving customers
                    access to beauty
                </p>
            </header>
            <div>
                <ResponsiveMasonry
                    columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                >
                    <Masonry>
                        {reviews &&
                            reviews.map((review, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col gap-2.5 rounded-2xl bg-sf-stroke/50 p-4 md:py-5"
                                >
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <img
                                                src={review.image}
                                                className="h-10 w-10 rounded-full object-cover"
                                                alt=""
                                            />
                                            <div className="flex flex-col gap-1 font-inter">
                                                <h3 className="text-base font-semibold text-sf-primary-paragraph">
                                                    {review.name}
                                                </h3>
                                                <p className="text-sm text-sf-gray-zinc">
                                                    {review.title}
                                                </p>
                                            </div>
                                        </div>
                                        <StarRating
                                            rating={review.rating}
                                            showCount={false}
                                            showRating={false}
                                        />
                                    </div>
                                    <p className="text-inter text-base text-sf-gray-zinc">
                                        “{review.message}”
                                    </p>
                                </div>
                            ))}
                    </Masonry>
                </ResponsiveMasonry>
            </div>
            <div className="mt-8 text-center">
                <OutlineButton className="duration-400 flex gap-1.5 text-sf-gradient-purple transition-colors hover:text-sf-gradient-pink">
                    <span>View More Reviews</span>
                    <ArrowRight />
                </OutlineButton>
            </div>
        </section>
    );
}
