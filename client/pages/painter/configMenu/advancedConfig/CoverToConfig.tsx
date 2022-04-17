/*
 * @Author: ran
 * @Date: 2022-02-26 12:21:13
 * @LastEditors: ran
 * @LastEditTime: 2022-03-01 10:47:11
 */
import * as React from 'react';
import { InputNumber, Collapse } from 'antd';
import ElementListSelect from './ElementListSelect'
import { AdvancedConfigContext } from '@/lib/context';

const { Panel } = Collapse;

export default function CoverToConfig() {
  const { selectedElement, onInfoChange } = React.useContext(AdvancedConfigContext);
  const { coverTo = {}, blocked } = selectedElement;

  function onCoverToTargetChange(v: any) {
    const { coverTo } = selectedElement;
    if (v === undefined) {
      onInfoChange(undefined, 'coverTo', true);
    } else {
      onInfoChange({ ...coverTo, target: v }, 'coverTo', true)
    }
  }
  const option = {
    disabled: !!blocked,
    value: coverTo.target,
    className: 'target-select',
    onChange: onCoverToTargetChange,
  }
  return (
    <div className="editor-item-container">
      <Collapse expandIconPosition="right" ghost defaultActiveKey="1">
        <Panel header="高度配置" key="1">
          <div className="panel-content">
            <div className="editor-item-horizontal">
              <div className="label">覆盖目标ID</div>
              <ElementListSelect {...option} />
            </div>
            {
              coverTo.target !== undefined && (
                <div className="editor-item-horizontal">
                  <div className="label">下边距</div>
                  <InputNumber precision={0} disabled={!!blocked} value={coverTo.marginBottom} className="detail-item" onChange={val => onInfoChange({ ...coverTo, marginBottom: val }, 'coverTo', true)} />
                </div>
              )
            }
          </div>
        </Panel>
      </Collapse>
    </div>
  );
}
