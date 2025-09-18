import AddressInput from '@/Components/common/forms/AddressInput';
import InputLabel from '@/Components/InputLabel';
import TextareaInput from '@/Components/TextareaInput';
import TextInput from '@/Components/TextInput';
import { cn } from '@/lib/utils';
import { PageProps } from '@/types';

export default function BillingInfo({
    customer_profile,
    extra,
    setExtra,
    setAddress,
    address,
    enableCreate,
}: PageProps<{
    customer_profile: { billing_name: string; billing_email: string };
    extra: string;
    setExtra: (value: string) => void;
    setAddress: (value: string) => void;
    address: string;
    enableCreate: boolean;
}>) {
    return (
        <div className="w-fuull rounded-lg">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-sf-black md:text-xl">
                    Your Information
                </h2>
            </div>
            <form>
                <div className="mt-4 grid w-full gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel
                            htmlFor="name"
                            value="Full Name"
                            isRequired={true}
                        />
                        <TextInput
                            id="name"
                            name="name"
                            value={customer_profile.billing_name}
                            className="mt-1 block w-full"
                            autoComplete="name"
                            isFocused={false}
                            required
                            readOnly={true}
                        />
                    </div>
                    <div>
                        <InputLabel
                            htmlFor="email"
                            value="Email"
                            isRequired={true}
                        />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={customer_profile.billing_email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            required
                            readOnly={true}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <InputLabel
                        htmlFor="address"
                        value="Your Location"
                        isRequired={true}
                    />
                    {enableCreate ? (
                        <AddressInput
                            enableCreate={enableCreate}
                            setAddress={setAddress}
                            address={address}
                        />
                    ) : (
                        <TextInput
                            id="address"
                            name="address"
                            value={address}
                            className="mt-1 block w-full"
                            required
                            readOnly={true}
                        />
                    )}
                </div>
                <div
                    className={cn('mt-4', !enableCreate && !extra && 'hidden')}
                >
                    <InputLabel
                        htmlFor="about"
                        value={
                            'Special Requests or Notes' +
                            (enableCreate ? ' (Optional)' : '')
                        }
                    />
                    <TextareaInput
                        id="bio"
                        name="bio"
                        value={extra}
                        className="mt-1 block w-full"
                        placeholder="Any special request or additional information"
                        isFocused={false}
                        onChange={(e) => setExtra(e.target.value)}
                        readOnly={!enableCreate}
                    />
                </div>
            </form>
        </div>
    );
}
