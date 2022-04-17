import * as React from 'react'
import { connect } from 'react-redux'
import { bindActions, bindState } from '@/lib/redux'
import elementMeta from '@/lib/elementMeta'
import { cloneDeep, sortBy } from 'lodash'
import classnames from 'classnames'
import MaterialList from './materialList'
import TemplateList from './templateList'

import textIcon from '../../../assets/images/text.png'
import imgIcon from '../../../assets/images/img-label.png'
import avatarIcon from '../../../assets/images/avatar.png'
import rectIcon from '../../../assets/images/rect.png'
import circleIcon from '../../../assets/images/circle.png'
import lineIcon from '../../../assets/images/line.png'
import templateIcon from '../../../assets/images/template.png'
import qrcodeIcon from '../../../assets/images/qrcode.png'
import imgMaterialIcon from '../../../assets/images/img-material.png'
import wxacodeIcon from '../../../assets/images/wxacode.png'
import elementIcon from '../../../assets/images/element.png'
interface IMenuItem {
  label: string,
  type: string,
  icon: string,
  onClick: () => void
}

function MenuItem(props: IMenuItem) {
  let { label, type, icon, onClick } = props
  const onSelectedElementDrag = event => {
    event.dataTransfer.dropEffect = 'copy';
    const type = event.target.getAttribute('data-type')
    event.dataTransfer.setData('text/plain', JSON.stringify(elementMeta[type]));
  }

  return (
    <div className="element-contorller" onClick={onClick} onDragStart={onSelectedElementDrag}>
      <img className="img-image" alt={label} src={icon} data-type={type} />
      <div>{label}</div>
    </div>
  )
}
class SideMenu extends React.Component<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      materialVisible: false,
      materialType: 'template',
    }
  }

  handleClick = e => {
    const imgUrl = decodeURI(e.target.src);
    const type = 'image';
    const drawData = cloneDeep(this.props.drawData);
    const id = this.getNewElementId()
    const newElement = cloneDeep(elementMeta[type])
    drawData[`${type}Arr`] = drawData[`${type}Arr`] || []
    newElement.id = id
    newElement.zIndex = id
    newElement.url = imgUrl
    newElement.height = newElement.width / e.target.naturalWidth * e.target.naturalHeight
    drawData[`${type}Arr`].push(newElement)
    this.props.setDrawData(drawData)
    this.props.setSelectedElementId(id)
  }

  addElement = type => {
    this.setState({
      materialVisible:false,
    });
    const drawData = cloneDeep(this.props.drawData);
    const id = this.getNewElementId()
    const newElement = elementMeta[type]
    drawData[`${type}Arr`] = drawData[`${type}Arr`] || []
    newElement.id = id
    newElement.zIndex = id
    drawData[`${type}Arr`].push(newElement)
    this.props.setSelectedElementId(id)
    this.props.setDrawData(drawData)
  }

  getNewElementId = () => {
    const { drawData } = this.props
    let elementsArr = []
    Object.keys(drawData).forEach(key => {
      if (key.includes('Arr') && drawData[key] instanceof Array) {
        elementsArr = [].concat.apply(elementsArr, drawData[key])
      }
    })
    let sortedArr = sortBy(elementsArr, (e:any) => e.id)
    let element = sortedArr.pop()
    return element ? element.id + 1 : 0
  }

  toggleMaterial = (type?) => {
    let { materialVisible, materialType } = this.state
    if (!type) {
      this.setState({
        materialVisible: !materialVisible,
      })
      return
    }
    if (materialType === type) {
      materialVisible = !materialVisible
    } else {
      materialType = type
      materialVisible = true
    }
    this.setState({
      materialVisible,
      materialType,
    })
  }

  toggleEleList = () => {
    this.props.onToggleEleList()
  }

  render() {
    let { materialVisible, materialType, materialKey } = this.state
    return (
      <div className="side-panel">
        <div className="menu-container">
          <div className="element-contorller-container">
            <MenuItem label="模板" type="template" onClick={() => this.toggleMaterial('template')} icon={templateIcon} />
            <MenuItem label="素材" type="image" onClick={() => this.toggleMaterial('image')} icon={imgMaterialIcon} />
            <MenuItem label="元素" type="elements" onClick={() => this.toggleEleList()} icon={elementIcon}/>
            <MenuItem label="文字" type="text" onClick={() => this.addElement('text')} icon={textIcon} />
            <MenuItem label="图片" type="image" onClick={() => this.addElement('image')} icon={imgIcon} />
            <MenuItem label="头像" type="avatar" onClick={() => this.addElement('avatar')} icon={avatarIcon} />
            <MenuItem label="二维码" type="qrcode" onClick={() => this.addElement('qrcode')} icon={qrcodeIcon} />
            <MenuItem label="小程序码" type="wxacode" onClick={() => this.addElement('wxacode')} icon={wxacodeIcon} />
            <MenuItem label="矩形" type="rect" onClick={() => this.addElement('rect')} icon={rectIcon} />
            <MenuItem label="圆形" type="circle" onClick={() => this.addElement('circle')} icon={circleIcon} />
            <MenuItem label="直线" type="line" onClick={() => this.addElement('line')} icon={lineIcon} />
          </div>
        </div>

        <div className={classnames('material-container', { close: !materialVisible })}>
          <div className={classnames('material-panel', { close: !materialVisible })}>
            {
              materialType === 'template' &&
              <TemplateList />
            }
            {
              materialType === 'image' &&
              <MaterialList handleClick={this.handleClick} />
            }
          </div>
          <div className={classnames('material-content-toggle', { close: !materialVisible })} onClick={() => this.toggleMaterial()} />
        </div>
      </div>
    )
  }
}
export default connect(bindState, bindActions())(SideMenu)
