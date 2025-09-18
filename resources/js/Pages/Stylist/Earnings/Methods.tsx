import { CustomToast } from '@/Components/common/CustomToast';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { EarningProps } from '@/types/custom_types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import EarningModal from './_Partials/EarningModal';
import PaymentMethods from './_Partials/PaymentMethods';

export default function Methods({ payment_methods }: EarningProps) {
    const [variant, setVariant] = useState<'create' | 'edit' | 'request'>(
        'create',
    );
    const [isOpen, setIsOpen] = useState(false);
    const [extras, setExtras] = useState<
        EarningProps['payment_method_full'] | undefined
    >(undefined);

    const handleSetDefault = (id: number) => {
        router.post(route('stylist.earnings.methods.default', id));
    };

    const handleSelect = (id: number) => {
        router.post(route('stylist.earnings.methods.toggle', id));
    };

    const handleDelete = (id: number) => {
        CustomToast({
            message: 'Are you sure you want to delete this payment method?',
            action: 'Delete Payment Method',
            onConfirm: () => {
                router.delete(route('stylist.earnings.methods.delete', id));
            },
        });
    };

    const handleEdit = (id: number) => {
        const selectedMethod = payment_methods.find(
            (method) => method.id === id,
        );
        if (!selectedMethod) return;

        setExtras(selectedMethod);
        setVariant('edit');
        setIsOpen(true);
    };

    const handleAddNew = () => {
        setExtras(undefined);
        setVariant('create');
        setIsOpen(true);
    };

    const handleRequestPayout = () => {
        setExtras(undefined);
        setVariant('request');
        setIsOpen(true);
    };

    const handleModalClose = () => {
        setIsOpen(false);
        setExtras(undefined);
    };

    const routes = [
        {
            name: 'Earnings',
            path: route('stylist.earnings'),
            active: true,
        },
        {
            name: 'Payout Methods',
            path: '',
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Payment">
            <StylistNavigationSteps
                routes={routes}
                sub="Here's what's happening with your business today"
                cta="Request Payout"
                ctaAction={handleRequestPayout}
            />
            <section className="mx-auto max-w-7xl px-5">
                <PaymentMethods
                    handleAddNew={handleAddNew}
                    paymentMethods={payment_methods}
                    handleSelect={handleSelect}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    handleSetDefault={handleSetDefault}
                />
            </section>
            <EarningModal
                detail={extras}
                variant={variant}
                isOpen={isOpen}
                setIsOpen={handleModalClose}
                payment_methods={payment_methods}
            />
        </StylistAuthLayout>
    );
}
