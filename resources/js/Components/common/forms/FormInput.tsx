import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

interface InputProps {
    name: string;
    label: string;
    error?: string;
    value?: string;
    setData: (name: string, value: string) => void;
    autoComplete?: string;
    type?: string;
}

export default function FormInput({
    name,
    label,
    error,
    value,
    setData,
    autoComplete,
    type = 'text',
}: InputProps) {
    return (
        <>
            <InputLabel htmlFor={name} value={label} />
            <TextInput
                id={name}
                name={name}
                type={type}
                value={value}
                className="mt-1 block w-full"
                autoComplete={autoComplete}
                isFocused={true}
                onChange={(e) => setData(name, e.target.value)}
                required
            />
            <InputError message={error} className="mt-2" />
        </>
    );
}
