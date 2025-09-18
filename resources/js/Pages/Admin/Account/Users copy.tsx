// import { StatCard } from '@/Components/magic/_partial/StatCard';
// import { StylistNavigationSteps } from '@/Components/magic/StylistNavigationSteps';
// import { AdminAccountLayout } from '@/Layouts/AdminAccountLayout';
// import DashboardCharts from './_Includes/DashboardCharts';
// import PayoutRequests from './_Includes/PayoutRequests';

// export default function Users({
//     statistics,
//     manageTransactions,
//     manageSubscriptions,
//     managePayouts,
// }) {
//     const routes = [
//         {
//             name: 'Dashboard',
//             path: route('stylist.dashboard'),
//             active: false,
//         },
//     ];

//     const formatCurrency = (amount: number) => {
//         return new Intl.NumberFormat('en-US', {
//             style: 'currency',
//             currency: 'USD',
//         }).format(amount);
//     };

//     const formatNumber = (num: number) => {
//         return new Intl.NumberFormat('en-US').format(num);
//     };

//     return (
//         <AdminAccountLayout header="Admin Dashboard">
//             <StylistNavigationSteps
//                 routes={routes}
//                 sub="Here's what's happening with your platform today"
//             />
//             <section className="mx-auto max-w-7xl px-5">
//                 <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
//                     <StatCard
//                         title="Total Users"
//                         value={formatNumber(statistics.total_users)}
//                         period="All time"
//                         change={{
//                             value: statistics.growth_rate,
//                             text:
//                                 statistics.growth_rate >= 0
//                                     ? 'Growth this month'
//                                     : 'Decline this month',
//                             isPositive: statistics.growth_rate >= 0,
//                         }}
//                     />
//                     <StatCard
//                         title="Total Bookings"
//                         value={formatNumber(statistics.total_bookings)}
//                         period="All time"
//                         change={{
//                             value: 0,
//                             text: 'Total platform bookings',
//                             isPositive: true,
//                         }}
//                     />
//                     <StatCard
//                         title="Platform Revenue"
//                         value={formatCurrency(statistics.platform_revenue)}
//                         period="All time"
//                         change={{
//                             value: statistics.revenue_growth,
//                             text:
//                                 statistics.revenue_growth >= 0
//                                     ? 'Up from last month'
//                                     : 'Down from last month',
//                             isPositive: statistics.revenue_growth >= 0,
//                         }}
//                     />
//                     <StatCard
//                         title="Growth Rate"
//                         value={`${statistics.growth_rate}%`}
//                         period="This Month"
//                         change={{
//                             value: statistics.growth_rate,
//                             text: 'User growth rate',
//                             isPositive: statistics.growth_rate >= 0,
//                         }}
//                     />
//                 </div>
//                 <DashboardCharts chartData={chartData} />
//                 <PayoutRequests requests={payoutRequests} />
//             </section>
//         </AdminAccountLayout>
//     );
// }
