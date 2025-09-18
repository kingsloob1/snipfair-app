import CustomButton from '@/Components/common/CustomButton';
import { useForm } from '@inertiajs/react';
import ToggleSwitch from './ToggleSwitch';

const NotificationConfig = ({
    config,
}: {
    config: {
        email_notifications: boolean;
        push_notifications: boolean;
        system_alerts: boolean;
        payment_alerts: boolean;
        content_moderation: boolean;
    };
}) => {
    const { data, setData, processing, put, clearErrors } = useForm({
        email_notifications: config.email_notifications,
        push_notifications: config.push_notifications,
        system_alerts: config.system_alerts,
        payment_alerts: config.payment_alerts,
        content_moderation: config.content_moderation,
    });

    const submit = () => {
        put(route('admin.settings.updateAdminConfig'), {
            onSuccess: () => {
                clearErrors();
            },
        });
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
                Notification Preferences
            </h2>
            <div className="mb-5 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Email Notifications
                        </h3>
                        <p className="text-sm text-gray-500">
                            Receive notifications via email
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.email_notifications}
                        onChange={(value) =>
                            setData('email_notifications', value)
                        }
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Push Notifications
                        </h3>
                        <p className="text-sm text-gray-500">
                            Browser push notifications
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.push_notifications}
                        onChange={(value) =>
                            setData('push_notifications', value)
                        }
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            System Alerts
                        </h3>
                        <p className="text-sm text-gray-500">
                            Critical system notifications
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.system_alerts}
                        onChange={(value) => setData('system_alerts', value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Payment Alerts
                        </h3>
                        <p className="text-sm text-gray-500">
                            Payment and transaction notifications
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.payment_alerts}
                        onChange={(value) => setData('payment_alerts', value)}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            Content Moderation
                        </h3>
                        <p className="text-sm text-gray-500">
                            Content review and moderation alerts
                        </p>
                    </div>
                    <ToggleSwitch
                        enabled={data.content_moderation}
                        onChange={(value) =>
                            setData('content_moderation', value)
                        }
                    />
                </div>
            </div>
            <div className="flex items-end justify-end">
                <div className="div">
                    <CustomButton
                        variant="black"
                        onClick={submit}
                        disabled={processing}
                        className="w-full md:w-52"
                        type="submit"
                    >
                        {processing
                            ? 'Updating Settings...'
                            : 'Update Settings'}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default NotificationConfig;
//payment_methods,categories,plans
