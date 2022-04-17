
import React, { useState, useEffect } from 'react'
import { Select } from 'antd'

interface OptionProps {
  label: string,
  value: string | number,
}
interface SearchInputProps {
  value?: string,
  options?: OptionProps[],
  fetch?: (input: string) => OptionProps[],
  onChange: (value: string) => void,
  placeholder: string,
  style?: object,
}

export default function SearchInput(props: SearchInputProps) {
  const { value, fetch, onChange, placeholder, options: initOptions = [], style } = props
  const [options, setOptions] = useState<OptionProps[]>(initOptions)

  useEffect(() => {
    if (initOptions && initOptions.length > 0) {
      setOptions(initOptions)
    }
  }, [initOptions])

  const handleSearch = async (value: string) => {
    if (value && fetch) {
      let options = await fetch(value)
      setOptions(options)
    } else {
      setOptions([])
    }
  }

  const filterOption = (input: string, option: any) => {
    let label = option.label
    return label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  }

  const handleChange = (value: string) => {
    onChange(value)
  };

  let extraProps = typeof fetch === 'function' ?
    {
      filterOption: false,
      onSearch: handleSearch
    } : {
      filterOption,
      onSearch: undefined
    }

  return (
    <Select
      showSearch
      options={options}
      value={value}
      placeholder={placeholder}
      defaultActiveFirstOption={false}
      onChange={handleChange}
      notFoundContent={null}
      {...extraProps}
      style={style}
      allowClear
    >
    </Select>
  )
}