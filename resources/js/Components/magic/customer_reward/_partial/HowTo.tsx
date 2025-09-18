import { MessageSquare, Star, Users } from 'lucide-react';

export default function HowTo() {
    return (
        <div className="rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">How to Earn Points</h2>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Star className="h-5 w-5 text-purple-600" />
                    <div>
                        <h3 className="font-semibold">Complete Booking</h3>
                        <p className="text-sm text-gray-600">
                            50 points per R10 spent
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    <div>
                        <h3 className="font-semibold">Leave Review</h3>
                        <p className="text-sm text-gray-600">100 points</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                        <h3 className="font-semibold">Refer Friends</h3>
                        <p className="text-sm text-gray-600">500 points</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
