/*
 * @Author: ran
 * @Date: 2022-02-26 12:21:13
 * @LastEditors: ran
 * @LastEditTime: 2022-03-01 20:16:24
 */
import * as React from 'react';
import { InputNumber, Tooltip, Collapse, Radio } from 'antd';
import { AdvancedConfigContext } from '@/lib/context';

const { Panel } = Collapse;


export default function ListConfig() {
  const { selectedElement, onInfoChange,onMultiInfoChange } = React.useContext(AdvancedConfigContext);
  const { listOptions = {}, blocked } = selectedElement;
  let enableListOption = (listOptions && Object.keys(listOptions).length > 0)

  const enableList = (e:any) => {
    let v = e.target.value
    let { listOptions, placeholders = [] } = selectedElement;
    if (v) {
      listOptions = { count: 3 }
      placeholders.push('count')
    } else {
      listOptions = null
      let index = placeholders.indexOf('count')
      if (index > -1) {
        placeholders.splice(index, 1)
      }
    }
    onMultiInfoChange({ listOptions, placeholders })
  }
  return (
    <div className="editor-item-container">
      <Collapse expandIconPosition="right" ghost defaultActiveKey="1">
        <Panel header="列表配置" key="1">
          <div className="panel-content">
            <div className="editor-item-horizontal">
              <div className="label">列表配置</div>
              <Radio.Group onChange={enableList} value={enableListOption}>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
              </Radio.Group>
            </div>
            {
              enableListOption && (
                <>
                  <div className="editor-item-horizontal">
                    <div className="label">列表项数</div>
                    <Tooltip title="该元素的展示次数" placement="top">
                      <InputNumber precision={0} value={listOptions.count} disabled={!!blocked} onChange={val => onInfoChange({ ...listOptions, count: val }, 'listOptions')} className="detail-item" />
                    </Tooltip>
                  </div>
                  <div className="editor-item-horizontal">
                    <div className="label">展示列数</div>
                    <Tooltip title="该元素在每行展示的数量" placement="top">
                      <InputNumber precision={0} value={listOptions.column} disabled={!!blocked} onChange={val => onInfoChange({ ...listOptions, column: val }, 'listOptions')} className="detail-item" />
                    </Tooltip>
                  </div>
                  <div className="editor-item-horizontal">
                    <div className="label">间距</div>
                    <Tooltip title="行间距" placement="top">
                      <InputNumber precision={0} value={listOptions.rowSpacing} disabled={!!blocked} onChange={val => onInfoChange({ ...listOptions, rowSpacing: val }, 'listOptions')} className="input-number-peer" />
                    </Tooltip>
                    <Tooltip title="列间距" placement="top">
                      <InputNumber precision={0} value={listOptions.columnSpacing} disabled={!!blocked} onChange={val => onInfoChange({ ...listOptions, columnSpacing: val }, 'listOptions')} className="input-number-peer special" />
                    </Tooltip>
                  </div>
                  <div className="editor-item-horizontal">
                    <div className="label">相对距离</div>
                    <Tooltip title="行相对距离" placement="top">
                      <InputNumber precision={0} value={listOptions.rowDistance} disabled={!!blocked} onChange={val => onInfoChange({ ...listOptions, rowDistance: val }, 'listOptions')} className="input-number-peer" />
                    </Tooltip>
                    <Tooltip title="列相对距离" placement="top">
                      <InputNumber precision={0} value={listOptions.columnDistance} disabled={!!blocked} onChange={val => onInfoChange({ ...listOptions, columnDistance: val }, 'listOptions')} className="input-number-peer special" />
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