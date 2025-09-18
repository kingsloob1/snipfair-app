import { useMemo } from 'react';
import Select from 'react-select';
import countryList from 'react-select-country-list';

type Props = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

const CountrySelect = ({ value, onChange, className = '' }: Props) => {
    const options = useMemo(() => countryList().getData(), []);
    const selectedOption = options.find((opt) => opt.label === value) || null;

    return (
        <Select
            options={options}
            value={selectedOption}
            onChange={(option) => onChange(option?.label ?? '')}
            isClearable
            placeholder="Select country"
            classNames={{
                control: () =>
                    'rounded-md border border-sf-stroke bg-sf-primary-background shadow-sm focus:border-sf-primary focus:ring-sf-primary ' +
                    className,
                menu: () => 'bg-sf-primary-background border-sf-stroke',
                option: ({ isFocused }) =>
                    `px-3 py-2 text-sm cursor-pointer ${
                        isFocused ? 'bg-sf-primary/10 text-sf-primary' : ''
                    }`,
                singleValue: () => 'text-sm',
            }}
            styles={{
                control: (base) => ({
                    ...base,
                    borderRadius: 6,
                    borderColor: 'hsl(var(--sf-stroke))',
                    backgroundColor: 'hsl(var(--sf-primary-background))',
                    boxShadow: 'none',
                    minHeight: '38px',
                }),
                placeholder: (base) => ({
                    ...base,
                    color: '#aaa',
                    fontSize: '0.875rem',
                }),
            }}
        />
    );
};

export default CountrySelect;
