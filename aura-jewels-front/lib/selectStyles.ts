import { StylesConfig } from 'react-select';

export const commonSelectStyles: StylesConfig<any, false> = {
    control: (provided) => ({
        ...provided,
        minHeight: '34px',
        height: '34px',
        width: '100%',
        borderRadius: '0',
        borderColor: '#E5E7EB',
        fontSize: '13px',
        boxShadow: 'none',
        '&:hover': {
            borderColor: '#A96D56'
        }
    }),
    valueContainer: (provided) => ({
        ...provided,
        padding: '0 8px',
        height: '32px',
    }),
    input: (provided) => ({
        ...provided,
        margin: '0',
        padding: '0',
    }),
    indicatorSeparator: () => ({
        display: 'none',
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '32px',
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: '2px 6px',
        color: '#1A1A1A'
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '0',
        marginTop: '0',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        zIndex: 20
    }),
    option: (provided, state) => ({
        ...provided,
        fontSize: '13px',
        backgroundColor: state.isSelected ? '#A96D56' : state.isFocused ? '#F3F4F6' : 'white',
        color: state.isSelected ? 'white' : '#1A1A1A',
        '&:active': {
            backgroundColor: '#A96D56',
            color: 'white'
        }
    })
};

export const getSelectStyles = (width: string): StylesConfig<any, false> => ({
    ...commonSelectStyles,
    control: (provided, state) => ({
        ...(commonSelectStyles.control ? (commonSelectStyles.control(provided, state) as any) : provided),
        width: width
    })
});
