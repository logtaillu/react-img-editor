import React from 'react'
import { prefixCls } from '../../constants'

interface FontSizeSettingProps {
  value?: number;
  onChange: (fontSize: number) => void;
}

export default function FontSizeSetting(props: FontSizeSettingProps) {
  return (
    <span style={{ margin: '0 8px' }}>
      <button
        className={`${prefixCls}-font-size ${props.value === 14 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(14)}
      >小</button>
      <button
        className={`${prefixCls}-font-size ${props.value === 16 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(16)}
      >中</button>
      <button
        className={`${prefixCls}-font-size ${props.value === 20 ? prefixCls + '-font-size-activated' : ''}`}
        onClick={() => props.onChange(20)}
      >大</button>
    </span>
  )
}