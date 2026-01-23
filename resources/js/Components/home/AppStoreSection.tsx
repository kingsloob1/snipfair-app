import { motion } from 'motion/react';
const AppStoreSection = () => {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-[#00010E] via-[#1a1a2e] to-[#2d1b69] py-20">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute left-10 top-10 h-72 w-72 animate-pulse rounded-full bg-purple-500 opacity-10 mix-blend-multiply blur-xl filter"></div>
                <div className="absolute bottom-10 right-10 h-96 w-96 animate-pulse rounded-full bg-pink-500 opacity-10 mix-blend-multiply blur-xl filter"></div>
                <div className="absolute left-1/3 top-1/2 h-80 w-80 animate-pulse rounded-full bg-blue-500 opacity-5 mix-blend-multiply blur-xl filter"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-5">
                <div className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="mb-6 inline-flex items-center rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-4 py-2"
                    >
                        <span className="text-sm font-medium text-purple-300">
                            📱 Mobile App Coming Soon
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="mb-6 text-4xl font-extrabold text-white md:text-5xl"
                    >
                        Get Ready for the
                        <br />
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                            Ultimate Beauty Experience
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="mx-auto max-w-3xl text-lg text-gray-300 md:text-xl"
                    >
                        The Snipfair mobile app is coming soon to iOS and
                        Android. Book appointments, chat with stylists, and
                        manage your beauty routine all from your mobile device.
                    </motion.p>
                </div>

                {/* Features Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="grid gap-8 md:grid-cols-3"
                >
                    <div className="group text-center">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-2xl"
                        >
                            ⚡
                        </motion.div>
                        <h4 className="mb-2 text-lg font-semibold text-white">
                            Instant Booking
                        </h4>
                        <p className="text-sm text-gray-400">
                            Book your favorite stylist with just a few taps
                        </p>
                    </div>

                    <div className="group text-center">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-2xl"
                        >
                            💬
                        </motion.div>
                        <h4 className="mb-2 text-lg font-semibold text-white">
                            Real-time Chat
                        </h4>
                        <p className="text-sm text-gray-400">
                            Chat directly with stylists and get instant updates
                        </p>
                    </div>

                    <div className="group text-center">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-2xl"
                        >
                            🔔
                        </motion.div>
                        <h4 className="mb-2 text-lg font-semibold text-white">
                            Smart Notifications
                        </h4>
                        <p className="text-sm text-gray-400">
                            Never miss an appointment with smart reminders
                        </p>
                    </div>
                </motion.div>

                {/* App Store Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            window.open(
                                'https://apps.apple.com/ng/app/snipfair/id6755818679',
                                '_blank',
                            );
                        }}
                        className="app-btn apple-btn"
                        role="button"
                    >
                        <span className="app-button-subtitle">
                            Download on the
                        </span>
                        <span className="app-button-title">App Store</span>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            window.open(
                                'https://play.google.com/store/apps/details?id=com.snipfair.app&pli=1',
                                '_blank',
                            );
                        }}
                        className="app-btn google-btn"
                        role="button"
                    >
                        <span className="app-button-subtitle">
                            Download on the
                        </span>
                        <span className="app-button-title">Google Play</span>
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default AppStoreSection;
