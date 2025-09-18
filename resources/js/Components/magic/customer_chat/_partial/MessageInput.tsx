import CustomButton from '@/Components/common/CustomButton';
import { MicIcon, PlusIcon, SendIcon } from 'lucide-react';
import React, { useState } from 'react';
import { EmojiPicker } from './EmojiPicker';
interface MessageInputProps {
    onSendMessage: (text: string) => void;
}
export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
}) => {
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [message, setMessage] = useState('');
    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    return (
        <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-center">
                <button className="hidden p-2 text-gray-500 hover:text-gray-700">
                    <PlusIcon className="h-5 w-5" />
                </button>
                <EmojiPicker textAreaRef={textAreaRef} />
                <textarea
                    rows={1}
                    placeholder="Write message"
                    className="mx-2 flex-1 resize-none border-0 px-3 py-2 text-sm focus:outline-none focus:ring-0"
                    value={message}
                    ref={textAreaRef}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button className="hidden p-2 text-gray-500 hover:text-gray-700">
                    <MicIcon className="h-5 w-5" />
                </button>
                <CustomButton
                    fullWidth={false}
                    onClick={handleSend}
                    className="rounded-md p-2"
                >
                    <div className="flex items-center justify-center md:px-2">
                        <span className="mr-1 text-sm font-medium">Send</span>
                        <SendIcon className="h-4 w-4" />
                    </div>
                </CustomButton>
            </div>
        </div>
    );
};
