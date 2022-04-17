import * as React from 'react';
import { Collapse, Tooltip, Select, InputNumber } from 'antd';
import { StyleConfigContext } from '@/lib/context';
import ColorPicker from '@/components/colorPicker'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { cloneDeep } from 'lodash'
const { Panel } = Collapse
const { Option } = Select
// 进度条初始化值
const initialProcessMap = { 
  'primary':1,
  'stage':{
    "regions":[]
  },
  'undefined':undefined
}
// 进度条初始化颜色
const initialProcessColorMap = { 
  'primary':[{position:1,color:'#A0C96E'},{position:1,color:'#fff'}],// 绿条白底
  'stage':[{position:1,color:'#D20707'},{position:1,color:'#A0C96E'}]// 绿条红段
}
export default function Gradient() {
  return (
    <div className="editor-item-container" key="gradient">
      <Collapse expandIconPosition="right" ghost>
        <Panel header="渐变(进度条制作)" key="1">
          <div className="editor-item-gradient">
            <GradientInput />
          </div>
        </Panel>
      </Collapse>
    </div>
  )
}

function GradientInput() {
  const { selectedElement, onInfoChange,onMultiInfoChange } = React.useContext(StyleConfigContext);
  const { gradient = { options: {} }, blocked: disabled = false,processType } = selectedElement;
  let { type, options } = gradient;
  let { startX, startY, endX, endY, colorArr = [] } = options;
  const onTypeChange = (val: any, tag: string) => {
    const { gradient = { options: {} } } = selectedElement
    onInfoChange({ ...gradient, [tag]: val }, 'gradient')
  }

  const onOptionsChange = (val: string, tag: string) => {
    const { gradient = {} } = selectedElement
    const { options = {} } = gradient
    onInfoChange({ ...gradient, options: { ...options, [tag]: val } }, 'gradient')
  }

  const onProcessConfig = (v: string | number | undefined) => {
    const { width,placeholders } = selectedElement
    // 初始化制作进度条属性
    onMultiInfoChange({"processType":v,"process":initialProcessMap[v as keyof typeof initialProcessMap],'gradient':{ type:'linear',options: { startX:0,startY:0,endX: width,endY:0,colorArr:initialProcessColorMap[v as keyof typeof initialProcessColorMap] } }});
    // 不制作进度条，则清除进度条替换字段
    if(v === undefined){  
      const placeholdersArr = cloneDeep(placeholders);
      const processFieldIndex = placeholdersArr.indexOf('process');
      if(processFieldIndex!==-1){
        placeholdersArr.splice(processFieldIndex,1);
        onInfoChange(placeholdersArr,'placeholders');
      }
      onInfoChange(undefined,'gradient',true)
    }
  }
  return (
    <div className="gradient-item-container">
      <div className="editor-container">
        <div className="editor-item">
          <span className="label">进度条制作</span>
          <div className="editor-detail">
            <Tooltip title="进度条类型" overlayStyle={{ width: '75px' }}>
              <Select disabled={!!disabled} value={processType} style={{ width: 225 }} onChange={v => onProcessConfig(v)} allowClear>
                <Option value="primary" key="primary">普通进度条</Option>
                <Option value="stage" key="stage">分段进度条</Option>
              </Select>
            </Tooltip>
          </div>
        </div>
        <div className="editor-item">
          <span className="label">渐变类型</span>
          <div className="editor-detail">
            <Tooltip title="渐变类型" overlayStyle={{ width: '75px' }}>
              <Select disabled={!!disabled || typeof processType !== 'undefined'} value={type} style={{ width: 225 }} onChange={v => onTypeChange(v, 'type')}>
                <Option value="linear" key="linear">线性渐变</Option>
                <Option value="radial" key="radial">放射性渐变</Option>
              </Select>
            </Tooltip>
          </div>
        </div>
        <div className="editor-item">
          <span className="label">渐变开始位置</span>
          <div className="editor-detail">
            <Tooltip title="横坐标偏移量" overlayStyle={{ width: '100px' }}>
              <span className="label">X</span>
              <InputNumber disabled={!!disabled || typeof processType !== 'undefined'} key="startX" step={1} onChange={v => onOptionsChange(v, 'startX')} className="number-editor" value={startX} precision={0} />
            </Tooltip>
            <Tooltip title="纵坐标偏移量" overlayStyle={{ width: '100px' }}>
              <span className="label">Y</span>
              <InputNumber disabled={!!disabled || typeof processType !== 'undefined'} key="startY" step={1} onChange={v => onOptionsChange(v, 'startY')} className="number-editor" value={startY} precision={0} />
            </Tooltip>
          </div>
        </div>
        <div className="editor-item">
          <span className="label">渐变结束位置</span>
          <div className="editor-detail">
            <Tooltip title="横坐标偏移量" overlayStyle={{ width: '100px' }}>
              <span className="label">X</span>
              <InputNumber disabled={!!disabled || typeof processType !== 'undefined'} key="endX" step={1} onChange={v => onOptionsChange(v, 'endX')} className="number-editor" value={endX} precision={0} />
            </Tooltip>
            <Tooltip title="纵坐标偏移量" overlayStyle={{ width: '100px' }}>
              <span className="label">Y</span>
              <InputNumber disabled={!!disabled || typeof processType !== 'undefined'} key="endY" step={1} onChange={v => onOptionsChange(v, 'endY')} className="number-editor" value={endY} precision={0} />
            </Tooltip>
          </div>
        </div>
        <div className="editor-color">
          <GradientColors disabled={!!disabled || typeof processType !== 'undefined'} value={colorArr} onChange={v => onOptionsChange(v, 'colorArr')} />
        </div>
      </div>
    </div>
  )
}

