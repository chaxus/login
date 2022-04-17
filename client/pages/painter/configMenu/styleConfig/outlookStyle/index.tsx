import * as React from 'react';
import { Collapse, Radio, InputNumber, Tooltip } from 'antd';
import ColorPicker from '@/components/colorPicker';
import { StyleConfigContext } from '@/lib/context';

const { Panel } = Collapse;

export default function OutlookConfig() {
  const { selectedElement } = React.useContext(StyleConfigContext);
  const { drawType } = selectedElement;
  return (
    <div className="editor-item-container">
      <Collapse defaultActiveKey={['1']} expandIconPosition="right" ghost className="outlookConfig-container">
        <Panel header="外观" key="1">
          <div className="editor-item-container noBorder">
            {
              drawType !== 'avatar' && drawType !== 'circle'
              && <RadiusConfig />
            }
            {
              drawType !== 'avatar' && drawType !== 'image' && drawType !== 'qrcode' && drawType !== 'wxacode'
              && <BgColorConfig />
            }
            {
              drawType !== 'circle'
              && <BorderConfig />
            }
            {
              (drawType === 'image' || drawType === 'rect')
              && <ShadowConfig />
            }

          </div>
        </Panel>
      </Collapse>
    </div>
  );
}

function RadiusConfig() {
  const [borderRediusChecked, setBorderRediusChecked] = React.useState('setAll');
  const [borderInsideRediusChecked, setBorderInsideRediusChecked] = React.useState('setAll');
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { drawType,
    borderRadius, borderTopLeftRadius, borderTopRightRadius, borderBottomLeftRadius, borderBottomRightRadius,
    borderInsideRadius = 0, borderTopLeftInsideRadius = 0, borderTopRightInsideRadius = 0, borderBottomLeftInsideRadius = 0, borderBottomRightInsideRadius = 0,
    blocked = false } = selectedElement;

  return (
    <>
      <div className="editor-item-radius">
        <div className="editor-item-horizontal first">
          <div className="label special">外圆角</div>
          <RadiusOptionsSelector disabled={!!blocked} handleChange={setBorderRediusChecked} />
          <div className="radius-details">
            {borderRediusChecked === 'setAll' ?
              <Tooltip title="圆角"><InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderRadius')} value={borderRadius} className="radius-number" disabled={!!blocked} /></Tooltip>
              : [
                <Tooltip title="右上角" overlayStyle={{ width: '70px' }} key="borderTopRightRadius">
                  <InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderTopRightRadius')} value={borderTopRightRadius} className="radius-number" disabled={!!blocked} />
                </Tooltip>,
                <Tooltip title="右下角" overlayStyle={{ width: '70px' }} key="borderBottomRightRadius">
                  <InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderBottomRightRadius')} value={borderBottomRightRadius} className="radius-number" disabled={!!blocked} />
                </Tooltip>,
                <Tooltip title="左下角" overlayStyle={{ width: '70px' }} key="borderBottomLeftRadius">
                  <InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderBottomLeftRadius')} value={borderBottomLeftRadius} className="radius-number" disabled={!!blocked} />
                </Tooltip>,
                <Tooltip title="左上角" overlayStyle={{ width: '70px' }} key="borderTopLeftRadius">
                  <InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderTopLeftRadius')} value={borderTopLeftRadius} className="radius-number" disabled={!!blocked} />
                </Tooltip>,
              ]}
          </div>
        </div>
      </div>
      {(drawType === 'rect' || drawType === 'image')
        && (
          <div className="editor-item-radius">
            <div className="editor-item-horizontal">
              <div className="label">内圆角</div>
              <RadiusOptionsSelector disabled={!!blocked} handleChange={setBorderInsideRediusChecked} />
              <div className="radius-details">
                {borderInsideRediusChecked === 'setAll' ?
                  <Tooltip title="圆角"><InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderInsideRadius')} value={borderInsideRadius} className="radius-number" disabled={!!blocked} /></Tooltip>
                  : [

                    <Tooltip title="左上角" overlayStyle={{ width: '70px' }} key="borderTopRightRadius">
                      <InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderTopLeftInsideRadius')} value={borderTopLeftInsideRadius} className="radius-number" disabled={!!blocked} />
                    </Tooltip>,
                    <Tooltip title="右上角" overlayStyle={{ width: '70px' }} key="borderBottomRightRadius">
                      <InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderTopRightInsideRadius')} value={borderTopRightInsideRadius} className="radius-number" disabled={!!blocked} />
                    </Tooltip>,
                    <Tooltip title="右下角" overlayStyle={{ width: '70px' }} key="borderTopLeftRadius">
                      <InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderBottomRightInsideRadius')} value={borderBottomRightInsideRadius} className="radius-number" disabled={!!blocked} />
                    </Tooltip>,
                    <Tooltip title="左下角" overlayStyle={{ width: '70px' }} key="borderBottomLeftRadius">
                      <InputNumber min={0} step={2} precision={0} onChange={v => onInfoChange(v, 'borderBottomLeftInsideRadius')} value={borderBottomLeftInsideRadius} className="radius-number" disabled={!!blocked} />
                    </Tooltip>,
                  ]}
              </div>
            </div>
          </div>
        )}
    </>
  )
}



