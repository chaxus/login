import { useState, useEffect, useRef } from 'react';
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { ChromePicker } from 'react-color';

export default function ColorPicker({ value = '', onChange = (value: string) => { }, disabled = false }) {
  const [isExpand, setIsExpand] = useState(false)
  const popup = useRef<any>()

  const onToggle = (e: { clientX: number; clientY: number; }) => {
    if (disabled) {
      return;
    }
    setIsExpand(!isExpand)
    if (isExpand) {
      return
    }
    popup.current.style.left = `${e.clientX + 5}px`
    popup.current.style.top = `calc(${e.clientY + 5}px - 242px)`
  }

  const handleClose = () => {
    setIsExpand(!isExpand)
  }
  const renerPicker = () => (
    <div className="picker">
      <div className="cover" onClick={handleClose} />
      <ChromePicker
        color={value}
        onChangeComplete={value => {
          const { r, g, b, a } = value.rgb;
          let color = `rgba(${r},${g},${b},${a})`;
          onChange(color)
        }}
      />
    </div>
  )

  useEffect(() => {
    popup.current = document.createElement('div');
    popup.current.className = 'picker-popup';
    document.body.appendChild(popup.current);
    return () => {
      ReactDOM.unmountComponentAtNode(popup.current);
      document.body.removeChild(popup.current);
    }
  }, [])

  useEffect(() => {
    if (isExpand) {
      ReactDOM.render(renerPicker(), popup.current);
    } else {
      ReactDOM.render(<></>, popup.current);
    }
  }, [isExpand, value])

  return (
    <div className="picker-container">
      <div className="color" style={{ backgroundColor: value }} onClick={onToggle} />
    </div>
  )
}