type GradientColorsProps = {
  value: any,
  onChange: (vval: string) => void
  disabled: boolean
}
function GradientColors({ value = [], onChange, disabled }: GradientColorsProps) {
  const getNewValue = () => {
    const newValue = cloneDeep(value);
    return newValue
  }

  const onDelete = (index: any) => {
    if (disabled) {
      return;
    }
    let newValue = getNewValue();
    newValue.splice(index, 1)
    onChange(newValue)
  }

  const onAdd = () => {
    if (disabled) {
      return;
    }
    let newValue = getNewValue();
    newValue.push({
      position: 1,
      color: '#fff',
    })
    onChange(newValue)
  }

  const onColorChange = (v: any, index: number) => {
    let newValue = getNewValue();
    newValue[index].color = v
    onChange(newValue)
  }

  const onOffsetChange = (v: any, index: string | number) => {
    let newValue = getNewValue();
    newValue[index].position = v
    onChange(newValue)
  }
  return (
    <>
      <label className="label"> 渐变颜色</label>
      <div className="color-item-wrap">
        {
          value.map((item: { color: any; position: any; }, index: number) => (
            <div key={index} className="color-item">
              <Tooltip title={`${index === 0 ? "渐变颜色(制作进度条为进度条颜色)":index === 1 ? "渐变颜色(制作进度条为进度条底色)" : "渐变颜色"}`}>
                <div className="editor-detail">
                  <span className="label">颜色</span>
                  <ColorPicker value={item.color} onChange={(v: any) => onColorChange(v, index)} />
                </div>
              </Tooltip>
              <div className="editor-detail">
                <span className="label">偏移值</span>
                <Tooltip title="偏移值" overlayStyle={{ width: '75px' }}>
                  <InputNumber disabled={disabled} style={{ width: 60 }} min={0} max={1} value={item.position} step={0.01} onChange={v => onOffsetChange(v, index)} precision={2} />
                </Tooltip>
              </div>
              <div className="delete" onClick={() => onDelete(index)}><MinusCircleOutlined /></div>
            </div>
          ))
        }
      </div>
      <div className="editor-detail plus" onClick={onAdd}>
        <PlusCircleOutlined />
      </div>
    </>
  )
}