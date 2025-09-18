import { motion } from 'motion/react';

export default function AnimatedSweep() {
    return (
        <div className="overflow-hidden">
            <motion.div
                className="h-1.5"
                style={{
                    background:
                        'linear-gradient(to right, #ff7e5f, #feb47b, #8a2be2, #feb47b, #ff7e5f)', // Pink-Orange-Purple-Orange-Pink
                    backgroundSize: '400% 100%', // Make the gradient wider than the screen
                }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'], // Animate background position for the sweep
                }}
                transition={{
                    duration: 15, // Duration of one full cycle (left-right-left)
                    ease: 'linear',
                    repeat: Infinity, // Loop infinitely
                }}
            />
        </div>
    );
}