function BgColorConfig() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { backgroundColor, blocked = false } = selectedElement;
  return (
    <div className="editor-item-bgColor">
      <div className="bg-color-label">填充</div>
      <div className="bg-color-wrap">
        <Tooltip title="背景颜色" overlayStyle={{ width: '75px' }}>
          <div className="bg-color">
            <ColorPicker disabled={!!blocked} value={backgroundColor} onChange={(v: any) => onInfoChange(v, 'backgroundColor')} />
          </div>
        </Tooltip>
      </div>
    </div>
  )
}

function BorderConfig() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { borderWidth, borderColor, blocked = false } = selectedElement;
  return (
    <div className="editor-item-border">
      <div className="editor-item-border-color">
        <div className="border-color-label">描边</div>
        <div className="border-color-wrap">
          <Tooltip title="边框颜色" overlayStyle={{ width: '75px' }}>
            <div className="border-color">
              <ColorPicker disabled={!!blocked} value={borderColor} onChange={(v: any) => onInfoChange(v, 'borderColor')} />
            </div>
          </Tooltip>
          <Tooltip title="边框宽度" overlayStyle={{ width: '75px' }}>
            <InputNumber disabled={!!blocked} step={1} precision={0} min={0} onChange={v => onInfoChange(v, 'borderWidth')} value={borderWidth} className="input-number" />
          </Tooltip>
        </div>
      </div>

    </div>
  )
}

function ShadowConfig() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { shadow = {}, blocked = false } = selectedElement;
  return (
    <div className="editor-item-shadow">
      <div className="editor-item-shadow-color">
        <div className="shadow-color-label">阴影</div>
        <div className="shadow-color-wrap">
          <Tooltip title="阴影颜色" overlayStyle={{ width: '75px' }}>
            <div className="shadow-color">
              <ColorPicker disabled={!!blocked} value={shadow.color} onChange={(v: any) => onInfoChange({ ...shadow, color: v }, 'shadow')} />
            </div>
          </Tooltip>
          <Tooltip title="X轴偏移量" overlayStyle={{ width: '90px' }}>
            <div className="shadow-detail">
              <span className="label">X</span>
              <InputNumber disabled={!!blocked} step={1} precision={0} onChange={v => onInfoChange({ ...shadow, offsetX: v }, 'shadow')} value={shadow.offsetX} className="input-number" key="shadow-offsetX" />
            </div>
          </Tooltip>
          <Tooltip title="Y轴偏移量" overlayStyle={{ width: '90px' }}>
            <div className="shadow-detail">
              <span className="label">Y</span>
              <InputNumber disabled={!!blocked} step={1} precision={0} onChange={v => onInfoChange({ ...shadow, offsetY: v }, 'shadow')} value={shadow.offsetY} className="input-number" key="shadow-offsetY" />
            </div>
          </Tooltip>
          <Tooltip title="模糊半径" overlayStyle={{ width: '85px' }}>
            <div className="shadow-detail">
              <span className="label">模糊</span>
              <InputNumber disabled={!!blocked} min={0} step={1} precision={0} onChange={v => onInfoChange({ ...shadow, blur: v }, 'shadow')} value={shadow.blur} className="input-number" key="shadow-blur" />
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

type RadiusOptionsProps = { handleChange: any, disabled: boolean };
function RadiusOptionsSelector({ handleChange, disabled }: RadiusOptionsProps) {
  return (
    <div className="radius-options">
      <Radio.Group disabled={disabled} size="small" onChange={e => handleChange(e.target.value)}>
        <Tooltip title="圆角" overlayStyle={{ width: '50px' }} placement="bottom">
          <Radio.Button value="setAll" key="setall">
            <span className="radius-all-icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon icon" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3zm0-1h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3C0 2.216.3 1.503.792.969A2.992 2.992 0 0 1 3 0z" /></svg>
            </span>
          </Radio.Button>
        </Tooltip>
        <Tooltip title="独立圆角" overlayStyle={{ width: '75px' }} placement="bottom">
          <Radio.Button value="setSeperate" key="setseperate">
            <span className="radius-expend-icon">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <path d="M4 0L4 1 3 1C1.9 1 1 1.9 1 3L1 4 0 4 0 3C0 1.3 1.3 0 3 0L4 0Z" />
                <path d="M8 0L9 0C10.7 0 12 1.3 12 3L12 4 11 4 11 3C11 1.9 10.1 1 9 1L8 1 8 0Z" />
                <path d="M4 12L3 12C1.3 12 0 10.7 0 9L0 8 1 8 1 9C1 10.1 1.9 11 3 11L4 11 4 12Z" />
                <path d="M8 12L8 11 9 11C10.1 11 11 10.1 11 9L11 8 12 8 12 9C12 10.7 10.7 12 9 12L8 12Z" />
              </svg>
            </span>
          </Radio.Button>
        </Tooltip>
      </Radio.Group>
    </div>
  )
}