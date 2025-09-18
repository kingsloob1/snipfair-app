import { AnimatePresence, motion } from 'motion/react';

type SettingsTab = {
    title: string;
    icon: React.ReactNode;
    sections: React.ReactNode[];
};

const IntegratedTabs = ({
    tabs,
    showIcons = true,
    activeTab,
    setActiveTab,
}: {
    tabs: SettingsTab[];
    showIcons: boolean;
    activeTab: number;
    setActiveTab: (index: number) => void;
}) => {
    return (
        <div className="mx-auto max-w-7xl px-5">
            {/* Tab Headers integrated with first content section */}
            <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
                {/* Tab Navigation */}
                <div className="no-scrollbar flex gap-4 overflow-x-auto border-b border-gray-200 px-4 pb-2 pt-4 md:px-8 md:pb-4 md:pt-6">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`relative flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === index
                                    ? 'border-b border-sf-stroke bg-sf-white-neutral text-sf-black'
                                    : 'text-sf-secondary-paragraph hover:text-sf-black'
                            }`}
                        >
                            {showIcons && tab.icon}
                            {tab.title}
                        </button>
                    ))}
                </div>

                {/* First Section Content (integrated with headers) */}
                <div className="p-0 md:p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tabs[activeTab].sections[0]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Additional Sections as Separate Cards */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    {tabs[activeTab].sections.slice(1).map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="rounded-lg bg-white p-4 shadow-sm md:p-6"
                        >
                            {section}
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default IntegratedTabs;
