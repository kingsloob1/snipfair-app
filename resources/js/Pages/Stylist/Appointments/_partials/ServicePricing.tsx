import GradientTextSpan from '@/Components/common/GradientTextSpan';
import React from 'react';

interface ServicesPricingProps {
    portfolio: {
        id: number;
        title: string;
        category: { name: string };
        duration: string;
        price: number;
    };
    business_name: string;
}

const ServicesPricing: React.FC<ServicesPricingProps> = ({
    portfolio,
    business_name,
}) => {
    return (
        <div className="mb-6 rounded-xl border border-sf-stroke bg-sf-white p-4 shadow-sm md:p-6">
            <h2 className="mb-2 text-xl font-bold text-sf-black md:mb-5 md:text-2xl">
                Services & Pricing
            </h2>

            <div className="space-y-3">
                <div className="mb-3 space-y-2 md:mb-8 md:space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-sf-secondary-paragraph">
                            Service:
                        </span>
                        <span className="text-sm font-semibold text-sf-black">
                            {portfolio.title || business_name}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-sf-secondary-paragraph">
                            Category:
                        </span>
                        <span className="text-sm font-semibold text-sf-black">
                            {portfolio.category.name}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-sf-secondary-paragraph">
                            Duration:
                        </span>
                        <span className="text-sm font-semibold text-sf-black">
                            {portfolio.duration}
                        </span>
                    </div>
                </div>
                <div className="mb-8 border-t border-sf-secondary-paragraph"></div>
                <div className="mb-8 flex items-center justify-between text-base font-bold">
                    <span className="text-sf-black">Total</span>
                    <GradientTextSpan text={`R${portfolio.price}`} />
                </div>
            </div>
        </div>
    );
};

export default ServicesPricing;
