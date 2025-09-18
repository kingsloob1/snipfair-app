import { openFullscreenOverlay } from '@/lib/helper';
import { motion } from 'motion/react';

export default function Portfolio({
    workSamples,
    name,
}: {
    workSamples: string[];
    name: string;
}) {
    return (
        <div className="w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6">
            <h2 className="mb-8 text-2xl font-bold text-sf-black">
                Portfolio & Work Samples
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:gap-7">
                {workSamples.map((image, index) => (
                    <motion.div
                        key={index}
                        className="relative h-36 overflow-hidden rounded-xl"
                        whileHover={{ scale: 1.05 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <img
                            src={`/storage/${image}`}
                            onClick={() =>
                                openFullscreenOverlay(`/storage/${image}`)
                            }
                            alt={`${name} work sample`}
                            className="h-full w-full cursor-pointer object-cover"
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
