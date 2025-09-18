import CustomButton from '@/Components/common/CustomButton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/Components/ui/dialog';
import { useForm } from '@inertiajs/react';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

// Types
interface CardDetails {
    id: string;
    last4: string;
    expiry: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'discover';
}

interface PaymentMethodProps {
    id: number;
    last4: string;
    expiry: string;
    brand: string;
    is_default: boolean;
}

interface CreditCardProps {
    card: CardDetails;
    isActive: boolean;
    isDefault: boolean;
    onDelete: (cardId: string) => void;
    onMakeDefault: (cardId: string) => void;
}

type NewCardFormData = {
    cardNumber: string;
    expiry: string;
    cvv: string;
    name: string;
    setAsDefault: boolean;
};

// Card brand colors and logos
const getBrandColor = (brand: string) => {
    switch (brand.toLowerCase()) {
        case 'visa':
            return 'text-blue-600';
        case 'mastercard':
            return 'text-red-500';
        case 'amex':
            return 'text-blue-500';
        case 'discover':
            return 'text-orange-500';
        default:
            return 'text-gray-500';
    }
};

const getBrandIcon = (brand: string) => {
    // Using simple colored circles to represent different card brands
    const colorClass = getBrandColor(brand);
    return (
        <div
            className={`h-6 w-8 rounded-sm border-2 ${colorClass} flex items-center justify-center border-current text-xs font-bold`}
        >
            {brand.slice(0, 2).toUpperCase()}
        </div>
    );
};

