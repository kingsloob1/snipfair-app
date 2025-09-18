import { Service } from '@/types/custom_types';
import { motion } from 'motion/react';
// import { ArrowIcon } from '../icon/Icons';
// import SearchDropdown from './_partial/SearchDropdown';
import { PageProps } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import CustomButton from '../common/CustomButton';
import Modal from '../Modal';
import Services from './_partial/Services';

type HeroProps = {
    services: Service[];
};

const Hero = ({ auth, services }: PageProps<HeroProps>) => {
    const [showRegister, setShowRegister] = useState(false);
    return (
        <section className="relative flex min-h-[calc(100vh-60px)] w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#00010E] to-[#1a1a2e]">
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute left-1/2 top-1/2 h-auto min-h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                    poster="/images/hero-bg.png"
                >
                    <source src="/videos/horizontal.mp4" type="video/mp4" />
                </video>
                <div className="pointer-events-none absolute inset-0 bg-sf-black opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-sf-black to-transparent" />
            </div>

            <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-4">
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    className="mb-4 mt-24 text-center text-5xl font-extrabold leading-tight text-white drop-shadow-lg md:text-6xl"
                >
                    Your On-Demand
                    <br />
                    Beauty Pro
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7, type: 'spring' }}
                    className="mb-8 max-w-2xl text-center text-lg text-gray-200 md:text-2xl"
                >
                    Connect with professional stylists in your area. Book hair,
                    nails, makeup, and grooming services at your convenience.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7, type: 'spring' }}
                    className="mb-12 flex w-full max-w-2xl items-center"
                >
                    {/* <SearchDropdown />
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.98 }}
                        className="ml-4 flex h-14 items-center gap-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-8 text-lg font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                        Book Now
                        <span className="ml-2">
                            <ArrowIcon />
                        </span>
                    </motion.button> */}
                    <div className="flex w-full justify-center gap-4">
                        <CustomButton
                            onClick={() => router.visit(route('login'))}
                            className="w-52 px-3 py-3"
                        >
                            Book an Appointment
                        </CustomButton>
                        {!auth.user && (
                            <CustomButton
                                className="w-52 px-3 py-3"
                                variant="secondary"
                                onClick={() => setShowRegister(true)}
                            >
                                Sign Up Now
                            </CustomButton>
                        )}
                    </div>
                </motion.div>
                <Services services={services} />
            </div>
            <Modal
                maxWidth="sm"
                show={showRegister}
                onClose={() => setShowRegister(false)}
            >
                <div className="px-6 py-10">
                    <h2 className="py-5 text-center font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                        Join Snipfair
                    </h2>
                    <div className="flex flex-col items-center gap-4">
                        <CustomButton
                            onClick={() => router.visit(route('register'))}
                            fullWidth={false}
                        >
                            Sign Up as Customer
                        </CustomButton>
                        <CustomButton
                            onClick={() =>
                                router.visit(route('stylist.register'))
                            }
                            variant="secondary"
                            fullWidth={false}
                        >
                            Sign Up as Stylist
                        </CustomButton>
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default Hero;
