import IntegratedTabs from '@/Components/magic/customer_settings/_partial/IntegratedTabs';
import BillingInfo from '@/Components/magic/customer_settings/BillingInfo';
import Notifications from '@/Components/magic/customer_settings/Notifications';
import PasswordChange from '@/Components/magic/customer_settings/PasswordChange';
import PaymentHistory from '@/Components/magic/customer_settings/PaymentHistory';
// import PaymentMethods from '@/Components/magic/customer_settings/PaymentMethods';
import Preferences from '@/Components/magic/customer_settings/Preferences';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { AppointmentStatusProps } from '@/types/custom_types';
import { Head } from '@inertiajs/react';
import { Bell, CreditCard, Settings, Shield } from 'lucide-react';
import { useState } from 'react';

type SettingsTab = {
    title: string;
    icon: React.ReactNode;
    sections: React.ReactNode[];
};

interface SettingsProps {
    payment_methods: {
        id: number;
        last4: string;
        expiry: string;
        brand: string;
        is_default: boolean;
        is_active: boolean;
    }[];
    customer_profile: {
        billing_city: string;
        billing_zip: string;
        billing_location: string;
        billing_name: string;
        billing_email: string;
    };
    preferences?: {
        preferred_time: string;
        preferred_stylist: string;
        use_location: boolean;
        auto_rebooking: boolean;
        enable_mobile_appointment: boolean;
        email_reminders: boolean;
        sms_reminders: boolean;
        phone_reminders: boolean;
        language: string;
        currency: string;
    };
    notifications: {
        booking_confirmation: boolean;
        appointment_reminders: boolean;
        favorite_stylist_update: boolean;
        promotions_offers: boolean;
        review_reminders: boolean;
        payment_confirmations: boolean;
        email_notifications: boolean;
        push_notifications: boolean;
        sms_notifications: boolean;
    };
    payment_history: {
        id: number;
        name: string;
        service: string;
        paymentMethod: string;
        amount: number;
        status: AppointmentStatusProps;
        date: string;
        imageUrl?: string;
    }[];
}

const CustomerSettings = ({
    // payment_methods,
    customer_profile,
    preferences,
    notifications,
    payment_history,
}: SettingsProps) => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs: SettingsTab[] = [
        {
            title: 'Security',
            icon: <Shield size={16} />,
            sections: [
                //Security tab
                <PasswordChange key={1} />,
            ],
        },
        {
            title: 'Billing Info',
            icon: <CreditCard size={16} />,
            sections: [
                // Payment method
                // <PaymentMethods payment_methods={payment_methods} key={1} />,
                <BillingInfo customer_profile={customer_profile} key={2} />,
            ],
        },
        {
            title: 'Preferences',
            icon: <Settings size={16} />,
            sections: Preferences({ preferences }),
        },
        {
            title: 'Notifications',
            icon: <Bell size={16} />,
            sections: Notifications({ notifications }),
        },
        {
            title: 'Payment History',
            icon: <Bell size={16} />,
            sections: [
                // new sections
                <PaymentHistory payment_history={payment_history} key={1} />,
            ],
        },
        // {
        //     title: 'Report and Feedback',
        //     icon: <Bell size={16} />,
        //     sections: [
        //         // new sections
        //         null,
        //     ],
        // },
    ];

    const routes = [
        {
            name: 'Dashboard',
            path: route('dashboard'),
            active: true,
        },
        {
            name: 'Settings',
            path: route('customer.settings'),
            active: false,
        },
        {
            name: tabs[activeTab].title,
            path: '',
            active: false,
        },
    ];

    return (
        <AuthenticatedLayout
            showToExplore={false}
            exploreRoute={{ name: 'Back to Explore', path: route('dashboard') }}
            navigation={routes}
        >
            <Head title="Settings" />
            <IntegratedTabs
                tabs={tabs}
                showIcons={false}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </AuthenticatedLayout>
    );
};

export default CustomerSettings;
