import * as React from 'react';
import { InputNumber, Checkbox, message, Input } from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';
import { StyleConfigContext } from '@/lib/context';
import { get } from '@/lib/request';
import SearchInput from '@/components/searchInput';
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_1987629_kbniw1tfqwc.js',
});
const { TextArea } = Input;
export default function ReplaceContent() {
  const [wxappList, setWxappList] = React.useState([]);
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { drawType, zIndex, text, url, blocked = false, wxappId, path } = selectedElement;
  const fetchWxapp = async () => {
    try {
      let { success, data = [], message: errMessage } = await get('/proxy/alita/api/inside/getMinis')
      if (success) {
        setWxappList(data)
      } else {
        message.error('查询失败', errMessage)
        console.error('查询失败', errMessage)
      }

    } catch (error:any) {
      message.error('查询失败', error)
      console.error('查询失败', error)
      setWxappList([])
    }
  }
  React.useEffect(() => {
    fetchWxapp();
  }, [])

  return (
    <div className="editor-item-container">
      <div className="editor-item-zindex">
        <span className="label">锁定</span>
        <div className="opration-icons">
          <Checkbox onChange={e => onInfoChange(e.target.checked,'blocked',true)} checked={!!blocked} />
        </div>
      </div>
      <div className="editor-item-zindex">
        <span className="label">图层</span>
        <div className="opration-icons">
          <div className="opration-icons-items" onClick={() => { onInfoChange(zIndex + 1, 'zIndex') }}>
            <IconFont type="icon-ziyuan" className="icon-item" />
            <span className="index-opration">上移一层</span>
          </div>
          <div className="opration-icons-items" onClick={() => { onInfoChange(zIndex - 1, 'zIndex') }}>
            <IconFont type="icon-xiayiyiceng" className="icon-item" />
            <span className="index-opration">下移一层</span>
          </div>
        </div>
        <div className="current-zIndex">
          <span className="label">当前图层</span>
          <InputNumber
            className="zIndex-editor"
            step={1}
            disabled={!!blocked}
            onChange={v => onInfoChange(v, 'zIndex')}
            value={zIndex}
            size="small"
            precision={0}
          />
        </div>
      </div>
      {drawType === 'text' && (
        <div className="editor-item-replace">
          <span className="label">文本</span>
          <TextArea
            disabled={!!blocked}
            onChange={e => onInfoChange(e.target.value, 'text')}
            className="replace-content"
            value={text}
            name="text"
            rows={3}
          />
        </div>
      )}
      {(drawType === 'image' || drawType === 'avatar') && (
        <div className="editor-item-replace">
          <span className="label">图片地址</span>
          <Input disabled={!!blocked} onChange={e => onInfoChange(e.target.value, 'url')} className="replace-content" value={url} />
        </div>
      )}
      {drawType === 'qrcode' && (
        <div className="editor-item-replace">
          <span className="label">二维码内容</span>
          <Input onChange={e => onInfoChange(e.target.value, 'url')} className="replace-content" value={url} />
        </div>
      )}
      {drawType === 'wxacode' && (
        <>
          <div className="editor-item-replace">
            <span className="label">小程序</span>
            <SearchInput options={wxappList} value={wxappId} placeholder="输入小程序名查找" onChange={(v: any) => onInfoChange(v, 'wxappId')} style={{ flex: 1 }} />
          </div>
          <div className="editor-item-replace">
            <span className="label">path</span>
            <Input onChange={e => onInfoChange(e.target.value, 'path')} className="replace-content" value={path} />
          </div>
        </>
      )}
    </div>
  )

}