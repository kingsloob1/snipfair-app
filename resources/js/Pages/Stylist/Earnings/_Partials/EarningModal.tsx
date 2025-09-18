import CustomButton from '@/Components/common/CustomButton';
import LogoWrapper from '@/Components/common/LogoWrapper';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { PaymentMethod } from '@/types/custom_types';
import { router, useForm } from '@inertiajs/react';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { toast } from 'sonner';
import AccountForm from './AccountForm';
import PayoutForm from './PayoutForm';

interface ModalProps {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    variant: 'request' | 'create' | 'edit';
    detail?: {
        id: number;
        account_name?: string;
        bank_name?: string;
        account_number?: string;
        routing_number?: string;
        // Support both old and new field names
        account?: string;
        bank?: string;
        routing?: string;
    };
    payment_methods?: PaymentMethod[];
}

export default function EarningModal({
    isOpen,
    setIsOpen,
    variant,
    detail,
    payment_methods,
}: ModalProps) {
    const { data, setData, processing, reset, clearErrors, errors, post } =
        useForm({
            amount: '',
            method: '',
            account_name: '',
            bank_name: '',
            account_number: '',
            routing_number: '',
            type: 'create',
        });

    useEffect(() => {
        if (isOpen) {
            clearErrors();

            if (variant === 'edit' && detail) {
                setData((prevData) => ({
                    ...prevData,
                    account_name: detail.account_name ?? detail.account ?? '',
                    bank_name: detail.bank_name ?? detail.bank ?? '',
                    account_number:
                        detail.account_number ?? detail.account ?? '',
                    routing_number:
                        detail.routing_number ?? detail.routing ?? '',
                    type: 'edit',
                    amount: '',
                    method: '',
                }));
            } else if (variant === 'create') {
                setData({
                    amount: '',
                    method: '',
                    account_name: '',
                    bank_name: '',
                    account_number: '',
                    routing_number: '',
                    type: 'create',
                });
            } else if (variant === 'request') {
                setData({
                    amount: '',
                    method: '',
                    account_name: '',
                    bank_name: '',
                    account_number: '',
                    routing_number: '',
                    type: 'request',
                });
            }
        }
    }, [isOpen, variant, detail, setData, clearErrors]);

    const submit = () => {
        let url;
        if (variant === 'request') {
            url = route('stylist.withdrawal.request');
        } else if (variant === 'create') {
            url = route('stylist.earnings.methods.create');
        } else if (variant === 'edit') {
            if (!detail) {
                toast.error('Cannot find method');
                return;
            }
            url = route('stylist.earnings.methods.update', detail.id);
        }
        if (!url) return;
        post(url, {
            onSuccess: () => {
                reset();
                router.reload({ only: ['payment_methods'] });
                setIsOpen(false);
            },
        });
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            reset();
            clearErrors();
        }
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="no-scrollbar max-h-[90vh] max-w-96 overflow-y-auto sm:rounded-2xl">
                <DialogHeader>
                    <DialogTitle>
                        <div className="mb-4">
                            <LogoWrapper
                                title={
                                    variant === 'request'
                                        ? 'Payout Details'
                                        : variant === 'create'
                                          ? 'Create New Method'
                                          : 'Edit Bank Details'
                                }
                                subtitle={
                                    variant === 'request'
                                        ? 'Withdraw your earnings to your bank account'
                                        : 'Withdraw your earnings to your bank account'
                                }
                            />
                        </div>
                    </DialogTitle>
                </DialogHeader>
                {variant === 'request' ? (
                    <PayoutForm
                        data={data}
                        setData={setData}
                        clearErrors={clearErrors}
                        payment_methods={payment_methods ?? []}
                        errors={errors}
                    />
                ) : (
                    <AccountForm
                        data={data}
                        setData={setData}
                        clearErrors={clearErrors}
                        errors={errors}
                    />
                )}
                <div>
                    <h4 className="font-inter font-semibold text-sf-black">
                        Note:
                    </h4>
                    <ul className="flex flex-col gap-1 rounded-lg bg-sf-orange-53/10 p-3 text-xs text-sf-orange-53 md:p-4">
                        <p>
                            Payouts are processed on business days only.{' '}
                            {variant === 'request'
                                ? 'You will receive an email confirmation once your payout is processed.'
                                : 'Ensure to crosscheck your details before submitting'}
                        </p>
                    </ul>
                </div>
                <DialogFooter>
                    <div className="flex w-full flex-col justify-between gap-2">
                        <CustomButton
                            type="button"
                            disabled={processing}
                            loading={processing}
                            className="px-3 py-2"
                            onClick={() => submit()}
                        >
                            {variant === 'request'
                                ? 'Request Payout'
                                : variant === 'create'
                                  ? 'Add Account'
                                  : 'Update Account'}
                        </CustomButton>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
