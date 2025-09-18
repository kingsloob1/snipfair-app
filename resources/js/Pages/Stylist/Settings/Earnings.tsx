import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import PaymentSetting from '../Earnings/_Partials/PaymentSetting';

interface SettingsProps {
    settings: {
        payout_day: string;
        payout_frequency: string;
        automatic_payout: boolean;
        instant_payout: boolean;
    };
}

export default function Settings({ settings }: SettingsProps) {
    const routes = [
        {
            name: 'Dashboard',
            path: route('stylist.dashboard'),
            active: true,
        },
        {
            name: 'Account Settings',
            path: route('stylist.account.settings'),
            active: true,
        },
        {
            name: 'Payout Settings',
            path: '',
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Settings">
            <StylistNavigationSteps
                routes={routes}
                sub="Configure your automatic payout preferences"
            />
            <section className="mx-auto max-w-7xl px-5">
                <PaymentSetting settings={settings} />
            </section>
        </StylistAuthLayout>
    );
}
