import { Star } from 'lucide-react';
import React from 'react';
interface ProductCardProps {
    stylist: string;
    price: number;
    name: string;
    description_text: string;
    rating: number;
    availability: string;
    category: string;
}
export const ProductCard: React.FC<ProductCardProps> = ({
    stylist,
    price,
    name,
    description_text,
    rating,
    availability,
    category,
}) => {
    return (
        <div className="rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-2 flex items-start justify-between">
                <h3 className="text-lg font-semibold">{name}</h3>
                <span className="font-semibold text-blue-600">R{price}</span>
            </div>
            <p className="mb-2 text-sm text-gray-600">{stylist}</p>
            <p className="mb-3 text-sm text-gray-500">{description_text}</p>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Star className="fill-current text-yellow-400" size={16} />
                    <span className="ml-1 text-sm text-gray-600">{rating}</span>
                </div>
                <span className="text-sm text-gray-500">{availability}</span>
            </div>
            <div className="mt-2">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {category}
                </span>
            </div>
        </div>
    );
};
