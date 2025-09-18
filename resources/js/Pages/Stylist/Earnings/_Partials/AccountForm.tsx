import CustomInput from '@/Components/common/forms/CustomInput';
import { useEffect, useMemo, useState } from 'react';

interface AccountDetails {
    account_name: string;
    account_number: string;
    bank_name: string;
    routing_number: string;
    amount: string;
    method: string;
    type: string;
}

interface AccountFormProps {
    data: AccountDetails;
    setData:
        | ((field: keyof AccountDetails, value: string) => void)
        | ((data: Partial<AccountDetails>) => void)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | ((field: keyof AccountDetails, value: any) => void);
    clearErrors: (...fields: (keyof AccountDetails)[]) => void;
    errors: Partial<Record<keyof AccountDetails, string>>;
}

const AccountForm = ({
    data,
    setData,
    clearErrors,
    errors,
}: AccountFormProps) => {
    const [hasBranchCode, setHasBranchCode] = useState(false);

    const bankOptions = useMemo(
        () => [
            // Major/Commercial Banks
            { name: 'Absa Bank', branchCode: '632005' },
            { name: 'African Bank', branchCode: '430000' },
            { name: 'Bidvest Bank', branchCode: '462005' },
            { name: 'Capitec Bank', branchCode: '470010' },
            { name: 'Discovery Bank', branchCode: '679000' },
            { name: 'FirstRand Bank (FNB)', branchCode: '250655' },
            { name: 'Investec Bank', branchCode: '580105' },
            { name: 'Nedbank', branchCode: '198765' },
            { name: 'Sasfin Bank', branchCode: '683000' },
            { name: 'Standard Bank', branchCode: '051001' },
            { name: 'TymeBank', branchCode: '678910' },
            { name: 'Ubank', branchCode: '431010' },
            { name: 'Grindrod Bank', branchCode: '584000' },

            // Foreign Banks/Local Branches
            { name: 'Access Bank South Africa', branchCode: '410105' },
            { name: 'Albaraka Bank', branchCode: '800000' },
            { name: 'Bank of China', branchCode: '431000' },
            { name: 'Citibank', branchCode: '350000' },
            { name: 'HBZ Bank (Habib Bank AG Zurich)', branchCode: '570000' },
            { name: 'ICBC', branchCode: '495000' },
            { name: 'Société Générale', branchCode: '306009' },
            {
                name: 'China Construction Bank Johannesburg Branch',
                branchCode: null,
            },
            { name: 'Bank of Taiwan South Africa Branch', branchCode: null },
            {
                name: 'JPMorgan Chase Bank, N.A., Johannesburg Branch',
                branchCode: '432000',
            },
            {
                name: 'Standard Chartered Bank Johannesburg Branch',
                branchCode: '730000',
            },
            {
                name: 'HSBC Bank plc - Johannesburg Branch',
                branchCode: '587000',
            },
            {
                name: 'State Bank of India South Africa Branch',
                branchCode: '801000',
            },

            // Mutual Banks
            { name: 'Bank Zero', branchCode: null },
            { name: 'Finbond Mutual Bank', branchCode: null },
            { name: 'GBS Mutual Bank', branchCode: null },
            { name: 'YWBN Mutual Bank', branchCode: null },

            // Co-operative Banks
            { name: 'Ditsobotla Primary Co-operative Bank', branchCode: null },
            { name: 'GIG Co-operative Bank', branchCode: null },
            { name: 'KSK Koöperatiewe Bank', branchCode: null },
            { name: 'OSK Koöperatiewe Bank', branchCode: null },
            { name: 'Ziphakamise Co-operative Bank', branchCode: null },
        ],
        [],
    );

    // Check if current bank has a branch code when data changes (for edit mode)
    useEffect(() => {
        if (data.bank_name) {
            const bank = bankOptions.find(
                (bank) => bank.name === data.bank_name,
            );
            if (bank && bank.branchCode) {
                setHasBranchCode(true);
            } else {
                setHasBranchCode(false);
            }
        }
    }, [data.bank_name, bankOptions]);

    const handleBankChange = (value: string) => {
        const bank = bankOptions.find((bank) => bank.name === value);
        setData('bank_name', value);
        clearErrors('bank_name');

        if (bank) {
            if (bank.branchCode) {
                setHasBranchCode(true);
                setData('routing_number', bank.branchCode);
            } else {
                setHasBranchCode(false);
                setData('routing_number', '');
            }
        } else {
            setHasBranchCode(false);
            setData('routing_number', '');
        }
    };

    return (
        <div className="space-y-4">
            {/* Account Holder Name */}
            <div>
                <CustomInput
                    className="w-full px-2 py-2 text-sm"
                    label="Account Holder Name"
                    name="account_name"
                    value={data.account_name}
                    placeholder=""
                    onChange={(e) => setData('account_name', e.target.value)}
                    error={errors.account_name}
                    handleFocus={() => clearErrors('account_name')}
                    isRequired={true}
                />
            </div>

            {/* Bank Name */}
            <div>
                <CustomInput
                    inputType="custom-select"
                    label="Bank Name"
                    name="bank_name"
                    placeholder="Bank Name"
                    value={data.bank_name}
                    onPhoneChange={handleBankChange}
                    className="rounded-md border border-sf-stroke bg-transparent p-2 text-sm shadow-sm focus-within:border-2 focus-within:border-sf-primary focus-within:ring-sf-primary"
                    isRequired={true}
                    error={errors.bank_name}
                    selectOptions={bankOptions.map((bank) => ({
                        label: String(bank.name),
                        value: String(bank.name),
                    }))}
                />
            </div>

            {/* Account Number */}
            <div>
                <CustomInput
                    className="w-full px-2 py-2 text-sm"
                    label="Account Number"
                    name="account_number"
                    value={data.account_number}
                    placeholder=""
                    onChange={(e) => setData('account_number', e.target.value)}
                    error={errors.account_number}
                    handleFocus={() => clearErrors('account_number')}
                    isRequired={true}
                />
            </div>

            {/* Routing Number */}
            <div>
                <CustomInput
                    className={`w-full px-2 py-2 text-sm ${hasBranchCode ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    label="Branch Code"
                    name="routing_number"
                    value={data.routing_number}
                    placeholder={
                        hasBranchCode
                            ? 'Auto-filled from selected bank'
                            : 'Enter branch code'
                    }
                    onChange={(e) => {
                        if (!hasBranchCode) {
                            setData('routing_number', e.target.value);
                        }
                    }}
                    error={errors.routing_number}
                    handleFocus={() => {
                        if (!hasBranchCode) {
                            clearErrors('routing_number');
                        }
                    }}
                    isRequired={true}
                    isDisabled={hasBranchCode}
                />
            </div>
        </div>
    );
};

export default AccountForm;
