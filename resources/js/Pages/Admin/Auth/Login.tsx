import CustomButton from '@/Components/common/CustomButton';
import CustomInput from '@/Components/common/forms/CustomInput';
import LogoWrapper from '@/Components/common/LogoWrapper';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import AdminAuthLayout from '@/Layouts/AdminAuthLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FocusEvent, FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, toggleEyeIcon] = useState(false);
    const { data, setData, post, processing, errors, clearErrors, reset } =
        useForm({
            email: '',
            password: '',
            remember: false as boolean,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('admin.login'), {
            onFinish: () => reset('password'),
        });
    };

    const handleFocus = (
        event: FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>,
    ) => {
        let el: 'email' | 'password' | 'remember';
        clearErrors(event.target.name as typeof el);
    };

    return (
        <AdminAuthLayout className="w-full max-w-md p-5 md:p-8 lg:max-w-xl">
            <Head title="Log in" />

            <main className="space-y-5">
                <div className="mb-8">
                    <LogoWrapper
                        title="Admin Panel"
                        subtitle="Log into as Snipfair admin"
                    />
                </div>
                <form onSubmit={submit} className="space-y-5">
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}
                    <CustomInput
                        className="w-full px-2 py-2"
                        label="Email"
                        name="email"
                        value={data.email}
                        placeholder="example@mail.com"
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                        handleFocus={handleFocus}
                        isRequired={true}
                    />
                    <CustomInput
                        className="w-full px-2 py-2"
                        label="Password"
                        inputType="password"
                        showEyeIcon={true}
                        showPassword={showPassword}
                        toggleEyeIcon={toggleEyeIcon}
                        name="password"
                        value={data.password}
                        placeholder="Your password"
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                        handleFocus={handleFocus}
                        isRequired={true}
                    />
                    <div className="flex items-center justify-between gap-2 p-2 pl-0">
                        <Label
                            htmlFor="checkbox"
                            className="flex cursor-pointer items-center gap-2 font-inter text-sm font-normal"
                        >
                            <Checkbox
                                id="checkbox"
                                className="h-5 w-5 border-2 border-sf-stroke bg-sf-white text-sf-white data-[state=checked]:bg-sf-primary"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => {
                                    setData('remember', checked === true);
                                }}
                            ></Checkbox>
                            <span className="text-sf-black-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Remember me
                            </span>
                        </Label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-sf-primary no-underline transition-all duration-200 hover:text-sf-primary-hover hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <CustomButton
                            type="submit"
                            loading={processing}
                            disabled={processing}
                        >
                            Log in
                        </CustomButton>
                    </div>
                </form>
            </main>
        </AdminAuthLayout>
    );
}
