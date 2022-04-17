import * as React from 'react';
import { Select, Collapse, Tooltip, InputNumber } from 'antd'
import { StyleConfigContext } from '@/lib/context';
import OutlookStyle from './outlookStyle';
import Coordinate from './coordinate';
import ReplaceContent from './replaceContent';
import TextStyle from './textStyle';
import Gradient from './gradient';
import ColorPicker from '@/components/colorPicker';

const { Option } = Select;
const { Panel } = Collapse;

export default function StyleConfig() {
  const { selectedElement } = React.useContext(StyleConfigContext);
  const { drawType } = selectedElement;
  return (
    <>
      <Coordinate />
      <ReplaceContent />
      {drawType === 'text' && <TextStyle />}
      {drawType !== 'text' && drawType !== 'line' && <OutlookStyle />}
      {drawType === 'image' && <ImageClip />}
      {drawType === 'rect' && <Gradient />}
      {drawType === 'circle' && <CircleBorderConfig />}
      {drawType === 'line' && <LineStyle />}
    </>
  )
}

function ImageClip() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { autoClip, blocked = false } = selectedElement;
  return (
    <div className="editor-item-container" key="clip">
      <div className="editor-item-clip">
        <div className="label">图片裁剪</div>
        <Select disabled={!!blocked} value={autoClip} style={{ width: 120 }} onChange={v => onInfoChange(v, 'autoClip')} className="select-input">
          <Option value={0}>长边优先</Option>
          <Option value={1}>短边优先</Option>
          <Option value={2}>强制缩略</Option>
          <Option value={4}>短边优先缩略后填充</Option>
        </Select>
      </div>
    </div>
  )
}

function CircleBorderConfig() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { borderColor, borderStyle, borderWidth, dashedWidth, dashedOffset, blocked = false } = selectedElement;
  return (
    <div className="editor-item-container circle">
      <Collapse defaultActiveKey={['1']} expandIconPosition="right" ghost>
        <Panel header="边框配置" key="1">
          <div className="circle-boder">
            <div className="editor-item-detail">
              <div className="label">颜色</div>
              <Tooltip title="边框颜色" overlayStyle={{ width: '85px' }}>
                <div className="inline-color">
                  <ColorPicker disabled={!!blocked} value={borderColor} onChange={(v: any) => onInfoChange(v, 'borderColor')} />
                </div>
              </Tooltip>
            </div>
            <div className="editor-item-detail">
              <div className="label">宽度</div>
              <Tooltip title="边框宽度" overlayStyle={{ width: '85px' }}>
                <InputNumber disabled={!!blocked} value={borderWidth} step={1} min={0} onChange={v => onInfoChange(v, 'borderWidth')} className="number-editor" precision={0} />
              </Tooltip>
            </div>
            <div className="editor-item-detail">
              <div className="label">样式</div>
              <Tooltip title="边框样式" overlayStyle={{ width: '85px' }}>
                <Select disabled={!!blocked} value={borderStyle} onChange={v => onInfoChange(v, 'borderStyle')} style={{ width: 120 }}>
                  <Option value="dashed">虚线</Option>
                  <Option value="solid">实线</Option>
                </Select>
              </Tooltip>
            </div>
            {
              borderStyle === 'dashed' && (
                [
                  <div className="editor-item-detail">
                    <div className="label">宽度</div>
                    <Tooltip title="虚线宽度" overlayStyle={{ width: '85px' }} placement="bottom">
                      <InputNumber precision={0} value={dashedWidth} step={1} min={0} onChange={v => onInfoChange(v, 'dashedWidth')} className="number-editor" disabled={!(borderStyle === 'dashed') || !!blocked} />
                    </Tooltip>
                  </div>,
                  <div className="editor-item-detail">
                    <div className="label">偏移量</div>
                    <Tooltip title="虚线偏移量" overlayStyle={{ width: '95px' }} placement="bottom">
                      <InputNumber precision={0} value={dashedOffset} step={1} onChange={v => onInfoChange(v, 'dashedOffset')} className="number-editor" disabled={!(borderStyle === 'dashed') || !!blocked} />
                    </Tooltip>
                  </div>,
                ]
              )
            }
          </div>
        </Panel>
      </Collapse>
    </div>
  )
}

function LineStyle() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { borderColor, borderWidth, lineStyle, dashedWidth, dashedOffset, blocked = false } = selectedElement
  return (
    <div className="editor-item-container">
      <Collapse defaultActiveKey={['1']} expandIconPosition="right" ghost>
        <Panel header="线条" key="1">
          <div className="editor-item-line">
            <div className="editor-item-detail">
              <Tooltip title="线条颜色" overlayStyle={{ width: '85px' }} placement="top" className="inline-color">
                <div className="label">颜色</div>
                <ColorPicker disabled={!!blocked} value={borderColor} onChange={(v: any) => onInfoChange(v, 'borderColor')} />
              </Tooltip>
            </div>
            <div className="editor-item-detail">
              <div className="label">宽度</div>
              <Tooltip title="线条宽度" overlayStyle={{ width: '85px' }} placement="top">
                <InputNumber disabled={!!blocked} step={1} onChange={v => onInfoChange(v, 'borderWidth')} value={borderWidth} className="number-editor" precision={0} />
              </Tooltip>
            </div>
            <div className="editor-item-detail">
              <div className="label">样式</div>
              <Tooltip title="线条样式" overlayStyle={{ width: '85px' }} placement="top">
                <Select disabled={!!blocked} value={lineStyle} onChange={v => onInfoChange(v, 'lineStyle')} style={{ width: 120 }}>
                  <Option value="dashed">虚线</Option>
                  <Option value="solid">实线</Option>
                </Select>
              </Tooltip>
            </div>
            {
              lineStyle === 'dashed' && (
                <div className="editor-item-detail">
                  <div className="label">宽度</div>
                  <Tooltip title="虚线宽度" overlayStyle={{ width: '85px' }} placement="top">
                    <InputNumber disabled={!!blocked} value={dashedWidth} step={1} onChange={v => onInfoChange(v, 'dashedWidth')} className="number-editor" precision={0} />
                  </Tooltip>
                  <div className="label">偏移量</div>
                  <Tooltip title="虚线偏移量" overlayStyle={{ width: '90px' }} placement="top">
                    <InputNumber disabled={!!blocked} value={dashedOffset} step={1} onChange={v => onInfoChange(v, 'dashedOffset')} className="number-editor" style={{ width: '70px' }} precision={0} />
                  </Tooltip>
                </div>
              )
            }
          </div>
        </Panel>
      </Collapse>
    </div>
  )
}