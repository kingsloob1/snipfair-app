import CustomButton from '@/Components/common/CustomButton';
import { Dialog, DialogContent } from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { router } from '@inertiajs/react';
import { useState } from 'react';

interface InviteAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const InviteAdminModal: React.FC<InviteAdminModalProps> = ({
    isOpen,
    onClose,
}) => {
    const [formData, setFormData] = useState({
        email: '',
        role: '',
    });
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.role) return;

        setProcessing(true);

        router.post(route('admin.admins.invite'), formData, {
            onSuccess: () => {
                setFormData({ email: '', role: '' });
                onClose();
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const handleClose = () => {
        setFormData({ email: '', role: '' });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Invite Administrator
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="admin@example.com"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                The admin will receive an invitation email to
                                set up their account.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Role
                            </label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        role: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select admin role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="editor">
                                        Editor
                                        <span className="ml-2 text-xs text-gray-500">
                                            Limited operational access
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="support-admin">
                                        Support Admin
                                        <span className="ml-2 text-xs text-gray-500">
                                            User management and support
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="moderator">
                                        Moderator
                                        <span className="ml-2 text-xs text-gray-500">
                                            Content and user moderation
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="super-admin">
                                        Super Admin
                                        <span className="ml-2 text-xs text-gray-500">
                                            Full system access
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <CustomButton
                                type="submit"
                                disabled={
                                    processing ||
                                    !formData.email ||
                                    !formData.role
                                }
                                fullWidth={false}
                            >
                                {processing ? 'Sending...' : 'Send Invitation'}
                            </CustomButton>
                            <CustomButton
                                type="button"
                                onClick={handleClose}
                                variant="secondary"
                                fullWidth={false}
                            >
                                Cancel
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default InviteAdminModal;
