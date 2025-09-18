import CustomInput from '@/Components/common/forms/CustomInput';
import { PaymentMethod } from '@/types/custom_types';

interface AccountDetails {
    amount: string;
    method: string;
}

interface AccountFormProps {
    data: AccountDetails;
    setData: (field: keyof AccountDetails, value: string) => void;
    clearErrors: (...fields: (keyof AccountDetails)[]) => void;
    errors: Partial<Record<keyof AccountDetails, string>>;
    payment_methods: PaymentMethod[];
}

const PayoutForm = ({
    data,
    setData,
    clearErrors,
    errors,
    payment_methods,
}: AccountFormProps) => {
    return (
        <div className="space-y-4">
            <div>
                <CustomInput
                    className="w-full px-2 py-2 text-sm"
                    label="Withdrawal Amount (R)"
                    name="amount"
                    value={data.amount}
                    placeholder=""
                    onChange={(e) => setData('amount', e.target.value)}
                    error={errors.amount}
                    handleFocus={() => clearErrors('amount')}
                    isRequired={true}
                />
            </div>

            <div>
                <CustomInput
                    inputType="custom-select"
                    label="Payout Method"
                    name="account"
                    placeholder="Payment Method"
                    value={data.method}
                    onPhoneChange={(value) => setData('method', value)}
                    className="rounded-md border border-sf-stroke bg-transparent p-2 text-sm shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                    isRequired={true}
                    error={errors.method}
                    selectOptions={payment_methods.map((method) => ({
                        label: String(method.bank + ' ' + method.account),
                        value: String(method.id),
                    }))}
                />
            </div>
        </div>
    );
};

export default PayoutForm;
