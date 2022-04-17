import React,{ useEffect,useState } from 'react';
import {Input,Space } from 'antd';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActions, bindState } from '@/lib/redux';
import qrcodeIcon from '../../../assets/images/el-qrcode.png'
import wxacodeIcon from '../../../assets/images/el-wxcode.png'
import textIcon from '../../../assets/images/el-text.png'
import imgIcon from '../../../assets/images/el-img.png'
import circleIcon from '../../../assets/images/el-circle.png'
import rectIcon from '../../../assets/images/el-rect.png'
import lineIcon from '../../../assets/images/el-line.png'
import avatarIcon from '../../../assets/images/el-avatar.png'

const TYPE = {
  image: [imgIcon,'图片'],
  text: [textIcon,'文字'],
  avatar: [avatarIcon,'头像'],
  line: [lineIcon,'直线'],
  circle: [circleIcon,'圆形'],
  rect: [rectIcon,'矩形'],
  qrcode: [qrcodeIcon,'二维码'],
  wxacode: [wxacodeIcon,'小程序码'],
}

type ElementListProps = {
  elementArr:any[],
  onSelectElement:any,
  onHoverElement:any,
  selectedElementId:any,
  hoverElementId:any,
}


function ElementList({ elementArr,onSelectElement,onHoverElement,selectedElementId,hoverElementId }: ElementListProps) {

  const [toRenderList,setToRenderList ]= useState(elementArr);
  const [cpLock,setCpLock] = useState(false)
  
  function searchFromElementList(keyword) {
    return elementArr.filter(el => {
      let value = `${TYPE[el.drawType][1]}${el.id}`;
      return value.indexOf(keyword)!== -1;
    });
  }

  const onCompositionStart = (e) => {
    setCpLock(true);
  }

  const onCompositionEnd = (e) => {
    setCpLock(false);
    const filteredList = searchFromElementList(e.target.value);
    setToRenderList(filteredList);
  }

  const onSearch = e => {
    if(!cpLock){
      const filteredList = searchFromElementList(e.target.value);
      setToRenderList(filteredList);
    }
  };

  useEffect(()=>{
    setToRenderList(elementArr);
  },[JSON.stringify(elementArr)])

  return (
    <Space direction="vertical">
      <div className="element-container-searchBar">
        <Input 
          placeholder="搜索元素" 
          onInput={onSearch} 
          onCompositionStart={onCompositionStart} 
          onCompositionEnd={onCompositionEnd}
          className="element-container-searchBar-input"
        />
      </div>
      <div className="element-container-allContent">
        <Space direction="vertical">
          {
          toRenderList.map(el=>{
              const [icon,typeName] = TYPE[el.drawType];
              const {id,zIndex} = el;
              return (
                <div 
                  key={id} 
                  className={classnames("element-container-content",{"element-container-content-hover":hoverElementId === id && selectedElementId !== hoverElementId,"element-container-content-active":selectedElementId===id})} 
                  onClick={() => onSelectElement(id)} 
                  onMouseOver={()=>onHoverElement(id)}
                >
                  <img src={icon} className="element-container-content-item element-container-content-icon"/>
                  <div className="element-container-content-item text">{typeName} {id}</div>
                  <div className="element-container-content-item text">图层 {zIndex}</div>
                </div>
              )
            })
          }
      </Space>
      </div>
    </Space>
  )
}


export default connect(
  bindState,
  bindActions(),
)(ElementList);