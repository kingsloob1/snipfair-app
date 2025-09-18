import { MessageOpen } from '@/Components/icon/Icons';
import { ChatConversation } from '@/types';

const EmptyMessage = ({ messages }: { messages: ChatConversation[] }) => {
    return (
        <div className="flex h-full flex-col items-center justify-center">
            <MessageOpen className="mb-4 h-20 w-20" />
            <h2 className="text-xl font-semibold text-sf-black-secondary">
                {messages.length > 0 ? 'No message Found' : 'No messages Yet'}
            </h2>
            <p className="text-sm text-sf-primary-paragraph">
                You currently have no message.
            </p>
        </div>
    );
};

export default EmptyMessage;
