import CustomButton from '@/Components/common/CustomButton';
import { Calendar, Chat } from '@/Components/icon/Icons';
import { router } from '@inertiajs/react';
// import { Phone } from 'lucide-react';

interface BookingProps {
    userId: number;
    priceRange?: string;
    nextAvailable?: string;
    responseTime?: string;
    isMin?: boolean;
    isPublic?: boolean;
}

const Booking: React.FC<BookingProps> = ({
    userId,
    priceRange = 'R80-120',
    nextAvailable = 'Today 2:00 PM',
    responseTime = '30 mins',
    isMin = false,
    isPublic = false,
}) => {
    const handleSendMessage = () => {
        // Start a conversation with this user
        router.post('/chat/start', {
            recipient_id: userId,
        });
    };

    return (
        <div className="w-full space-y-6 overflow-hidden rounded-2xl border border-sf-stroke p-3.5 shadow-sm shadow-sf-gray/20 md:p-6">
            <div className="mb-6 text-center">
                <div className="mb-2 bg-gradient-to-r from-sf-gradient-purple to-sf-gradient-pink bg-clip-text font-inter text-2xl font-bold text-transparent">
                    {priceRange}
                </div>
                <div className="text-sf-primary-paragraph">Price range</div>
            </div>

            {/* Availability Section */}
            {!isMin && (
                <div className="mb-6 flex items-center gap-2 text-sm text-success-normal">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">
                        Next available: {nextAvailable}
                    </span>
                </div>
            )}

            {/* Response Time */}
            {!isMin && (
                <div className="mb-8 text-xs text-sf-primary-paragraph">
                    Usually responds in {responseTime}
                </div>
            )}

            {/* Action Buttons */}
            {!isMin && !isPublic && (
                <div className="space-y-3">
                    {/* <CustomButton variant="primary">Book Appointment</CustomButton> */}

                    <CustomButton variant="primary" onClick={handleSendMessage}>
                        <div className="flex gap-2">
                            <Chat className="h-5 w-5" />
                            Send a Message
                        </div>
                    </CustomButton>

                    {/* <CustomButton variant="secondary">
                        <div className="flex gap-2 text-sf-primary-paragraph">
                            <Phone className="h-5 w-5" />
                            Call to Book Now
                        </div>
                    </CustomButton> */}
                </div>
            )}
        </div>
    );
};

export default Booking;
