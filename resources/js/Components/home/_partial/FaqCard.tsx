import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';

interface FaqCardProps {
    question: string;
    answer: string;
}

const FaqCard = ({ question, answer }: FaqCardProps) => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleOpen = () => setIsOpen(!isOpen);

    return (
        <motion.div
            className={`cursor-pointer overflow-hidden rounded-lg bg-sf-white-card p-4 ${
                isOpen ? 'shadow-md' : 'shadow-sm'
            }`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={toggleOpen}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">{question}</h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown className="text-gray-500" />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 leading-relaxed text-gray-600"
                    >
                        {answer}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FaqCard;
