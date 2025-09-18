import CustomButton from '@/Components/common/CustomButton';
import CountrySelect from '@/Components/CountrySelect';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextareaInput from '@/Components/TextareaInput';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Form() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        country: '',
        message: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('contact.send'), {
            onFinish: () => reset(),
        });
    };
    return (
        <form
            onSubmit={submit}
            className="flex flex-col gap-4 rounded-xl border border-sf-stroke bg-sf-white p-5 md:gap-6 md:p-8"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <div>
                    <InputLabel
                        htmlFor="name"
                        value="Full Name"
                        isRequired={true}
                    />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
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
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="phone" value="Phone" />
                    <TextInput
                        id="phone"
                        name="phone"
                        value={data.phone}
                        className="mt-1 block w-full"
                        autoComplete="phone"
                        isFocused={true}
                        onChange={(e) => setData('phone', e.target.value)}
                        required
                    />
                    <InputError message={errors.phone} className="mt-2" />
                </div>
                <div>
                    <InputLabel htmlFor="country" value="Country" />
                    <CountrySelect
                        value={data.country}
                        onChange={(country) => setData('country', country)}
                        className="mt-1 block w-full"
                    />
                    <InputError message={errors.country} className="mt-2" />
                </div>
            </div>
            <div>
                <InputLabel
                    htmlFor="message"
                    value="Your Message"
                    isRequired={true}
                />
                <TextareaInput
                    id="message"
                    name="message"
                    value={data.message}
                    className="mt-1 block w-full"
                    placeholder="Hi..."
                    isFocused={true}
                    onChange={(e) => setData('message', e.target.value)}
                    required
                />
                <InputError message={errors.message} className="mt-2" />
            </div>
            <div className="flex justify-end">
                <CustomButton
                    type="submit"
                    className="w-44"
                    loading={processing}
                    disabled={processing}
                >
                    Send your message
                </CustomButton>
            </div>
        </form>
    );
}
