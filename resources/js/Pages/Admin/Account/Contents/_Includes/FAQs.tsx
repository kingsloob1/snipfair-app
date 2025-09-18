import { router } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import TextInput from '@/Components/TextInput';
import TextareaInput from '@/Components/TextareaInput';
import CustomButton from '@/Components/common/CustomButton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';

interface FAQ {
    id: number;
    question: string;
    answer: string;
    category: string;
    created_at: string;
}

interface FAQsProps {
    faqs: FAQ[];
}

const FAQs: React.FC<FAQsProps> = ({ faqs }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        router.post(route('admin.contents.faqs.store'), formData, {
            onSuccess: () => {
                setCreateModalOpen(false);
                setFormData({ question: '', answer: '', category: 'general' });
            },
            onFinish: () => setIsCreating(false),
        });
    };

    const handleEdit = (faq: FAQ) => {
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
        });
        setEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFaq) return;

        setIsEditing(editingFaq.id);
        router.patch(
            route('admin.contents.faqs.update', editingFaq.id),
            formData,
            {
                onSuccess: () => {
                    setEditModalOpen(false);
                    setEditingFaq(null);
                    setFormData({
                        question: '',
                        answer: '',
                        category: 'general',
                    });
                },
                onFinish: () => setIsEditing(null),
            },
        );
    };

    const handleDelete = (faqId: number) => {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            setIsDeleting(faqId);
            router.delete(route('admin.contents.faqs.delete', faqId), {
                onFinish: () => setIsDeleting(null),
            });
        }
    };

    const renderFAQForm = (isEdit = false) => (
        <form
            onSubmit={isEdit ? handleUpdate : handleCreate}
            className="space-y-4"
        >
            <div>
                <Label htmlFor="question">Question</Label>
                <TextInput
                    id="question"
                    value={formData.question}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, question: e.target.value })
                    }
                    placeholder="Enter the question"
                    className="w-full"
                    required
                />
            </div>

            <div>
                <Label htmlFor="answer">Answer</Label>
                <TextareaInput
                    id="answer"
                    value={formData.answer}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData({ ...formData, answer: e.target.value })
                    }
                    className="w-full"
                    placeholder="Enter the answer"
                    rows={4}
                    required
                />
            </div>

            <div>
                <Label htmlFor="category">Category</Label>
                <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                >
                    <option value="general">General</option>
                    <option value="booking">Booking</option>
                    <option value="payment">Payment</option>
                    <option value="stylist">Stylist</option>
                    <option value="customer">Customer</option>
                </select>
            </div>

            <div className="flex justify-end gap-3">
                <CustomButton
                    type="button"
                    variant="secondary"
                    fullWidth={false}
                    onClick={() => {
                        if (isEdit) {
                            setEditModalOpen(false);
                            setEditingFaq(null);
                        } else {
                            setCreateModalOpen(false);
                        }
                        setFormData({
                            question: '',
                            answer: '',
                            category: 'general',
                        });
                    }}
                >
                    Cancel
                </CustomButton>
                <CustomButton
                    type="submit"
                    fullWidth={false}
                    disabled={
                        isEdit ? isEditing === editingFaq?.id : isCreating
                    }
                >
                    {isEdit
                        ? isEditing === editingFaq?.id
                            ? 'Updating...'
                            : 'Update FAQ'
                        : isCreating
                          ? 'Creating...'
                          : 'Create FAQ'}
                </CustomButton>
            </div>
        </form>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    FAQ Management
                </h2>
                <Dialog
                    open={createModalOpen}
                    onOpenChange={setCreateModalOpen}
                >
                    <DialogTrigger asChild>
                        <CustomButton
                            fullWidth={false}
                            className="flex items-center gap-2"
                        >
                            <div className="flex gap-1.5">
                                <Plus className="h-4 w-4" />
                                Add New FAQ
                            </div>
                        </CustomButton>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New FAQ</DialogTitle>
                        </DialogHeader>
                        {renderFAQForm()}
                    </DialogContent>
                </Dialog>
            </div>

            {/* FAQs List */}
            <div className="space-y-4">
                {faqs.length === 0 ? (
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                        <p className="text-gray-500">No FAQs found.</p>
                    </div>
                ) : (
                    faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-900">
                                            {faq.question}
                                        </h3>
                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                            {faq.category}
                                        </span>
                                    </div>
                                    <p className="leading-relaxed text-gray-700">
                                        {faq.answer}
                                    </p>
                                </div>
                                <div className="ml-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(faq)}
                                        className="flex items-center rounded-lg px-3 py-2 text-sf-primary transition-colors hover:text-blue-700"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(faq.id)}
                                        disabled={isDeleting === faq.id}
                                        className="flex items-center rounded-lg px-3 py-2 text-danger-normal transition-colors hover:text-red-700 disabled:opacity-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="text-sm text-gray-500">
                                Created on {faq.created_at}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit FAQ</DialogTitle>
                    </DialogHeader>
                    {renderFAQForm(true)}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FAQs;
