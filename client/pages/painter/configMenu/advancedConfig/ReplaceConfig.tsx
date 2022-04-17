import * as React from 'react';
import { Select } from 'antd';
import elementMeta from '@/lib/elementMeta';
import { map, isEmpty,cloneDeep } from 'lodash';
import { AdvancedConfigContext } from '@/lib/context';

const { Option } = Select;

export default function ReplaceConfig() {
  const { selectedElement } = React.useContext(AdvancedConfigContext);
  const { drawType, placeholders } = selectedElement;
  let replaceableField = cloneDeep(elementMeta.placeholder[drawType]);
  // 替换字段对应值为undefined情况，视为没有该替换字段
  if(replaceableField && replaceableField.length){
    for(let i=0;i<replaceableField.length;){
      const {field} = replaceableField[i];
      if(typeof selectedElement[field] === 'undefined'){
        replaceableField.splice(i,1);
      }
      i++;
    }
  }
  const isShow = (replaceableField && replaceableField.length) || (placeholders && placeholders.length);
  return (
    <div className="editor-item-container">
      <div className="replace-config-container">
        {
          isShow ? (
            <div className="replace-config">
              <PlaceholderSelect />
            </div>
          ) : <div className="default-tip">当前元素无可替换字段</div>
        }
      </div>
    </div>

  )
}

function PlaceholderSelect() {
  const { selectedElement, onInfoChange } = React.useContext(AdvancedConfigContext);
  const { drawType, placeholders, id, blocked, listOptions } = selectedElement
  let replaceableField = cloneDeep(elementMeta.placeholder[drawType])
  // 替换字段对应值为undefined情况，视为没有该替换字段
  if(replaceableField && replaceableField.length){
    for(let i=0;i<replaceableField.length;){
      const {field} = replaceableField[i];
      if(typeof selectedElement[field] === 'undefined'){
        replaceableField.splice(i,1);
      }
      i++;
    }
  }
  if (!isEmpty(listOptions)) {
    replaceableField = replaceableField.concat(elementMeta.placeholder.listElement)
  }
  return (
    <div className="placeholder-select">
      <div className="label-main">替换字段</div>
      <Select
        mode="multiple"
        placeholder="Please select"
        style={{ flex: 1 }}
        value={placeholders}
        onChange={v => onInfoChange(v, 'placeholders', true)}
        className="editor-item"
        disabled={!!blocked}
      >
        {
          map(replaceableField, item => (
            <Option key={item.field} value={item.field}>
              {`${item.name}($${item.field}$${id})`}
            </Option>
          ),
          )
        }
      </Select>
    </div>
  )
}
