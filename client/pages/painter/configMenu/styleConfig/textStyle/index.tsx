import * as React from 'react';
import { InputNumber, Tooltip, Collapse, Radio, Select, Button } from 'antd';
import { loadFontFamily } from '@/lib/fontLoad'
import { StyleConfigContext } from '@/lib/context';
import ColorPicker from '@/components/colorPicker';
import {
  AlignLeftOutlined,
  AlignRightOutlined,
  AlignCenterOutlined,
  BoldOutlined,
  ItalicOutlined
} from '@ant-design/icons';
const { Panel } = Collapse
const { Option } = Select;
import fontList from '../../../../../../config/font';

export default function TextStyle() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const [fontLoading,setFontLoading] = React.useState(false);
  const { color, fontSize, textAlign, lineHeight, row, maxRow, textContainerWidth, fontVariant, blocked = false, fontFamily } = selectedElement
  function onFontFamilyChange(v: any){
    setFontLoading(true);
    loadFontFamily(v,() => {
      setFontLoading(false);
      onInfoChange(v,'fontFamily');
    });
  }
  return (
    <>
      <div className="editor-item-container">
        <Collapse defaultActiveKey={['1']} expandIconPosition="right" ghost>
          <Panel header="基本样式" key="1">
            <div className="editor-item-text">
              <div className="editor-item">
                <Tooltip title="文本颜色" overlayStyle={{ width: '75px' }}>
                  <div>
                    <ColorPicker disabled={!!blocked} value={color} onChange={(v: any) => onInfoChange(v, 'color')} />
                  </div>
                </Tooltip>
              </div>
              <div className="editor-item">
                <Tooltip title="文本字号" overlayStyle={{ width: '75px' }}>
                  <span className="label">字号</span>
                  <InputNumber disabled={!!blocked} step={1} onChange={v => onInfoChange(v, 'fontSize')} value={fontSize} className="number-editor-small" precision={0} />
                </Tooltip>
              </div>
              <div className="editor-item">
                <Tooltip title="文本行高" overlayStyle={{ width: '75px' }}>
                  <span className="label">行高</span>
                  <InputNumber disabled={!!blocked} step={1} onChange={v => onInfoChange(v, 'lineHeight')} value={lineHeight} className="number-editor-small" precision={0} />
                </Tooltip>
              </div>
              <div className="editor-item">
                <Radio.Group disabled={!!blocked} value={textAlign} onChange={e => onInfoChange(e.target.value, 'textAlign')} size="small">
                  <Tooltip title="左对齐参考线" overlayStyle={{ width: '100px' }}><Radio.Button value="left"><AlignLeftOutlined /></Radio.Button></Tooltip>
                  <Tooltip title="右对齐参考线" overlayStyle={{ width: '100px' }}><Radio.Button value="right"><AlignRightOutlined /></Radio.Button></Tooltip>
                  <Tooltip title="居中对齐参考线" overlayStyle={{ width: '118px' }}><Radio.Button value="center"><AlignCenterOutlined /></Radio.Button></Tooltip>
                </Radio.Group>
              </div>
              <div className="editor-item">
                <FontStyle />
              </div>
              <div className="editor-item">
                <span className="label">大小写</span>
                <Select disabled={!!blocked} className="detail-editor" value={fontVariant} style={{ width: 100 }} onChange={v => onInfoChange(v, 'fontVariant')}>
                  <Option value="normal">标准</Option>
                  <Option value="small-caps">大写字母</Option>
                </Select>
              </div>
              <div className="editor-item">
                <span className="label">字体</span>
                <Select disabled={!!blocked} className="detail-editor" value={fontFamily} style={{ width: 200 }} onChange={onFontFamilyChange} loading={fontLoading} showSearch optionFilterProp="children">
                  {
                    fontList.filter(item => !!item.url).map(item => (
                      <Option value={item.fontFamily} key={item.fontFamily}>{item.fontFamilyCN}</Option>
                    ))
                  }
                </Select>
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
      <div className="editor-item-container last">
        <Collapse defaultActiveKey={['1']} expandIconPosition="right" ghost>
          <Panel header="其他配置" key="1">
            <div className="editor-item-text">
              <div className="editor-item-horizontal">
                <div className="editor-item">
                  <div className="label">显示行数</div>
                  <Tooltip title="显示行数" overlayStyle={{ width: '75px' }}>
                    <InputNumber disabled={!!blocked} step={1} onChange={v => onInfoChange(v, 'row')} className="number-editor-small" value={row} precision={0} />
                  </Tooltip>
                </div>
                <div className="editor-item">
                  <div className="label">最大行数</div>
                  <Tooltip title="最大行数" overlayStyle={{ width: '100px' }}>
                    <InputNumber disabled={!!blocked} step={1} onChange={v => onInfoChange(v, 'maxRow')} className="number-editor-small" value={maxRow} precision={0} />
                  </Tooltip>
                </div>
              </div>
              <div className="editor-item-horizontal">
                <div className="editor-item">
                  <div className="label">文本框宽度</div>
                  <Tooltip title="文本框宽度" overlayStyle={{ width: '100px' }}>
                    <InputNumber disabled={!!blocked} step={1} className="number-editor-small" onChange={v => onInfoChange(v, 'textContainerWidth')} value={textContainerWidth} precision={0} />
                  </Tooltip>
                </div>
              </div>
            </div>
          </Panel>
        </Collapse>
      </div>
    </>
  )
}

function FontStyle() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { fontWeight, fontStyle, blocked = false } = selectedElement;
  const activeStyle = {
    color: '#40a9ff',
    border: '1px solid #40a9ff',
  };
  const unActiveStyle = {
    color: 'rgba(0,0,0,.55)',
    border: '1px solid #d9d9d9',
  };
  const onTextCheckbox = (e: React.MouseEvent<HTMLElement, MouseEvent>, tag: string) => {
    let value;
    switch (tag) {
      case 'fontWeight': {
        if (selectedElement[tag] === 'normal') {
          value = 'bold';
        } else {
          value = 'normal'
        }
        onInfoChange(value, 'fontWeight');
        break;
      }
      case 'fontStyle': {
        if (selectedElement[tag] === 'normal') {
          value = 'italic';
        } else {
          value = 'normal';
        }
        onInfoChange(value, 'fontStyle');
        break;
      }
      default:
        break;
    }
  }
  return (
    <>
      <Tooltip title="加粗" overlayStyle={{ width: '50px' }}>
        <Button
          disabled={!!blocked}
          size="small"
          className="font-style-btn"
          style={fontWeight === 'normal' ? unActiveStyle : activeStyle}
          onClick={e => onTextCheckbox(e, 'fontWeight')}
        >
          <BoldOutlined />
        </Button>
      </Tooltip>
      <Tooltip title="斜体" overlayStyle={{ width: '50px' }}>
        <Button
          disabled={!!blocked}
          size="small"
          className="font-style-btn"
          style={fontStyle === 'normal' ? unActiveStyle : activeStyle}
          onClick={e => onTextCheckbox(e, 'fontStyle')}
        >
          <ItalicOutlined />
        </Button>
      </Tooltip>

    </>
  )
}