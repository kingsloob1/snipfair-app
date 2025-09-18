import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
// import PaymentSetting from '../Earnings/_Partials/PaymentSetting';
import PasswordChange from '@/Components/magic/customer_settings/PasswordChange';

export default function Settings() {
    const routes = [
        {
            name: 'Dashboard',
            path: route('stylist.dashboard'),
            active: true,
        },
        {
            name: 'Payout Settings',
            path: route('stylist.earnings.settings'),
            active: true,
        },
        {
            name: 'Account Settings',
            path: '',
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Settings">
            <StylistNavigationSteps
                routes={routes}
                sub="Update your account password to enhance security"
            />
            <section className="mx-auto max-w-7xl px-5">
                {/* <PaymentSetting settings={settings} /> */}
                <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <PasswordChange />
                </div>
            </section>
        </StylistAuthLayout>
    );
}
