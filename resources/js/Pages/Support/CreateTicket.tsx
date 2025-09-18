import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Info, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function CreateTicket() {
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        description: '',
        priority: 'medium',
    });

    const routes = [
        {
            name: 'Dashboard',
            path: route('dashboard'),
            active: false,
        },
        {
            name: 'Support',
            path: route('tickets.index'),
            active: false,
        },
        {
            name: 'New Ticket',
            path: '#',
            active: true,
        },
    ];

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('tickets.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout navigation={routes}>
            <Head title="Create Support Ticket" />

            <section className="mx-auto max-w-3xl px-5 py-6 md:py-8">
                <div className="mb-8">
                    <Link
                        href={route('tickets.index')}
                        className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tickets
                    </Link>

                    <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                        Create Support Ticket
                    </h1>
                    <p className="text-gray-600">
                        Tell us about your issue and we'll help you resolve it
                        quickly.
                    </p>
                </div>

                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex gap-3">
                        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                        <div>
                            <h3 className="mb-1 font-medium text-blue-900">
                                Before you submit
                            </h3>
                            <ul className="space-y-1 text-sm text-blue-800">
                                <li>
                                    • Check our FAQ section for common solutions
                                </li>
                                <li>
                                    • Provide detailed information about your
                                    issue
                                </li>
                                <li>
                                    • Include steps to reproduce the problem if
                                    applicable
                                </li>
                                <li>
                                    • Our support team typically responds within
                                    2-4 hours
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.subject}
                                onChange={(e) =>
                                    setData('subject', e.target.value)
                                }
                                placeholder="Brief description of your issue"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.subject && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.subject}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Priority
                            </label>
                            <select
                                value={data.priority}
                                onChange={(e) =>
                                    setData('priority', e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="risky">Critical</option>
                            </select>
                            {errors.priority && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.priority}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Please provide detailed information about your issue..."
                                rows={6}
                                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <Link
                                href={route('tickets.index')}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-center text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.subject.trim() ||
                                    !data.description.trim()
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium text-gray-900">
                        💡 Quick Tips
                    </h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                        <li>
                            • For urgent issues, choose "High" or "Critical"
                            priority
                        </li>
                        {/* <li>
                            • Include screenshots or error messages when
                            possible
                        </li> */}
                        <li>
                            • Mention your browser and device type for technical
                            issues
                        </li>
                        <li>
                            • You'll receive email notifications when we respond
                        </li>
                    </ul>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
