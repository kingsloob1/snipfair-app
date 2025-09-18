import { Clock, Star, Users, Video } from 'lucide-react';
import { motion } from 'motion/react';
import CustomButton from '../common/CustomButton';
import GradientText from '../common/GradientText';

const ViewTutorialCard = ({
    tutorial = {
        id: 1,
        category: 'Beginner',
        is_premium: true,
        title: 'Glass Skin Glow',
        author: 'Glash Hair Coach',
        duration: '1h 30m',
        intro: 'Learn effective strategies to grow your client base and increase bookings',
        likes: 234,
        rating: 3.4,
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    },
}) => {
    return (
        <motion.div
            className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white"
            whileHover={{
                scale: 1.02,
                boxShadow:
                    '0 10px 15px -5px rgb(0 0 0 / 0.1), 0 4px 5px -6px rgb(0 0 0 / 0.1)',
                transition: { duration: 0.2, ease: 'easeOut' },
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex h-full flex-col font-inter">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100">
                    <img
                        src={tutorial.image}
                        alt={tutorial.title}
                        className="h-full w-full object-cover"
                    />

                    {/* Badges */}
                    <div className="absolute left-4 right-4 top-4 flex flex-row-reverse items-start justify-between">
                        <motion.span
                            className="rounded-full bg-sf-gradient-primary px-3 py-1.5 text-xs font-medium text-white"
                            whileHover={{ scale: 1.05 }}
                        >
                            {tutorial.category}
                        </motion.span>
                        {tutorial.is_premium && (
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-sf-yellow-47 to-sf-orange-53 p-px font-semibold opacity-90 shadow-md"
                            >
                                <span className="rounded-xl bg-sf-white px-3 py-1.5 text-xs opacity-90 backdrop-blur-sm">
                                    <GradientText variant="secondary">
                                        Premium
                                    </GradientText>
                                </span>
                            </motion.span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-3">
                    <motion.h5
                        className="mb-1 text-sm font-bold text-sf-black-secondary"
                        whileHover={{ color: '#7c3aed' }}
                        transition={{ duration: 0.2 }}
                    >
                        {tutorial.title}
                    </motion.h5>

                    <p className="mb-2 text-xs leading-relaxed text-sf-black-neutral">
                        {tutorial.category}
                    </p>

                    <p className="my-3 text-sm text-sf-secondary-paragraph">
                        {tutorial.intro}
                    </p>

                    {/* Footer */}
                    <div className="my-3 mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sf-black-neutral">
                            <Clock size={16} />
                            <span className="text-xs">{tutorial.duration}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sf-black-neutral">
                            <Star
                                className="text-sf-yellow-47"
                                fill="hsl(var(--sf-yellow-47))"
                                size={16}
                            />
                            <span className="text-xs font-semibold">
                                {tutorial.rating}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 text-sf-black-neutral">
                            <Users size={16} />
                            <span className="text-xs">{tutorial.likes}</span>
                        </div>
                    </div>
                    <CustomButton>
                        <div className="flex items-center gap-1.5">
                            <Video size={14} />
                            Start Learning
                        </div>
                    </CustomButton>
                </div>
            </div>
        </motion.div>
    );
};

export default ViewTutorialCard;
