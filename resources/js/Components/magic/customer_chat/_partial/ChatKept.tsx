import CustomButton from '@/Components/common/CustomButton';
import { PenBoxIcon } from 'lucide-react';

export default function ChatKept() {
    return (
        <CustomButton fullWidth={false} className="rounded-md p-2">
            <PenBoxIcon size={12} />
        </CustomButton>
    );
}
