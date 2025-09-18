import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
import {
    Calendar,
    CreditCard,
    ImagePlay,
    NotepadText,
    Settings2,
    Shield,
    StarsIcon,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import AppointmentConfig from './_Includes/AppointmentConfig';
import BookingConfig from './_Includes/BookingConfig';
import GeneralConfig from './_Includes/GeneralConfig';
import IntegratedTabs from './_Includes/IntegratedTabs';
import ManageCategories from './_Includes/ManageCategories';
import ManagePayments from './_Includes/ManagePayments';
import ManagePlans from './_Includes/ManagePlans';
import NotificationConfig from './_Includes/NotificationConfig';
import PasswordChange from './_Includes/PasswordChange';
import TermsPolicyCookie from './_Includes/TermsPolicyCookie';
import UserStatisticsConfig from './_Includes/UserStatisticsConfig';

type SettingsTab = {
    title: string;
    icon: React.ReactNode;
    sections: React.ReactNode[];
};

interface SettingsProps {
    settings: {
        id: number;
        terms?: string | null;
        privacy_policy?: string | null;
        cookies?: string | null;
        email_verification: boolean;
        two_factor_auth: boolean;
        min_booking_amount: number;
        max_booking_amount: number;
        allow_registration_stylists: boolean;
        allow_registration_customers: boolean;
        maintenance_mode: boolean;
        maintenance_message?: string;
        email_notifications: boolean;
        push_notifications: boolean;
        system_alerts: boolean;
        payment_alerts: boolean;
        content_moderation: boolean;
        appointment_reschedule_threshold: number;
        appointment_reschedule_percentage: number;
        appointment_canceling_threshold: number;
        appointment_canceling_percentage: number;
        updated_by?: number | null;
        created_at: Date | string;
        updated_at: Date | string;
        professional_stylists: number;
        happy_customers: number;
        services_completed: number;
        customer_satisfaction: number;
    };
    plans: {
        id: number;
        name: string;
        amount: number;
        duration: number;
        status: boolean;
        created_at: Date | string;
        updated_at: Date | string;
    }[];
    payment_methods: {
        id: number;
        updated_by?: number | null;
        account_number: string;
        account_name: string;
        bank_name: string;
        routing_number: string;
        is_default: boolean;
        is_active: boolean;
    }[];
    categories: {
        name: string;
        description: string;
        status: boolean;
        banner: string;
        image_url?: string;
    }[];
}

const AdminSettings = ({
    settings,
    plans,
    payment_methods,
    categories,
}: SettingsProps) => {
    console.log(settings);
    const [activeTab, setActiveTab] = useState(0);
    const tabs: SettingsTab[] = [
        {
            title: 'General',
            icon: <Settings2 size={16} />,
            sections: [<GeneralConfig config={settings} key={2} />],
        },
        {
            title: 'Terms & Policy',
            icon: <NotepadText size={16} />,
            sections: [<TermsPolicyCookie configs={settings} key={1} />],
        },
        {
            title: 'Security',
            icon: <Shield size={16} />,
            sections: [
                <BookingConfig config={settings} key={2} />,
                <PasswordChange key={1} />,
            ],
        },
        {
            title: 'Preferences',
            icon: <StarsIcon size={16} />,
            sections: [<NotificationConfig config={settings} key={1} />],
        },
        {
            title: 'Appointments',
            icon: <Calendar size={16} />,
            sections: [<AppointmentConfig config={settings} key={1} />],
        },
        {
            title: 'Payment Method',
            icon: <CreditCard size={16} />,
            sections: [
                <ManagePayments payment_methods={payment_methods} key={1} />,
            ],
        },
        {
            title: 'Subscription Plans',
            icon: <CreditCard size={16} />,
            sections: [<ManagePlans plans={plans} key={1} />],
        },
        {
            title: 'Services',
            icon: <ImagePlay size={16} />,
            sections: [<ManageCategories categories={categories} key={1} />],
        },
        {
            title: 'User Statistics',
            icon: <TrendingUp size={16} />,
            sections: [<UserStatisticsConfig config={settings} key={1} />],
        },
    ];

    const routes = [
        {
            name: 'Settings',
            path: route('admin.settings'),
            active: false,
        },
        {
            name: tabs[activeTab].title,
            path: '',
            active: false,
        },
    ];

    return (
        <AdminAccountLayout header="Admin Settings">
            <StylistNavigationSteps
                routes={routes}
                sub="Managing all website settings and configurations"
            />
            <IntegratedTabs
                tabs={tabs}
                showIcons={true}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </AdminAccountLayout>
    );
};

export default AdminSettings;
