import CustomButton from '@/Components/common/CustomButton';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { PageProps, User } from '@/types';
import { usePage } from '@inertiajs/react';
import { Calendar, CheckCircle, Crown, Star } from 'lucide-react';
import { useState } from 'react';
import SubscriptionPaymentModal from './_Partial/SubscriptionPaymentModal';

interface Plan {
    id: number;
    name: string;
    description: string;
    amount: string;
    duration: number;
    status: number;
}

interface SubscriptionPageProps extends PageProps {
    plans: Plan[];
}

export default function Subscription() {
    const { auth, plans } = usePage<SubscriptionPageProps>().props;
    const user = auth.user as User & {
        plan: string | null;
        subscription_status: 'active' | 'pending' | 'expired' | 'inactive';
        subscription_expiry?: string;
    };
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const routes = [
        {
            name: 'Dashboard',
            path: route('stylist.dashboard'),
            active: true,
        },
        {
            name: 'Subscriptions',
            path: '',
            active: false,
        },
    ];
    console.log(plans);

    const handleSubscribeClick = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const getButtonText = (plan: Plan) => {
        if (user.subscription_status === 'inactive') {
            return 'Subscribe';
        }

        if (user.plan === plan.name) {
            return 'Current Plan';
        }

        if (
            (plan.name === 'Premium Plan' && user.plan === 'Basic Plan') ||
            (plan.name === 'Basic Plan' && user.plan === 'Free Plan')
        ) {
            return 'Upgrade';
        }

        return 'Subscribe';
    };

    const isButtonDisabled = (plan: Plan) => {
        if (
            user.subscription_status === 'active' ||
            user.subscription_status === 'pending'
        ) {
            if (user.plan === plan.name) return true;
            if (user.plan === 'Premium Plan') return true;
        }
        return false;
    };

    const formatExpiryDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getBadgeColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <StylistAuthLayout header="Manage Subscriptions">
            <StylistNavigationSteps
                routes={routes}
                sub="Manage your subscription plans and billing"
            />
            <section className="mx-auto max-w-7xl px-5">
                {/* Current Plan Status */}
                <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-sf-black md:text-2xl">
                                Current Plan
                            </h2>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    {user.plan === 'Premium Plan' ? (
                                        <Crown className="h-5 w-5 text-yellow-500" />
                                    ) : (
                                        <Star className="h-5 w-5 text-blue-500" />
                                    )}
                                    <span className="text-lg font-medium text-sf-black">
                                        {user.plan || 'No Active Plan'}
                                    </span>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${getBadgeColor(
                                        user.subscription_status,
                                    )}`}
                                >
                                    {user.subscription_status
                                        .charAt(0)
                                        .toUpperCase() +
                                        user.subscription_status.slice(1)}
                                </span>
                            </div>
                            {user.subscription_expiry && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-sf-secondary-paragraph">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {user.subscription_status === 'active'
                                            ? 'Expires on: '
                                            : 'Expired on: '}
                                        {formatExpiryDate(
                                            user.subscription_expiry,
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subscription Plans */}
                <div className="grid gap-6 md:grid-cols-2">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                                user.plan === plan.name
                                    ? 'border-sf-primary bg-sf-primary/5'
                                    : 'border-sf-stroke bg-sf-white'
                            }`}
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        {plan.name === 'Premium Plan' ? (
                                            <Crown className="h-5 w-5 text-yellow-500" />
                                        ) : (
                                            <Star className="h-5 w-5 text-blue-500" />
                                        )}
                                        <h3 className="text-xl font-semibold text-sf-black">
                                            {plan.name}
                                        </h3>
                                    </div>
                                    {user.plan === plan.name && (
                                        <div className="mt-1 flex items-center gap-1 text-sm text-sf-primary">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Current Plan</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-sf-black">
                                        R{plan.amount}
                                    </div>
                                    <div className="text-sm text-sf-secondary-paragraph">
                                        {plan.name === 'Free Plan'
                                            ? 'Free always'
                                            : `per ${plan.duration} days`}
                                    </div>
                                </div>
                            </div>

                            <p className="mb-6 text-sf-secondary-paragraph">
                                {plan.description}
                            </p>

                            <div className="mb-6">
                                <h4 className="mb-3 font-medium text-sf-black">
                                    Features:
                                </h4>
                                <ul className="space-y-2 text-sm text-sf-secondary-paragraph">
                                    {plan.name === 'Basic Plan' ? (
                                        <>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Standard appointment booking
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Basic profile features
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Email support
                                            </li>
                                        </>
                                    ) : plan.name === 'Free Plan' ? (
                                        <>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Access to basic features.
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Premium appointment booking
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Enhanced profile visibility
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Priority support
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                Advanced analytics
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            <CustomButton
                                onClick={() => handleSubscribeClick(plan)}
                                disabled={isButtonDisabled(plan)}
                                variant={
                                    user.plan === plan.name
                                        ? 'secondary'
                                        : 'primary'
                                }
                                className="w-full"
                            >
                                {getButtonText(plan)}
                            </CustomButton>
                        </div>
                    ))}
                </div>
            </section>
            <SubscriptionPaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                plan={selectedPlan}
            />
        </StylistAuthLayout>
    );
}