// Individual Credit Card Component
const CreditCardComponent: React.FC<CreditCardProps> = ({
    card,
    isActive,
    isDefault,
    onDelete,
    onMakeDefault,
}) => {
    return (
        <div
            className={`flex items-center justify-between rounded-lg border p-4 ${isActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
        >
            <div className="flex items-center space-x-3">
                {/* Selection checkbox */}
                <div
                    className={`flex h-4 w-4 items-center justify-center rounded border-2 ${isActive ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}
                >
                    {isActive && (
                        <svg
                            className="h-3 w-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                </div>

                {/* Card brand icon */}
                {getBrandIcon(card.brand)}

                {/* Card details */}
                <div>
                    <div className="font-medium">
                        •••• {card.last4}
                        {isDefault && (
                            <span className="ml-2 text-sm text-gray-500">
                                Default
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500">
                        Expiry {card.expiry}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
                {!isDefault && (
                    <button
                        onClick={() => onMakeDefault(card.id)}
                        className="text-sm text-purple-600 hover:text-purple-800"
                    >
                        Set as Default
                    </button>
                )}
                <button
                    onClick={() => onDelete(card.id)}
                    className="p-1 text-red-500 hover:text-red-700"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

// New Card Form Component
const NewCardForm: React.FC<{
    onSubmit: (data: NewCardFormData) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const { data, setData, post, processing, errors } =
        useForm<NewCardFormData>({
            cardNumber: '',
            expiry: '',
            cvv: '',
            name: '',
            setAsDefault: false,
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.settings.payment-methods.store'), {
            onSuccess: () => {
                onSubmit(data);
            },
            onError: (errors) => {
                console.error('Failed to add payment method:', errors);
            },
        });
    };

    const handleInputChange = (
        field: keyof NewCardFormData,
        value: string | boolean,
    ) => {
        setData(field, value);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Card Number
                </label>
                <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={data.cardNumber}
                    onChange={(e) =>
                        handleInputChange('cardNumber', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    required
                />
                {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.cardNumber}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Expiry Date
                    </label>
                    <input
                        type="text"
                        placeholder="MM/YY"
                        value={data.expiry}
                        onChange={(e) =>
                            handleInputChange('expiry', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    {errors.expiry && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.expiry}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        CVV
                    </label>
                    <input
                        type="text"
                        placeholder="123"
                        value={data.cvv}
                        onChange={(e) =>
                            handleInputChange('cvv', e.target.value)
                        }
                        className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                        required
                    />
                    {errors.cvv && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.cvv}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    Cardholder Name
                </label>
                <input
                    type="text"
                    placeholder="John Doe"
                    value={data.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                    required
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="setAsDefault"
                    checked={data.setAsDefault}
                    onChange={(e) =>
                        handleInputChange('setAsDefault', e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="setAsDefault" className="text-sm text-gray-700">
                    Set as default payment method
                </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <CustomButton
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    fullWidth={false}
                    disabled={processing}
                >
                    Cancel
                </CustomButton>
                <CustomButton
                    type="submit"
                    className=""
                    fullWidth={false}
                    disabled={processing}
                >
                    {processing ? 'Adding...' : 'Add Card'}
                </CustomButton>
            </div>
        </form>
    );
};

// Main Payment Methods Component
const PaymentMethods: React.FC<{
    payment_methods: PaymentMethodProps[];
}> = ({ payment_methods }) => {
    const [cards, setCards] = useState<CardDetails[]>(
        payment_methods.map((method) => ({
            id: method.id.toString(),
            last4: method.last4,
            expiry: method.expiry,
            brand: method.brand as 'visa' | 'mastercard' | 'amex' | 'discover',
        })),
    );

    const [activeCard, setActiveCard] = useState<string>(
        cards.length > 0 ? cards[0].id : '',
    );
    const [defaultCard, setDefaultCard] = useState<string>(
        payment_methods.find((method) => method.is_default)?.id.toString() ||
            (cards.length > 0 ? cards[0].id : ''),
    );
    const [dialogOpen, setDialogOpen] = useState(false);

    const { delete: deleteMethod, patch } = useForm();

    const handleDeleteCard = (cardId: string) => {
        deleteMethod(
            route('customer.settings.payment-methods.destroy', cardId),
            {
                onSuccess: () => {
                    setCards((prev) =>
                        prev.filter((card) => card.id != cardId),
                    );

                    // If we deleted the active card, select the first remaining card
                    if (activeCard === cardId && cards.length > 1) {
                        const remainingCards = cards.filter(
                            (card) => card.id != cardId,
                        );
                        setActiveCard(remainingCards[0].id);
                    }

                    // If we deleted the default card, make the first remaining card default
                    if (defaultCard === cardId && cards.length > 1) {
                        const remainingCards = cards.filter(
                            (card) => card.id != cardId,
                        );
                        setDefaultCard(remainingCards[0].id);
                    }
                },
                onError: (errors) => {
                    console.error('Failed to delete payment method:', errors);
                },
            },
        );
    };

    const handleMakeDefault = (cardId: string) => {
        patch(route('customer.settings.payment-methods.set-default', cardId), {
            onSuccess: () => {
                setDefaultCard(cardId);
            },
            onError: (errors) => {
                console.error('Failed to set default payment method:', errors);
            },
        });
    };

    const handleAddCard = (data: NewCardFormData) => {
        const newCard: CardDetails = {
            id: Date.now().toString(),
            last4: data.cardNumber.slice(-4),
            expiry: data.expiry,
            brand: 'visa', // In real app, you'd detect this from the card number
        };

        setCards((prev) => [...prev, newCard]);

        if (data.setAsDefault) {
            setDefaultCard(newCard.id);
        }

        setDialogOpen(false);
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                    Your Payment Methods
                </h2>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <CustomButton fullWidth={false}>
                            <div className="flex gap-1.5">
                                <Plus size={16} />
                                <span>Add New Card</span>
                            </div>
                        </CustomButton>
                    </DialogTrigger>
                    <DialogContent className="no-scrollbar max-h-[90vh] overflow-y-auto sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Payment Method</DialogTitle>
                        </DialogHeader>
                        <NewCardForm
                            onSubmit={handleAddCard}
                            onCancel={() => setDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-3">
                {cards.map((card) => (
                    <CreditCardComponent
                        key={card.id}
                        card={card}
                        isActive={activeCard === card.id}
                        isDefault={defaultCard === card.id}
                        onDelete={handleDeleteCard}
                        onMakeDefault={handleMakeDefault}
                    />
                ))}
            </div>

            {cards.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                    <CreditCard
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                    />
                    <p>No payment methods added yet.</p>
                    <p className="text-sm">
                        Click "Add New Card" to get started.
                    </p>
                </div>
            )}
        </div>
    );
};

export default PaymentMethods;
