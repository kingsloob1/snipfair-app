import CustomButton from '@/Components/common/CustomButton';
import { PageProps } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CheckoutProps extends PageProps {
    testMode: boolean;
}

interface PaymentInfo {
    processor: 'payfast' | 'peachpayment' | string;
    processor_id: string;
    payment_url: string;
    deposit_id: number | string;
}

interface PaymentFlashData {
    flash?: {
        custom_response?: PaymentInfo;
    };
}

type FormProps = {
    amount: number;
    email: string;
    first_name: string;
    last_name: string;
    type: string;
    portfolio_id: number | null;
};

const Checkout = ({
    amount,
    onClose,
    onTopupSuccess,
    portfolioId,
    type = 'topup',
}: {
    amount: number;
    onClose: () => void;
    onTopupSuccess: () => void;
    portfolioId?: number;
    type?: 'topup' | 'deposit';
}) => {
    const { auth } = usePage<CheckoutProps>().props;
    const [message, setMessage] = useState<string | null>(null);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | undefined>(
        undefined,
    );

    // const [scriptLoaded, setScriptLoaded] = useState(false);
    const { data, setData, post, processing } = useForm<FormProps>({
        amount: 0,
        email: '',
        first_name: '',
        last_name: '',
        type: '',
        portfolio_id: null,
    });

    const handlePaymentMade = useCallback(() => {
        toast.success(
            'Payment is being confirmed, you will receive a notification shortly!',
        );
        router.reload({
            only: ['wallet', 'walletStats'],
        });
        setTimeout(onClose, 1000);
    }, [onClose]);

    useEffect(() => {
        if (auth.user) {
            const first_name = auth.user.name.split(' ')[0] || 'Customer';
            const last_name =
                auth.user.name.split(' ').slice(1).join(' ') || 'Snipfair';
            const email = auth.user.email || 'admin@snipfair.com';
            setData((prev) => ({
                ...prev,
                first_name,
                last_name,
                email,
                amount,
                type,
                portfolio_id: portfolioId || null,
            }));
        }
    }, [amount, setData, auth, type, portfolioId]);

    // useEffect(() => {
    //     // Load Payfast engine.js dynamically
    //     const script = document.createElement('script');
    //     script.src = testMode
    //         ? 'https://sandbox.payfast.co.za/onsite/engine.js'
    //         : 'https://www.payfast.co.za/onsite/engine.js';
    //     script.async = true;
    //     script.onload = () => setScriptLoaded(true);
    //     script.onerror = () => setMessage('Failed to load payment script');
    //     document.body.appendChild(script);

    //     return () => {
    //         document.body.removeChild(script);
    //     };
    // }, [testMode]);

    const handlePayNow = () => {
        if (paymentInfo?.payment_url) {
            // Open the URL in a new pop-up window
            const popupWindow = window.open(paymentInfo.payment_url, '_blank');

            // Optional: Bring the pop-up window into focus if it's already open
            if ('focus' in popupWindow!) {
                popupWindow.focus();
            }
            return;
        }

        // if (!scriptLoaded) {
        //     setMessage('Payment script is loading...');
        //     return;
        // }

        post(window.route('customer.payment.initiate'), {
            preserveScroll: true,
            onSuccess: (response) => {
                const props = response.props as PaymentFlashData;
                const { processor, payment_url } =
                    props?.flash?.custom_response || {};

                switch (processor) {
                    // case 'payfast': {
                    //     if (!('payfast_do_onsite_payment' in window)) {
                    //         setMessage('Payment script is not available.');
                    //         return;
                    //     }

                    //     if (processor_id && deposit_id) {
                    //         (window as any).payfast_do_onsite_payment(
                    //             { uuid: processor_id },
                    //             (result: boolean) => {
                    //                 if (result === true) {
                    //                     toast.success(
                    //                         'Payment is being confirmed, you will receive a notification shortly!',
                    //                     );
                    //                     onTopupSuccess();
                    //                 } else {
                    //                     router.post(
                    //                         window.route(
                    //                             'customer.payment.cancel',
                    //                         ),
                    //                         {
                    //                             uuid: processor_id,
                    //                             deposit_id,
                    //                         },
                    //                         {
                    //                             onSuccess: () => {
                    //                                 toast.warning(
                    //                                     'Payment cancelled and declined successfully.',
                    //                                 );
                    //                             },
                    //                             onError: () => {
                    //                                 toast.warning(
                    //                                     'Payment window closed or cancelled.',
                    //                                 );
                    //                             },
                    //                         },
                    //                     );
                    //                     router.reload({
                    //                         only: ['wallet', 'walletStats'],
                    //                     });
                    //                 }
                    //                 reset();
                    //             },
                    //         );
                    //         onClose();
                    //     } else {
                    //         setMessage('Failed to initiate payment.');
                    //     }
                    //     break;
                    // }

                    case 'payfast':
                    case 'peachpayment': {
                        setPaymentInfo(props.flash?.custom_response);

                        // Open the URL in a new pop-up window
                        const popupWindow = window.open(payment_url, '_blank');

                        // Optional: Bring the pop-up window into focus if it's already open
                        if ('focus' in popupWindow!) {
                            popupWindow.focus();
                        }

                        onTopupSuccess();
                    }
                }
            },
            onError: (err) => {
                setMessage('Error: ' + Object.values(err).join(', '));
            },
        });
    };

    return (
        <>
            <div className="relative w-full rounded-lg border border-sf-stroke bg-sf-white-card p-4">
                <h3 className="mb-3 font-semibold text-sf-black">
                    Billing Details
                </h3>
                <div className="flex items-center gap-3">
                    <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-sf-primary/10 md:flex">
                        <User className="h-5 w-5 text-sf-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-sf-black">
                            <span className="text-xs text-sf-secondary-paragraph">
                                Billing Name:
                            </span>{' '}
                            {`${data.first_name} ${data.last_name}`}
                        </p>
                        <p className="text-sm text-sf-secondary-paragraph">
                            <span className="text-xs text-sf-secondary-paragraph">
                                Billing Email:
                            </span>{' '}
                            {data.email}
                        </p>
                    </div>
                </div>
            </div>
            <form>
                <div className="space-y-3">
                    <CustomButton
                        type="submit"
                        onClick={handlePayNow}
                        disabled={processing}
                        className="w-full"
                    >
                        {processing
                            ? 'Processing...'
                            : paymentInfo
                              ? 'Open Payment Link'
                              : 'Proceed to Gateway'}
                    </CustomButton>

                    {paymentInfo && (
                        <CustomButton
                            type="submit"
                            onClick={handlePaymentMade}
                            disabled={processing}
                            className="w-full"
                        >
                            I have Paid
                        </CustomButton>
                    )}

                    <CustomButton
                        variant="secondary"
                        onClick={onClose}
                        disabled={processing}
                        className="w-full"
                    >
                        {paymentInfo ? 'Close' : 'Cancel'}
                    </CustomButton>
                </div>
            </form>
            {message && (
                <p className="mt-4 rounded-md bg-danger-normal/20 p-2 text-center text-xs text-danger-normal">
                    {message}
                </p>
            )}
        </>
    );
};

export default Checkout;
