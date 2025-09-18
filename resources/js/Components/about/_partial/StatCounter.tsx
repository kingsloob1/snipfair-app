import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect, useState } from 'react';

type StatItemProps = {
    count: number;
    unit: string;
    name: string;
};

const StatItem = ({ count, unit, name }: StatItemProps) => {
    const motionVal = useMotionValue(0);
    const [displayCount, setDisplayCount] = useState(0);

    useEffect(() => {
        const animation = animate(motionVal, count, {
            duration: 2,
            ease: 'easeOut',
            onUpdate: (latest) => {
                setDisplayCount(Math.floor(latest));
            },
        });

        return () => animation.stop();
    }, [count, motionVal]);

    return (
        <div className="flex flex-col gap-2">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-white md:text-4xl"
            >
                {displayCount}
                {unit}
            </motion.div>
            <div className="text-lg text-white md:text-xl">{name}</div>
        </div>
    );
};

interface StatProps {
    stats: {
        id: number;
        name: string;
        count: number;
        unit: string;
    }[];
}

const StatCounter = ({ stats }: StatProps) => {
    return (
        <section
            className="relative bg-cover bg-center py-14"
            style={{
                backgroundImage: "url('/images/temp/values_one.png')",
            }}
        >
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-sf-black-secondary/65 to-sf-black"></div>

            <div className="container relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 text-center md:grid-cols-2 md:text-left lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatItem
                        key={stat.id}
                        count={stat.count}
                        unit={stat.unit}
                        name={stat.name}
                    />
                ))}
            </div>
        </section>
    );
};

export default StatCounter;
