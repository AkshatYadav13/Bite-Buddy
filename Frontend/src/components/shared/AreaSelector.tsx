import { useState } from 'react';
import Select, { SingleValue, InputActionMeta } from 'react-select';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';

interface OptionType {
  value: string;
  label: string;
  isOther?: boolean;
}
type AreaSelectorProps={
  defaultValue?:string 
  selectChange: (area: string) => void 
  allowOtherValue?:boolean
}

const AreaSelector = ({ selectChange,defaultValue,allowOtherValue=false}: AreaSelectorProps) => {

  const [selectedOption, setSelectedOption] = useState<OptionType | null>(defaultValue ? {label:defaultValue,value:defaultValue} : null);
  const [inputValue, setInputValue] = useState<string>('');

  const isDark = useAppStore().theme === 'dark'

  const baseOptions: OptionType[] = []


  const customFilterOptions = (candidate: OptionType, input: string) =>
    candidate.label.toLowerCase().includes(input.toLowerCase());

  const getFilteredOptions = (): OptionType[] => {
    const filtered = baseOptions.filter(option =>
      customFilterOptions(option, inputValue)
    );

    const isInputInOptions = baseOptions.some(option =>
      option.label.toLowerCase() === inputValue.toLowerCase()
    );

    
    if ( allowOtherValue && (!isInputInOptions && inputValue)) {
      filtered.push({
        value: 'other',
        label: `Other: ${inputValue}`,
        isOther: true,
      });
    }
    return filtered;
  };


  const handleChange = (selected: SingleValue<OptionType>) => {
    setSelectedOption(selected);
    if(selected?.value)  selectChange(selected?.value);
    if (selected?.isOther) {
        toast.info("Delivery is currently available in limited areas. You’ve selected 'Other'. You can continue browsing, but please select a valid delivery area before placing an order.")
    }
  };

  const handleInputChange = (newValue: string, _: InputActionMeta) => {
    setInputValue(newValue);
    return newValue;
  };

  const customStyles = {
      control: (provided: any, state: any) => ({
          ...provided,
          backgroundColor: isDark ? '#0D1122' : '',
          color: 'inherit',
          borderRadius: '8px', 
          boxShadow: state.isFocused ? '0 0 0 2px #f5f5f54D' : 'none',
          border: `1px solid ${isDark ? '#424242':'#D1D5D4' }`,
          '&:hover': {
          },
      }),

      menu: (provided: any) => ({
          ...provided,
          backgroundColor: isDark ? '#0D1122' : 'white',
          borderRadius: '0.375rem',
          zIndex: 50,
      }),

      option: (provided: any, state: any) => ({
          ...provided,
          backgroundColor: state.isSelected
          ? '#6366F1'
          : state.isFocused
          ? (isDark ? '#1F2937' : '#E5E7EB') 
          : 'transparent',
          color: state.isSelected
          ? 'white'
          : isDark
          ? '#F9FAFB' 
          : '#111827', 
          cursor: 'pointer',
      }),
      
    // Set input text color
    input: (provided: any) => ({
      ...provided,
      color: isDark ? 'white' : 'black',
    }),

    // Set selected value text color
    singleValue: (provided: any) => ({
      ...provided,
      color: isDark ? 'white' : 'black',
    }),
  }


  return (
    <Select
      required
      options={getFilteredOptions()}
      value={selectedOption}
      onChange={handleChange}
      onInputChange={handleInputChange}
      placeholder="Select your area"
      styles={customStyles}
      className="w-full dark:text-gray-100 text-white my-scrollbar"  
      classNamePrefix="react-select"
    />
  );
};

export default AreaSelector;
