import { StatCard } from '@/Components/magic/_partial/StatCard';
import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
import { StylistAuthLayout } from '@/Layouts/StylistAuthLayout';
import { EarningProps } from '@/types/custom_types';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import EarningModal from './_Partials/EarningModal';
import EarningsTable from './_Partials/EarningsTable';
import PayoutSettings from './_Partials/PayoutSetting';

export default function Index({
    statistics,
    payment_method,
    payment_methods,
    settings,
    transactions,
}: EarningProps) {
    const [isOpen, setIsOpen] = useState(false);
    const routes = [
        {
            name: 'Earnings & Payouts',
            path: route('stylist.earnings'),
            active: false,
        },
    ];

    return (
        <StylistAuthLayout header="Stylist Earnings">
            <StylistNavigationSteps
                routes={routes}
                sub="Here's what's happening with your business today"
                cta="Request Payout"
                ctaAction={() => {
                    setIsOpen(true);
                }}
            />
            <section className="mx-auto max-w-7xl px-5">
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <StatCard
                        title="Total Earned"
                        value={`R${statistics.total_earnings.value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        period="All time"
                        variant="gradient"
                        change={{
                            value: Math.abs(
                                statistics.total_earnings.change_percentage,
                            ),
                            text: statistics.total_earnings.change_text,
                            isPositive: statistics.total_earnings.is_positive,
                        }}
                    />
                    <StatCard
                        title="Available Balance"
                        value={`R${statistics.total_balance.value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        period="Current"
                        change={{
                            value: Math.abs(
                                statistics.total_balance.change_percentage,
                            ),
                            text: statistics.total_balance.change_text,
                            isPositive: statistics.total_balance.is_positive,
                        }}
                    />
                    <StatCard
                        title="Total Withdrawn"
                        value={`R${statistics.total_withdrawn.value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        period="All time"
                        change={{
                            value: Math.abs(
                                statistics.total_withdrawn.change_percentage,
                            ),
                            text: statistics.total_withdrawn.change_text,
                            isPositive: statistics.total_withdrawn.is_positive,
                        }}
                    />
                    <StatCard
                        title="Pending Requests"
                        value={statistics.total_requests.value.toString()}
                        period="Current"
                        change={{
                            value: 0,
                            text: statistics.total_requests.change_text,
                            isPositive: statistics.total_requests.is_positive,
                        }}
                    />
                </div>
                <PayoutSettings
                    payment_method={payment_method}
                    settings={settings}
                    onEditBankAccount={() =>
                        router.visit(route('stylist.earnings.methods'))
                    }
                    onChangeSettings={() =>
                        router.visit(route('stylist.earnings.settings'))
                    }
                />
                <EarningsTable requestData={transactions} />
                <EarningModal
                    variant="request"
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    payment_methods={payment_methods}
                />
            </section>
        </StylistAuthLayout>
    );
}
