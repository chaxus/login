import * as React from 'react';
import { InputNumber, Select, Tooltip, Collapse, Radio, RadioChangeEvent } from 'antd';
import ElementListSelect from './ElementListSelect'
import { AdvancedConfigContext } from '@/lib/context';


const { Panel } = Collapse;
const { Option } = Select;

export default function FollowOptionsConfig() {
  const { selectedElement, onInfoChange } = React.useContext(AdvancedConfigContext);
  const { followOptions = {}, blocked } = selectedElement;
  let { positonOption, sizeOption } = followOptions || {}
  let enablePositionFollow = !!positonOption
  let enableSizeFollow = !!sizeOption
  const { target: positionTarget, axis, marginTop, marginLeft, justify } = positonOption || {}
  const { target: sizeTarget, paddingTop, paddingBottom, paddingLeft, paddingRight, sizeType } = sizeOption || {}

  const onFollowOptionsChange = (option: { target?: any; axis?: any; justify?: any; marginTop?: any; marginLeft?: any; sizeType?: any; paddingTop?: any; paddingBottom?: any; paddingLeft?: any; paddingRight?: any; }, type: string) => {
    const { followOptions } = selectedElement
    let { positonOption, sizeOption } = followOptions || {}
    if (type === 'position') {
      positonOption = { ...positonOption, ...option }
    } else if (type === 'size') {
      sizeOption = { ...sizeOption, ...option }
    }
    if ((positonOption === undefined || positonOption.target === -1) && (sizeOption === undefined || sizeOption?.target === -1)) {
      onInfoChange({ positonOption, sizeOption }, 'followOptions', true);
    } else {
      onInfoChange({ positonOption, sizeOption }, 'followOptions');
    }
  }

  const enableFollow = (e: RadioChangeEvent, type: string) => {
    let v = e.target.value
    const { followOptions } = selectedElement;
    let { positonOption, sizeOption } = followOptions || {}
    if (type === 'position') {
      positonOption = v ? { target: -1 } : null
    } else if (type === 'size') {
      sizeOption = v ? { target: -1 } : null
    }
    onInfoChange({ positonOption, sizeOption }, 'followOptions', true)
  }
  return (
    <div className="editor-item-container">
      <Collapse expandIconPosition="right" ghost defaultActiveKey="1">
        <Panel header="随动配置" key="1">
          <div className="panel-content">
            <div className="editor-item-horizontal">
              <div className="label">位置随动</div>
              <Radio.Group onChange={e => enableFollow(e, 'position')} value={enablePositionFollow}>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </div>
            {
              enablePositionFollow && (
                <>
                  <div className="editor-item-horizontal">
                    <div className="label">参照元素</div>
                    <ElementListSelect disabled={!!blocked} value={positionTarget} className="target-select" onChange={val => onFollowOptionsChange({ target: val }, 'position')} />
                  </div>
                  <div className="editor-item-horizontal">
                    <div className="label">位置类型</div>
                    <Select disabled={!!blocked} value={axis} className="detail-item" onChange={val => onFollowOptionsChange({ axis: val }, 'position')}>
                      <Option value="y">y轴随动</Option>
                      <Option value="x">x轴随动</Option>
                    </Select>
                  </div>
                  {
                    axis === 'y' && (
                      <>
                        <div className="editor-item-horizontal">
                          <div className="label">对齐方式</div>
                          <Select disabled={!!blocked} value={justify} className="detail-item" onChange={val => onFollowOptionsChange({ justify: val }, 'position')}>
                            <Option value="start">起始对齐</Option>
                            <Option value="">默认对齐</Option>
                          </Select>
                        </div>
                        <div className="editor-item-horizontal">
                          <div className="label">上边距</div>
                          <InputNumber precision={0} disabled={!!blocked} value={marginTop} onChange={val => onFollowOptionsChange({ marginTop: val }, 'position')} className="detail-item" />
                        </div>
                      </>
                    )
                  }
                  {
                    axis === 'x' && (
                      <div className="editor-item-horizontal">
                        <div className="label">左边距</div>
                        <InputNumber precision={0} disabled={!!blocked} value={marginLeft || 0} onChange={val => onFollowOptionsChange({ marginLeft: val }, 'position')} className="detail-item" />
                      </div>
                    )
                  }
                </>
              )
            }

            <div className="editor-item-horizontal">
              <div className="label">宽高随动</div>
              <Radio.Group onChange={e => enableFollow(e, 'size')} value={enableSizeFollow}>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </div>
            {
              enableSizeFollow && (
                <>
                  <div className="editor-item-horizontal">
                    <div className="label">参照元素</div>
                    <ElementListSelect disabled={!!blocked} value={sizeTarget} className="target-select" onChange={val => onFollowOptionsChange({ target: val }, 'size')} />
                  </div>
                  <div className="editor-item-horizontal">
                    <div className="label">尺寸类型</div>
                    <Select disabled={!!blocked} value={sizeType} className="detail-item" onChange={val => onFollowOptionsChange({ sizeType: val }, 'size')}>
                      <Option value="width">仅宽度</Option>
                      <Option value="height">仅高度</Option>
                      <Option value="both">宽度+高度</Option>
                    </Select>
                  </div>
                  <div className="editor-item-horizontal">
                    <div className="label">内边距设置</div>
                    <Tooltip title="上边距" placement="top" overlayStyle={{ width: '70px' }}>
                      <InputNumber precision={0} disabled={!!blocked} value={paddingTop} className="number-editor-medium" onChange={val => onFollowOptionsChange({ paddingTop: val }, 'size')} />
                    </Tooltip>
                    <Tooltip title="下边距" placement="top" overlayStyle={{ width: '70px' }}>
                      <InputNumber precision={0} disabled={!!blocked} value={paddingBottom} className="number-editor-medium" onChange={val => onFollowOptionsChange({ paddingBottom: val }, 'size')} />

                    </Tooltip>
                    <Tooltip title="左边距" placement="top" overlayStyle={{ width: '70px' }}>
                      <InputNumber precision={0} disabled={!!blocked} value={paddingLeft} className="number-editor-medium" onChange={val => onFollowOptionsChange({ paddingLeft: val }, 'size')} />

                    </Tooltip>
                    <Tooltip title="右边距" placement="top" overlayStyle={{ width: '70px' }}>
                      <InputNumber precision={0} disabled={!!blocked} value={paddingRight} className="number-editor-medium special" onChange={val => onFollowOptionsChange({ paddingRight: val }, 'size')} />

                    </Tooltip>
                  </div>
                </>
              )
            }

          </div>
        </Panel>
      </Collapse>
    </div>
  );
}