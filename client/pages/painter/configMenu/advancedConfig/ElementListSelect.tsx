import * as React from 'react';
import elementMeta from '@/lib/elementMeta';
import { Select, Typography } from 'antd';
import classnames from 'classnames';
import { AdvancedConfigContext } from '@/lib/context';
import qrcodeIcon from '../../../../assets/images/qrcode.png'
import wxacodeIcon from '../../../../assets/images/wxacode.png'

const { Option } = Select
const { Paragraph } = Typography;
const TYPE = {
  IMAGE: '图片',
  TEXT: '文字',
  AVATAR: '头像',
  LINE: '直线',
  CIRCLE: '圆形',
  RECT: '矩形',
  QRCODE: '二维码',
  WXACODE: '小程序码',
}

type ElementListSelectProps = {
  disabled: boolean,
  value: number,
  onChange: (val: any) => void,
  className?: string
}
export default function ElementListSelect({ disabled, value, onChange, className = '' }: ElementListSelectProps) {
  const { selectedElement, drawData } = React.useContext(AdvancedConfigContext);


  return (
    <Select disabled={disabled} value={value} className={classnames('target-select', className)} onChange={onChange} optionLabelProp="value" allowClear>
      {getElementList(selectedElement, drawData).map(el => (
        <Option value={el.key} key={el.key}>
          <div className="option-element">
            <div className="option-element-key">{el.key}</div>
            <div className="option-element-desc">{TYPE[el.elType.toUpperCase() as keyof typeof TYPE]}</div>
            <div className="option-element-content">
              <ElementContent el={el} />
            </div>
          </div>
        </Option>
      ))}
    </Select>
  )

}

function getElementList(selectedElement: { id: any; }, drawData: { [x: string]: any; }): any[] {
  let allElArr: any[] = [];
  for (let i = 0, keys = Object.keys(drawData); i < keys.length; i++) {
    let elementList = drawData[keys[i]]
    if (Array.isArray(elementList)) {
      elementList.forEach(item => {
        let { drawType } = item;
        if (drawType === 'text' || drawType === 'image' || drawType === 'avatar') { // 需要绘制图片或文字的内容
          const [{ name, field }] = elementMeta.placeholder[drawType];
          allElArr.push({
            key: item.id,
            elType: drawType,
            value: item[field],
          })
        } else { // 矩形、圆形、直线、二维码、小程序码
          allElArr.push(
            {
              key: item.id,
              elType: item.drawType,
              backgroundColor: item.backgroundColor,
            },
          )
        }
      })
    }
  }
  const targetElArr = allElArr.filter(item => item.key !== selectedElement.id);
  return targetElArr;
}

function ElementContent({ el }:any) {
  if (el.value) {
    if (el.elType === 'text') {
      return <div className="option-element-content-text"><Paragraph ellipsis>{el.value}</Paragraph></div>
    }
    return <img className="option-element-content-img" src={el.value} alt="" />
  } else {
    switch (el.elType) {
      case 'rect':
        return <div className="option-element-content-rect" style={{ backgroundColor: `${el.backgroundColor}` }} />
      case 'circle':
        return <div className="option-element-content-circle" style={{ backgroundColor: `${el.backgroundColor}` }} />
      case 'line':
        return <div className="option-element-content-line" />
      case 'qrcode':
        return <img className="option-element-content-qrcode" src={qrcodeIcon} alt="" />
      case 'wxacode':
        return <img className="option-element-content-qrcode" src={wxacodeIcon} alt="" />
      default:
        return null;
    }
  }
}
