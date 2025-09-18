import { router } from '@inertiajs/react';
import { useState } from 'react';
import CustomButton from '../common/CustomButton';
import Modal from '../Modal';

export default function Cta() {
    const [showRegister, setShowRegister] = useState(false);

    return (
        <section className="bg-sf-white-card">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-12 md:py-16">
                <header className="mb-5 flex flex-col items-center gap-2 md:gap-3.5">
                    <h2 className="font-inter text-xl font-bold text-sf-gray-zinc sm:text-2xl md:text-3xl">
                        Ready to Transform Your Look?
                    </h2>
                    <p className="max-w-3xl font-sans text-base text-sf-primary-paragraph">
                        Join thousands of satisfied customers who trust Snipfair
                    </p>
                </header>
                <div className="flex justify-center gap-4">
                    <CustomButton
                        onClick={() => router.visit(route('login'))}
                        className="w-52 px-3 py-3"
                    >
                        Book an Appointment
                    </CustomButton>
                    <CustomButton
                        className="w-52 px-3 py-3"
                        variant="secondary"
                        onClick={() => setShowRegister(true)}
                    >
                        Sign Up Now
                    </CustomButton>
                </div>
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
}
