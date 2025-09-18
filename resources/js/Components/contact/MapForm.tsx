import { motion } from 'motion/react';
import {
    Chat,
    FooterFacebook,
    FooterInstagram,
    FooterTikTok,
    FooterWhatsApp,
    // Location,
    Message,
} from '../icon/Icons';
import Form from './_partial/Form';
import Map from './_partial/Map';

declare global {
    interface Window {
        Tawk_API?: {
            toggle: () => void;
            showWidget: () => void;
            hideWidget: () => void;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key: string]: any;
        };
    }
}

export default function MapForm() {
    const callTawk = () => {
        if (typeof window !== 'undefined' && window.Tawk_API) {
            window.Tawk_API.toggle();
        }
    };
    return (
        <section className="mx-auto flex max-w-7xl flex-col gap-2 px-5 pb-12 md:pb-16">
            <header className="mb-5 flex flex-col gap-2 md:gap-3.5">
                <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                    Get in Touch with Us
                </h2>
                <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                    Reach out through any of our available channels and we'll
                    respond promptly.
                </p>
            </header>
            <div className="grid grid-cols-1 items-center gap-7 md:grid-cols-2 md:gap-9 lg:gap-14 xl:gap-8">
                <Map lat={-33.984515} lng={18.681878} />
                <div className="flex flex-col gap-8">
                    <motion.div
                        className="space-y-2.5 font-inter"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h4 className="text-base font-medium text-sf-gradient-purple md:text-lg">
                            Address
                        </h4>
                        {/* <p className="flex items-center gap-2 text-sm text-sf-primary-paragraph">
                            <Location className="h-5 w-5 shrink-0" />
                            <span>
                                63751 Reichel Island, Ignacio Fort, South
                                Georgia and the South Sandwich Islands
                            </span>
                        </p> */}
                        <p className="flex items-center gap-2 text-sm text-sf-primary-paragraph">
                            <Message className="h-4 w-4 shrink-0" />
                            <span>support@snipfair.com</span>
                        </p>
                    </motion.div>
                    <motion.div
                        className="space-y-2.5 font-inter"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* <h4 className="text-base font-medium text-sf-gradient-purple md:text-lg">
                            Our Hot Lines
                        </h4>
                        <div className="flex gap-6 md:gap-8">
                            <p className="flex items-center gap-2 text-sm text-sf-primary-paragraph">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>01-0298599</span>
                            </p>
                            <p className="flex items-center gap-2 text-sm text-sf-primary-paragraph">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>01-0298598</span>
                            </p>
                        </div> */}
                        <button
                            onClick={callTawk}
                            className="mt-3 flex items-center gap-2 text-sm text-sf-primary-hover underline transition-all duration-300 hover:text-sf-primary-paragraph hover:no-underline"
                        >
                            <Chat className="h-5 w-5 shrink-0" />
                            <span>Chat here</span>
                        </button>
                    </motion.div>
                    <motion.div
                        className="space-y-2.5 font-inter"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h4 className="text-base font-medium text-sf-gradient-purple md:text-lg">
                            Social Media
                        </h4>
                        <div className="flex gap-6 md:gap-8">
                            <motion.a
                                href="https://www.facebook.com/share/1BmTa4YwyA/?mibextid=wwXIfr"
                                target="_blank"
                                className="h-5 w-5 text-sf-gray-zinc hover:text-sf-gradient-purple"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FooterFacebook />
                            </motion.a>

                            <motion.a
                                href="https://whatsapp.com/channel/0029VbBMml684OmGJcIVmp3b"
                                target="_blank"
                                className="h-5 w-5 text-sf-gray-zinc hover:text-sf-gradient-purple"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FooterWhatsApp className="h-7 w-7" />
                            </motion.a>

                            <motion.a
                                href="https://www.tiktok.com/@snipfair?_t=ZS-8ylQn02BlUC&_r=1"
                                target="_blank"
                                className="h-5 w-5 text-sf-gray-zinc hover:text-sf-gradient-purple"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FooterTikTok className="h-7 w-7" />
                            </motion.a>

                            <motion.a
                                href="https://www.instagram.com/snipfair?igsh=MXh3aGN3OGI2bTd5dg== "
                                target="_blank"
                                className="h-5 w-5 text-sf-gray-zinc hover:text-sf-gradient-purple"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FooterInstagram />
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </div>
            <div className="py-12 md:py-16">
                <Form />
            </div>
        </section>
    );
}
