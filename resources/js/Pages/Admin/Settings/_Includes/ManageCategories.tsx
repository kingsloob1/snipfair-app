import CustomButton from '@/Components/common/CustomButton';
import { router, useForm } from '@inertiajs/react';
import { Image, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

interface Category {
    id?: number;
    name: string;
    description: string;
    status: boolean;
    banner: string;
    image_url?: string;
}

type CategoryFormProps = {
    name: string;
    description: string;
    status: boolean;
    banner: File | null;
};

interface CategoriesProps {
    categories: Category[];
}

const ManageCategories = ({ categories }: CategoriesProps) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );

    const {
        data: addData,
        setData: setAddData,
        post,
        processing: addProcessing,
        reset: resetAdd,
    } = useForm<CategoryFormProps>({
        name: '',
        description: '',
        status: true,
        banner: null as File | null,
    });

    const {
        data: editData,
        setData: setEditData,
        post: postEdit,
        processing: editProcessing,
        reset: resetEdit,
    } = useForm<CategoryFormProps>({
        name: '',
        description: '',
        status: true,
        banner: null as File | null,
    });

    const { delete: destroy, processing: deleteProcessing } = useForm();

    const handleToggle = (categoryId: number, value: boolean) => {
        router.put(route('admin.categories.toggle', categoryId), {
            status: value,
        });
    };

    const handleAdd = () => {
        post(route('admin.categories.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
            },
        });
    };

    const handleEdit = () => {
        if (selectedCategory && selectedCategory.id) {
            postEdit(route('admin.categories.update', selectedCategory.id), {
                onSuccess: () => {
                    setShowEditModal(false);
                    resetEdit();
                    setSelectedCategory(null);
                },
            });
        }
    };

    const handleDelete = () => {
        if (selectedCategory && selectedCategory.id) {
            destroy(route('admin.categories.destroy', selectedCategory.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedCategory(null);
                },
            });
        }
    };

    const openEditModal = (category: Category) => {
        setSelectedCategory(category);
        setEditData({
            name: category.name,
            description: category.description,
            status: category.status,
            banner: null,
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (category: Category) => {
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const handleFileChange = (file: File | null, type: 'add' | 'edit') => {
        if (type === 'add') {
            setAddData('banner', file);
        } else {
            setEditData('banner', file);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                    Categories Management
                </h2>
                <CustomButton
                    variant="primary"
                    onClick={() => setShowAddModal(true)}
                    fullWidth={false}
                >
                    <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New
                    </div>
                </CustomButton>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => (
                    <div
                        key={category.id || index}
                        className="rounded-lg border border-gray-200 p-4"
                    >
                        <div className="mb-3">
                            {category.image_url ? (
                                <img
                                    src={category.image_url}
                                    alt={category.name}
                                    className="h-32 w-full rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-32 w-full items-center justify-center rounded-lg bg-gray-100">
                                    <Image className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            {category.name}
                        </h3>
                        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                            {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    Status:
                                </span>
                                <ToggleSwitch
                                    enabled={category.status}
                                    onChange={(value) =>
                                        category.id &&
                                        handleToggle(category.id, value)
                                    }
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditModal(category)}
                                    className="text-blue-600 hover:text-blue-900"
                                >
                                    <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(category)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="slim-scrollbar max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Add New Category
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={addData.name}
                                    onChange={(e) =>
                                        setAddData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={addData.description}
                                    onChange={(e) =>
                                        setAddData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Banner Image
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleFileChange(
                                            e.target.files?.[0] || null,
                                            'add',
                                        )
                                    }
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="mr-4 block text-sm font-medium text-gray-700">
                                    Active
                                </label>
                                <ToggleSwitch
                                    enabled={addData.status}
                                    onChange={(value) =>
                                        setAddData('status', value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <CustomButton
                                variant="secondary"
                                fullWidth={false}
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetAdd();
                                }}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                variant="black"
                                fullWidth={false}
                                onClick={handleAdd}
                                disabled={addProcessing}
                            >
                                {addProcessing ? 'Adding...' : 'Add Category'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="slim-scrollbar max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Edit Category
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) =>
                                        setEditData('name', e.target.value)
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={editData.description}
                                    onChange={(e) =>
                                        setEditData(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Current Banner
                                </label>
                                {selectedCategory.image_url && (
                                    <img
                                        src={selectedCategory.image_url}
                                        alt="Current banner"
                                        className="mt-1 h-20 w-20 rounded-lg object-cover"
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    New Banner Image (optional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        handleFileChange(
                                            e.target.files?.[0] || null,
                                            'edit',
                                        )
                                    }
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="mr-4 block text-sm font-medium text-gray-700">
                                    Active
                                </label>
                                <ToggleSwitch
                                    enabled={editData.status}
                                    onChange={(value) =>
                                        setEditData('status', value)
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <CustomButton
                                variant="secondary"
                                fullWidth={false}
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetEdit();
                                    setSelectedCategory(null);
                                }}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                variant="black"
                                fullWidth={false}
                                onClick={handleEdit}
                                disabled={editProcessing}
                            >
                                {editProcessing
                                    ? 'Updating...'
                                    : 'Update Category'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6">
                        <h3 className="mb-4 text-lg font-semibold">
                            Delete Category
                        </h3>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete "
                            {selectedCategory.name}"? This action cannot be
                            undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <CustomButton
                                variant="secondary"
                                fullWidth={false}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedCategory(null);
                                }}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                variant="black"
                                fullWidth={false}
                                onClick={handleDelete}
                                disabled={deleteProcessing}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {deleteProcessing ? 'Deleting...' : 'Delete'}
                            </CustomButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
