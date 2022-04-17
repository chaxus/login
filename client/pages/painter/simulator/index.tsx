import * as React from 'react'
import { bindActions, bindState } from '@/lib/redux'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  LockOutlined,
  UnlockOutlined,
  ExportOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { cloneDeep, isEqual, isEmpty, sortBy, List } from 'lodash'
import { connect } from 'react-redux'
import classnames from 'classnames'
import ImgCrop from 'antd-img-crop';
import Draggable from 'react-draggable';
import {
  message,
  Slider,
  Form,
  Input,
  Button,
  Upload,
  InputNumber,
  Modal,
  Radio,
} from 'antd'
import UndoRedo from './UndoRedo'
import ElementList from './elementList'
import CanvasCore from '@/lib/canvasCore'
import { downloadFile } from '@/utils/index';
import { getSelectedElementById } from '../../../utils'
const { Item } = Form
const REFERENCE_LINE_TYPE = {
  NOP: 0, // 选中常驻状态
  DRAG: 1, // 拖拽状态
  HOVER: 2, // 鼠标hover状态
}
const HD_RATIO = 2; // 高清比例
const INITIAL_CANVAS_WIDTH = 750;

class Simulator extends React.Component<any, any> {
  contentCanvas: any;
  referenceCanvas: any;
  maskCanvas: any;
  simulatorContainer: any;
  canvasContainer: any;
  contextMenuRef: any;
  elementEditMenuContainer: any;
  textDbClickEditContainer:any;
  scale: any;
  canvasInstance: any;
  selectedElement: any;
  isCliping: boolean | undefined
  clickedPosition: any;
  onClipArea: any;
  blockedID: any;
  startPointInfo: any;
  firstClickTime: any;
  startElement: any;
  selectedElementMove: any
  dbClickTimeID: any;
  contextMenuClickEvent: any
  tempSelectedElement: any



  constructor(props:any) {
    super(props)
    this.state = {
      drawData: {},
      selectedElement: {},
      defaultCanvasWidth: 750,
      defaultCanvasHeight: 1334,
      canvasWidth: 750,
      canvasHeight: 1334,
      showEditMenu: false,
      showDbClickTextEditDom:false,
      exportModalVisible:false,
      showEleList:true,
      exportSizeScale:1,
      hoverElementId:-1,
      cpLock:false,
    }
    this.contentCanvas = React.createRef()
    this.referenceCanvas = React.createRef()
    this.maskCanvas = React.createRef()
    this.simulatorContainer = React.createRef()
    this.canvasContainer = React.createRef()
    this.contextMenuRef = React.createRef()
    this.elementEditMenuContainer = React.createRef()
    this.textDbClickEditContainer = React.createRef()
  }

  static getDerivedStateFromProps(nextProps:any) {
    const { drawData } = nextProps
    return {
      drawData: cloneDeep(drawData),
    }
  }

  componentDidUpdate(prevProps:any, prevState:any) {
    if (!isEqual(prevState.drawData, this.state.drawData)) {
      if (prevState.drawData.height !== this.state.drawData.height || prevState.drawData.width !== this.state.drawData.width) {
        this.initCanvas()
      } else {
        this.reDraw()
      }
    }
  }

  componentDidMount() {
    this.initCanvas()
    this.referenceCanvas.current.addEventListener('mousedown', this.onTouchStart)
    this.referenceCanvas.current.addEventListener('mouseup', this.onTouchEnd)
    this.referenceCanvas.current.addEventListener('contextmenu', this.handleContextMenu)
    this.referenceCanvas.current.addEventListener('mousemove', this.mouseOverCanvas)
    this.simulatorContainer.current.addEventListener('contextmenu', this.handleContextMenu)
    this.canvasContainer.current.addEventListener('mousemove',this.mouseOverCanvasContainer)
    document.addEventListener('click', this.globalHandleClick)
    window.addEventListener('resize', this.calculatorScrollDis);
    this.calculatorScrollDis()
  }

  componentWillUnmount() {
    this.referenceCanvas.current.removeEventListener('mousedown', this.onTouchStart)
    this.referenceCanvas.current.removeEventListener('mouseup', this.onTouchEnd)
    this.referenceCanvas.current.removeEventListener('contextmenu', this.handleContextMenu)
    document.removeEventListener('click', this.globalHandleClick)
    window.removeEventListener('resize', this.calculatorScrollDis);
  }

  initCanvas = async () => {
    let { drawData, canvasWidth, canvasHeight } = this.state
    if (isEmpty(drawData)) {
      drawData = {
        width: canvasWidth,
        height: canvasHeight,
      }
    }
    const { width, height } = drawData
    // 画板宽度和模版真实宽度的缩放比例
    this.scale = canvasWidth / width
    this.setState({ canvasHeight: height * this.scale, defaultCanvasWidth: width, defaultCanvasHeight: height })
    this.canvasInstance = new CanvasCore({
      canvas: this.contentCanvas.current,
      scale: this.scale,
      referenceCanvas: this.referenceCanvas.current,
      maskCanvas: this.maskCanvas.current,
    })
    await this.canvasInstance.draw(drawData)
    if (!Number.isNaN(this.props.selectedElementId) && this.props.selectedElementId !== -1) {
      this.canvasInstance.drawReferenceLine(this.props.selectedElementId)
    }
  }

  reDraw = async () => {
    let { drawData } = this.state
    let { selectedElementId } = this.props
    // 重新绘制drawData
    await this.canvasInstance.draw(drawData)
    // 重新绘制参考线
    this.canvasInstance.drawReferenceLine(selectedElementId)
  }

  // 计算模拟器展示的位置
  calculatorScrollDis = () => {
    const { clientWidth } = this.simulatorContainer.current
    const { clientWidth: canvasContainerWidth } = this.canvasContainer.current
    if (this.simulatorContainer.current) {
      this.simulatorContainer.current.scrollLeft = (canvasContainerWidth - clientWidth) / 2
      setTimeout(() => {
        this.simulatorContainer.current.scrollTop = 377
      }, 0)
    }
  }

  /**
   * 关闭右键点击显示的菜单
   */
  globalHandleClick = (e:any) => {
    if (e.target.className === 'canvas stand') {
      document.addEventListener('keydown', this.onKeyDown)
      document.addEventListener('keyup', this.onKeyUp)
    } else {
      document.removeEventListener('keydown', this.onKeyDown)
      document.removeEventListener('keyup', this.onKeyUp)
      if(e.target.className!== 'canvas-container' && e.target.className!=='text-dbClickEdit-container'){ // 关闭双击文本编辑文本框
        this.setState({
          showDbClickTextEditDom:false
        })
      }
    }
    const { contextMenuVisible } = this.state
    if (contextMenuVisible) {
      this.setState({ contextMenuVisible: false })
    }
  }

  /**
   * 取消hover效果
   * @param e 
   */
  mouseOverCanvasContainer = (e: { target: { className: string } }) => {
    if(e.target.className === 'canvas stand'){
      return;
    }else{
      this.setState({
        hoverElementId:-1,
      })
    }
  }

  getElementById = (id: any) => {
    let { drawData } = this.state
    let elementsArr: any = []
    Object.keys(drawData).forEach(key => {
      if (key.includes('Arr') && drawData[key] instanceof Array) {
        elementsArr = elementsArr.concat(drawData[key])
      }
    })
    let element = elementsArr.find((item: { id: any }) => item.id === id)
    return element
  }

  getElementList = () => {
    const {drawData} = this.props;
    let allElArr: any[] = [];
    for (let i = 0, keys = Object.keys(drawData); i < keys.length; i++) {
      let elementList = drawData[keys[i]]
      if (Array.isArray(elementList)) {
        elementList.forEach(item => {
          const {id,drawType,zIndex} = item;
          allElArr.push({id,drawType,zIndex});
        })
      }
    }
    allElArr = allElArr.sort(function(el1,el2){
      return el2.zIndex - el1.zIndex;
    })
    return allElArr;
  }

  positionHandleMap = {
    'left-top': {
      cursor: 'nwse-resize',
    },
    'left-middle': {
      cursor: 'ew-resize',
    },
    'left-bottom': {
      cursor: 'nesw-resize',
    },
    'right-top': {
      cursor: 'nesw-resize',
    },
    'right-middle': {
      cursor: 'ew-resize',
    },
    'right-bottom': {
      cursor: 'nwse-resize',
    },
    'top-middle': {
      cursor: 'ns-resize',
    },
    'bottom-middle': {
      cursor: 'ns-resize',
    },
  }

  mouseOverCanvas = (e: { offsetX: any; offsetY: any }) => {
    const { offsetX, offsetY } = e
    const { elementId: hoverElementId, position } = this.canvasInstance.getTouchInElement(offsetX / this.scale * HD_RATIO, offsetY / this.scale * HD_RATIO)
    let { selectedElementId } = this.props
    // 记录hover的元素id
    if (Number.isNaN(hoverElementId) || hoverElementId === -1) {
      this.setState({
        hoverElementId:-1,
      });
      return;
    }
    this.setState({
      hoverElementId,
    });
    let hoverElement: any = this.getElementById(hoverElementId) || {}
    let { drawType } = hoverElement
    if (!this.isCliping) {
      this.canvasInstance.drawReferenceLine(selectedElementId, { type: REFERENCE_LINE_TYPE.HOVER, hoverElementId })
    }
    if (this.selectedElement && hoverElementId === selectedElementId) {
      if (this.positionHandleMap[position as keyof typeof this.positionHandleMap]) {
        if (drawType === 'text') {
          if (position === 'right-top' || position === 'left-top') {
            this.referenceCanvas.current.style.cursor = 'ew-resize'
          } else if (position === 'top-middle' || position === 'bottom-middle') {
            this.referenceCanvas.current.style.cursor = 'move-resize'
          }
        } else {
          this.referenceCanvas.current.style.cursor = this.positionHandleMap[position as keyof typeof this.positionHandleMap].cursor
        }
      } else {
        this.referenceCanvas.current.style.cursor = 'move'
      }
    } else {
      this.referenceCanvas.current.style.cursor = 'auto'
    }
  }

  /**
   * 双击以后要执行的操作
   * @param {Event} event
   */
  dbClickHandler = (event: any) => {
    const { target, offsetX, offsetY } = event
    const { offsetTop, offsetLeft } = target
    if (this.selectedElement.drawType === 'image') {
      this.inClipImage()
    } else if(this.selectedElement.drawType==='text'){
      const {x,y,lineHeight,fontSize} = this.selectedElement;
      const rlineHeight = (fontSize > lineHeight ? fontSize : lineHeight) * this.scale / HD_RATIO
      this.setState({
        showDbClickTextEditDom: true,
      },()=>{
        this.textDbClickEditContainer.current.style.left = `${(offsetLeft + x * this.scale / HD_RATIO )}px`
        this.textDbClickEditContainer.current.style.top = `${(offsetTop + y * this.scale / HD_RATIO - rlineHeight / 2)}px`
      })
    }else {
      this.setState({
        showEditMenu: true,
      }, () => {
        this.elementEditMenuContainer.current.style.left = `${(offsetX + offsetLeft)}px`
        this.elementEditMenuContainer.current.style.top = `${(offsetTop + offsetY)}px`
      })
    }
  }

  inClipImage = () => {
    this.isCliping = true
    this.canvasInstance.drawClipMask(this.selectedElement.id)
  }

  outClipImage = () => {
    this.isCliping = false
    this.canvasInstance.clearClipMask()
  }

  /**
   * 模拟点击元素列表
   * @param id
   */
  onSelectElement = (id: any) => {
    this.selectedElement = this.getElementById(id);
    this.canvasInstance.drawReferenceLine(id);
    this.props.setSelectedElementId(id);
  }

  /**
   * 模拟hover元素列表
   */
  onHoverElement = (hoverElementId: any) => {
    let { selectedElementId } = this.props
    if (!this.isCliping) {
      this.canvasInstance.drawReferenceLine(selectedElementId, { type: REFERENCE_LINE_TYPE.HOVER, hoverElementId })
    }
  }

  
  /**
   * 模拟点击监听事件
   * @param {Event} e
   */
  onTouchStart = (e: { offsetX: any; offsetY: any; button: any }) => {
    const { offsetX, offsetY, button } = e
    // button: 0 鼠标左键点击
    if (button !== 0) return
    // 获取当前点击区域内的元素
    let { elementId, position, onClipArea } = this.canvasInstance.getTouchInElement(offsetX / this.scale * HD_RATIO, offsetY / this.scale * HD_RATIO) // 从canvasCore里获取的element数据
    this.selectedElement = this.getElementById(elementId)
    this.clickedPosition = position
    this.onClipArea = onClipArea

    // 点击元素为空
    if (!this.selectedElement || isEmpty(this.selectedElement)) {
      this.selectedElement = null
      this.props.setSelectedElementId(-1)
      this.canvasInstance.drawReferenceLine(-1)
      this.outClipImage()
      this.setState({
        showDbClickTextEditDom:false
      })
      return
    }

    // 点击元素与当前选中元素不同
    if (this.selectedElement.id !== this.props.selectedElementId) {
      this.outClipImage()
      this.canvasInstance.drawReferenceLine(this.selectedElement.id)
      setTimeout(() => {
        // setTimeout解决 mousedown 与 inputNumber组件onblur引发的onchange 导致元素属性修改影响到点击元素上
        this.props.setSelectedElementId(this.selectedElement.id);
      }, 0)
      this.setState({
        showDbClickTextEditDom:false
      })
    }

    // 元素锁定
    const { blocked } = this.selectedElement
    if (blocked) {
      if (!this.blockedID) {
        message.warning('该图层已锁定，不可编辑')
        this.blockedID = setTimeout(() => {
          clearTimeout(this.blockedID)
          this.blockedID = null
        }, 2000)
      }
      return
    }

    this.simulatorContainer.current.addEventListener('mousemove', this.onTouchMove)

    // 记录当前点击的坐标的元信息以及当前元素信息
    this.startPointInfo = {
      touchStartPointX: offsetX,
      touchStartPointY: offsetY,
    }
    this.startElement = cloneDeep(this.selectedElement)

    // 判断是否是双击
    if (!this.firstClickTime) {
      this.firstClickTime = Date.now()
      this.dbClickTimeID = setTimeout(() => {
        clearTimeout(this.dbClickTimeID)
        this.firstClickTime = null
      }, 200)
      if (this.elementEditMenuContainer.current) {
        this.setState({
          showEditMenu: false,
        })
      }
    } else {
      const dblclickTime = Date.now()
      if (this.firstClickTime && (dblclickTime - this.firstClickTime < 200)) {
        this.referenceCanvas.current.removeEventListener('mousemove', this.onTouchMove)
        this.dbClickHandler(e)
      }
    }
  }

  /**
   * 模拟器中元素拖动事件监听
   * @param {Event} e
   */
  onTouchMove = (e: { offsetX: any; offsetY: any; target: any }) => {
    if (!this.selectedElement || isEmpty(this.selectedElement)) return
    this.selectedElementMove = true
    const { followOptions = {}, drawType, unclippedAttr } = this.selectedElement
    let { offsetX, offsetY, target } = e
    if (target === this.canvasContainer.current) {
      offsetX = offsetX - (this.simulatorContainer.current.scrollLeft)
      offsetY = offsetY - (this.simulatorContainer.current.scrollTop)
    }
    const { touchStartPointX, touchStartPointY } = this.startPointInfo
    let { x: elementOriginX, y: elementOriginY, height: elementOriginH, width: elementOriginW, points: elementOriginPoints,
      radius: elementOriginR, fontSize: originFontSize, lineHeight: originLineHeight, textContainerWidth: originTextContainerWidth = 300 } = this.startElement
    let { x: originUnclippedX = elementOriginX, y: originUnclippedY = elementOriginY, width: originUnclippedWidth = elementOriginW,
      height: originUnclippedHeight = elementOriginH } = this.startElement.unclippedAttr || {}
    let diffX = (offsetX - touchStartPointX) / this.scale * HD_RATIO
    let diffY = (offsetY - touchStartPointY) / this.scale * HD_RATIO
    let updateElementMap: any = {}
    if (drawType === 'line') {
      if (this.clickedPosition !== undefined) {
        this.selectedElement.points[this.clickedPosition].x = Math.floor(offsetX / this.scale * HD_RATIO * 100) / 100
        this.selectedElement.points[this.clickedPosition].y = Math.floor(offsetY / this.scale * HD_RATIO * 100) / 100
      } else {
        this.selectedElement.points[0].x = Math.floor((elementOriginPoints[0].x + diffX) * 100) / 100
        this.selectedElement.points[0].y = Math.floor((elementOriginPoints[0].y + diffY) * 100) / 100
        this.selectedElement.points[1].x = Math.floor((elementOriginPoints[1].x + diffX) * 100) / 100
        this.selectedElement.points[1].y = Math.floor((elementOriginPoints[1].y + diffY) * 100) / 100
      }
    } else if (!this.clickedPosition) {
      const { axis } = followOptions
      if (axis !== 'x') {
        if (!this.isCliping || (this.isCliping && !unclippedAttr)) {
          this.selectedElement.x = Math.floor((elementOriginX + diffX) * 100) / 100
        }
        if (unclippedAttr) {
          if (this.isCliping) {
            this.selectedElement.unclippedAttr.x = Math.max(Math.min(Math.floor((originUnclippedX + diffX) * 100) / 100, elementOriginX), elementOriginX + elementOriginW - originUnclippedWidth)
          } else {
            this.selectedElement.unclippedAttr.x = Math.floor((originUnclippedX + diffX) * 100) / 100
          }
        }
      }
      if (axis !== 'y') {
        if (!this.isCliping || (this.isCliping && !unclippedAttr)) {
          this.selectedElement.y = Math.floor((elementOriginY + diffY) * 100) / 100
        }
        if (unclippedAttr) {
          if (this.isCliping) {
            this.selectedElement.unclippedAttr.y = Math.max(Math.min(Math.floor((originUnclippedY + diffY) * 100) / 100, elementOriginY), elementOriginY + elementOriginH - originUnclippedHeight)
          } else {
            this.selectedElement.unclippedAttr.y = Math.floor((originUnclippedY + diffY) * 100) / 100
          }
        }
      }
    } else if (this.clickedPosition === 'left-top') {
      if (drawType === 'circle' || drawType === 'avatar') {
        updateElementMap = {
          radius: Math.max(elementOriginR - diffX, 1),
        }
      } else if (drawType === 'text') {
        updateElementMap = {
          x: Math.min(elementOriginX + diffX, elementOriginX + this.startElement.textContainerWidth - 1),
          textContainerWidth: Math.max(this.startElement.textContainerWidth - diffX, 1),
        }
      } else if (drawType === 'image') {
        if (!this.isCliping) { // 常规模式（非裁剪）
          updateElementMap = {
            x: Math.min(elementOriginX + diffX, elementOriginX + elementOriginW - 1),
            y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
            width: Math.max(elementOriginW - diffX, 1),
            height: Math.max(elementOriginH - diffY, 1),
          }
          if (unclippedAttr) {
            updateElementMap.unclippedAttr = {
              // (x1 - x0) / (x1' - x0') = w / w'
              x: (elementOriginX + diffX) - (elementOriginX - originUnclippedX) / (elementOriginW / (elementOriginW - diffX)),
              y: (elementOriginY + diffY) - (elementOriginY - originUnclippedY) / (elementOriginH / (elementOriginH - diffY)),
              // w1 / w0 = w1' / w0'
              width: (elementOriginW - diffX) * originUnclippedWidth / elementOriginW,
              height: (elementOriginH - diffY) * originUnclippedHeight / elementOriginH,
            }
          }
        } else if (!this.onClipArea || (!unclippedAttr && (diffX > 0 || diffY > 0))) { // 命中原图 || （未裁剪过 && 向里移动）
          updateElementMap.unclippedAttr = {
            x: Math.min(originUnclippedX + diffX, originUnclippedX + originUnclippedWidth - 1),
            y: Math.min(originUnclippedY + diffY, originUnclippedY + originUnclippedHeight - 1),
            width: Math.max(originUnclippedWidth - diffX, 1),
            height: Math.max(originUnclippedHeight - diffY, 1),
          }
        } else {
          if (unclippedAttr && diffX < originUnclippedX - elementOriginX) {
            diffX = originUnclippedX - elementOriginX
          }
          if (unclippedAttr && diffY < originUnclippedY - elementOriginY) {
            diffY = originUnclippedY - elementOriginY
          }
          updateElementMap = {
            x: Math.min(elementOriginX + diffX, elementOriginX + elementOriginW - 1),
            y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
            width: Math.max(elementOriginW - diffX, 1),
            height: Math.max(elementOriginH - diffY, 1),
          }
        }
      } else {
        updateElementMap = {
          x: Math.min(elementOriginX + diffX, elementOriginX + elementOriginW - 1),
          y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
          width: Math.max(elementOriginW - diffX, 1),
          height: Math.max(elementOriginH - diffY, 1),
        }
      }
    } else if (this.clickedPosition === 'left-middle') {
      if (drawType === 'circle' || drawType === 'avatar') {
        updateElementMap = {
          radius: Math.max(elementOriginR - diffX, 1),
        }
      } else if (drawType === 'text') {
        updateElementMap = {
          x: Math.min(elementOriginX + diffX, elementOriginX + this.startElement.textContainerWidth - 1),
          textContainerWidth: Math.max(this.startElement.textContainerWidth - diffX, 1),
        }
      } else if (drawType === 'image') {
        if (!this.isCliping) { // 常规模式（非裁剪）
          updateElementMap = {
            x: Math.min(elementOriginX + diffX, elementOriginX + elementOriginW - 1),
            width: Math.max(elementOriginW - diffX, 1),
          }
          if (unclippedAttr) {
            updateElementMap.unclippedAttr = {
              ...unclippedAttr,
              // (x1 - x0) / (x1' - x0') = w / w'
              x: (elementOriginX + diffX) - (elementOriginX - originUnclippedX) / (elementOriginW / (elementOriginW - diffX)),
              // w1 / w0 = w1' / w0'
              width: (elementOriginW - diffX) * originUnclippedWidth / elementOriginW,
            }
          }
        } else if (!this.onClipArea || (!unclippedAttr && diffX > 0)) { // 未裁剪过的图片
          updateElementMap.unclippedAttr = {
            ...unclippedAttr,
            x: Math.min(originUnclippedX + diffX, originUnclippedX + originUnclippedWidth - 1),
            width: Math.max(originUnclippedWidth - diffX, 1),
          }
        } else {
          if (unclippedAttr && diffX < originUnclippedX - elementOriginX) {
            diffX = originUnclippedX - elementOriginX
          }
          updateElementMap = {
            x: Math.min(elementOriginX + diffX, elementOriginX + elementOriginW - 1),
            width: Math.max(elementOriginW - diffX, 1),
          }
        }
      } else {
        updateElementMap = {
          x: Math.min(offsetX / this.scale * HD_RATIO, elementOriginX + elementOriginW - 1),
          width: Math.max(elementOriginW - diffX, 1),
        }
      }
    } else if (this.clickedPosition === 'left-bottom') {
      if (drawType === 'circle' || drawType === 'avatar') {
        updateElementMap = {
          radius: Math.max(elementOriginR - diffX, 1),
        }
      } else if (drawType === 'text') {
        let textHeight = this.canvasInstance.formatTextEle(this.selectedElement).height
        updateElementMap = {
          x: elementOriginX - originTextContainerWidth / textHeight * diffY,
          fontSize: Math.max((textHeight + diffY) / textHeight * originFontSize, 1),
          lineHeight: Math.max((textHeight + diffY) / textHeight * originLineHeight, 1),
          textContainerWidth: Math.max((textHeight + diffY) / textHeight * originTextContainerWidth, 1),
        }
      } else if (drawType === 'image') {
        if (!this.isCliping) { // 常规模式（非裁剪）
          updateElementMap = {
            x: Math.min(elementOriginX + diffX, elementOriginX + elementOriginW - 1),
            width: Math.max(elementOriginW - diffX, 1),
            height: Math.max(elementOriginH + diffY, 1),
          }
          if (unclippedAttr) {
            updateElementMap.unclippedAttr = {
              ...unclippedAttr,
              // (x1 - x0) / (x1' - x0') = w / w'
              x: (elementOriginX + diffX) - (elementOriginX - originUnclippedX) / (elementOriginW / (elementOriginW - diffX)),
              // w1 / w0 = w1' / w0'
              width: (elementOriginW - diffX) * originUnclippedWidth / elementOriginW,
              height: (elementOriginH + diffY) * originUnclippedHeight / elementOriginH,
            }
          }
        } else if (!this.onClipArea || (!unclippedAttr && (diffX > 0 || diffY < 0))) { // 未裁剪过的图片
          updateElementMap.unclippedAttr = {
            ...unclippedAttr,
            x: Math.min(originUnclippedX + diffX, originUnclippedX + originUnclippedWidth - 1),
            width: Math.max(originUnclippedWidth - diffX, 1),
            height: Math.max(originUnclippedHeight + diffY, 1),
          }
        } else {
          if (unclippedAttr && diffX < originUnclippedX - elementOriginX) {
            diffX = originUnclippedX - elementOriginX
          }
          if (unclippedAttr && diffY > originUnclippedY + originUnclippedHeight - elementOriginY - elementOriginH) {
            diffY = originUnclippedY + originUnclippedHeight - elementOriginY - elementOriginH
          }
          updateElementMap = {
            x: Math.min(elementOriginX + diffX, elementOriginX + elementOriginW - 1),
            width: Math.max(elementOriginW - diffX, 1),
            height: Math.max(elementOriginH + diffY, 1),
          }
        }
      } else {
        updateElementMap = {
          x: Math.min(elementOriginX + diffX, elementOriginX + elementOriginW - 1),
          width: Math.max(elementOriginW - diffX, 1),
          height: Math.max(elementOriginH + diffY, 1),
        }
      }
    } else if (this.clickedPosition === 'right-top') {
      if (drawType === 'circle' || drawType === 'avatar') {
        updateElementMap = {
          radius: Math.max(elementOriginR + diffX, 1),
        }
      } else if (drawType === 'text') {
        updateElementMap = {
          textContainerWidth: Math.max(originTextContainerWidth + diffX, 1),
        }
      } else if (drawType === 'image') {
        if (!this.isCliping) { // 常规模式（非裁剪）
          updateElementMap = {
            y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
            width: Math.max(elementOriginW + diffX, 1),
            height: Math.max(elementOriginH - diffY, 1),
          }
          if (unclippedAttr) {
            updateElementMap.unclippedAttr = {
              x: elementOriginX - (elementOriginX - originUnclippedX) / (elementOriginW / (elementOriginW + diffX)),
              y: (elementOriginY + diffY) - (elementOriginY - originUnclippedY) / (elementOriginH / (elementOriginH - diffY)),
              width: (elementOriginW + diffX) * originUnclippedWidth / elementOriginW,
              height: (elementOriginH - diffY) * originUnclippedHeight / elementOriginH,
            }
          }
        } else if (!this.onClipArea || (!unclippedAttr && (diffX < 0 || diffY > 0))) { // 未裁剪过的图片
          updateElementMap.unclippedAttr = {
            ...unclippedAttr,
            y: Math.min(originUnclippedY + diffY, originUnclippedY + originUnclippedHeight - 1),
            width: Math.max(originUnclippedWidth + diffX, 1),
            height: Math.max(originUnclippedHeight - diffY, 1),
          }
        } else {
          if (unclippedAttr && diffX > originUnclippedX + originUnclippedWidth - elementOriginX - elementOriginW) {
            diffX = originUnclippedX + originUnclippedWidth - elementOriginX - elementOriginW
          }
          if (unclippedAttr && diffY < originUnclippedY - elementOriginY) {
            diffY = originUnclippedY - elementOriginY
          }
          updateElementMap = {
            y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
            width: Math.max(elementOriginW + diffX, 1),
            height: Math.max(elementOriginH - diffY, 1),
          }
        }
      } else {
        updateElementMap = {
          y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
          width: Math.max(elementOriginW + diffX, 1),
          height: Math.max(elementOriginH - diffY, 1),
        }
      }
    } else if (this.clickedPosition === 'right-middle') {
      if (drawType === 'circle' || drawType === 'avatar') {
        updateElementMap = {
          radius: Math.max(elementOriginR + diffX, 1),
        }
      } else if (drawType === 'text') {
        updateElementMap = {
          textContainerWidth: Math.max(originTextContainerWidth + diffX, 1),
        }
      } else if (drawType === 'image') {
        if (!this.isCliping) { // 常规模式（非裁剪）
          updateElementMap = {
            width: Math.max(elementOriginW + diffX, 1),
          }
          if (unclippedAttr) {
            updateElementMap.unclippedAttr = {
              ...unclippedAttr,
              x: elementOriginX - (elementOriginX - originUnclippedX) / (elementOriginW / (elementOriginW + diffX)),
              width: (elementOriginW + diffX) * originUnclippedWidth / elementOriginW,
            }
          }
        } else if (!this.onClipArea || (!unclippedAttr && diffX < 0)) { // 未裁剪过的图片
          updateElementMap.unclippedAttr = {
            ...unclippedAttr,
            width: Math.max(originUnclippedWidth + diffX, 1),
          }
        } else {
          if (unclippedAttr && diffX > originUnclippedX + originUnclippedWidth - elementOriginX - elementOriginW) {
            diffX = originUnclippedX + originUnclippedWidth - elementOriginX - elementOriginW
          }
          updateElementMap = {
            width: Math.max(elementOriginW + diffX, 1),
          }
        }
      } else {
        updateElementMap = {
          width: Math.max(elementOriginW + diffX, 1),
        }
      }
    } else if (this.clickedPosition === 'right-bottom') {
      if (drawType === 'circle' || drawType === 'avatar') {
        updateElementMap = {
          radius: Math.max(elementOriginR + diffX, 1),
        }
      } else if (drawType === 'text') {
        let textHeight = this.canvasInstance.formatTextEle(this.selectedElement).height
        updateElementMap = {
          fontSize: Math.max((textHeight + diffY) / textHeight * originFontSize, 1),
          lineHeight: Math.max((textHeight + diffY) / textHeight * originLineHeight, 1),
          textContainerWidth: Math.max((textHeight + diffY) / textHeight * originTextContainerWidth, 1),
        }
      } else if (drawType === 'image') {
        if (!this.isCliping) { // 常规模式（非裁剪）
          updateElementMap = {
            width: Math.max(elementOriginW + diffX, 1),
            height: Math.max(elementOriginH + diffY, 1),
          }
          if (unclippedAttr) {
            updateElementMap.unclippedAttr = {
              x: elementOriginX - (elementOriginX - originUnclippedX) / (elementOriginW / (elementOriginW + diffX)),
              y: elementOriginY - (elementOriginY - originUnclippedY) / (elementOriginH / (elementOriginH + diffY)),
              width: (elementOriginW + diffX) * originUnclippedWidth / elementOriginW,
              height: (elementOriginH + diffY) * originUnclippedHeight / elementOriginH,
            }
          }
        } else if (!this.onClipArea || (!unclippedAttr && (diffX < 0 || diffY < 0))) { // 未裁剪过的图片
          updateElementMap.unclippedAttr = {
            ...unclippedAttr,
            width: Math.max(originUnclippedWidth + diffX, 1),
            height: Math.max(originUnclippedHeight + diffY, 1),
          }
        } else {
          if (unclippedAttr && diffX > originUnclippedX + originUnclippedWidth - elementOriginX - elementOriginW) {
            diffX = originUnclippedX + originUnclippedWidth - elementOriginX - elementOriginW
          }
          if (unclippedAttr && diffY > originUnclippedY + originUnclippedHeight - elementOriginY - elementOriginH) {
            diffY = originUnclippedY + originUnclippedHeight - elementOriginY - elementOriginH
          }
          updateElementMap = {
            width: Math.max(elementOriginW + diffX, 1),
            height: Math.max(elementOriginH + diffY, 1),
          }
        }
      } else {
        updateElementMap = {
          width: Math.max(elementOriginW + diffX, 1),
          height: Math.max(elementOriginH + diffY, 1),
        }
      }
    } else if (this.clickedPosition === 'top-middle') {
      if (drawType === 'circle' || drawType === 'avatar') {
        updateElementMap = {
          radius: Math.max(elementOriginR - diffY, 1),
        }
      } else if (drawType === 'text') {
        updateElementMap = {
          x: Math.floor((elementOriginX + diffX) * 100) / 100,
          y: Math.floor((elementOriginY + diffY) * 100) / 100,
        }
      } else if (drawType === 'image') {
        if (!this.isCliping) { // 常规模式（非裁剪）
          updateElementMap = {
            y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
            height: Math.max(elementOriginH - diffY, 1),
          }
          if (unclippedAttr) {
            updateElementMap.unclippedAttr = {
              ...unclippedAttr,
              y: (elementOriginY + diffY) - (elementOriginY - originUnclippedY) / (elementOriginH / (elementOriginH - diffY)),
              height: (elementOriginH - diffY) * originUnclippedHeight / elementOriginH,
            }
          }
        } else if (!this.onClipArea || (!unclippedAttr && diffY > 0)) { // 未裁剪过的图片
          updateElementMap.unclippedAttr = {
            ...unclippedAttr,
            y: Math.min(originUnclippedY + diffY, originUnclippedY + originUnclippedHeight - 1),
            height: Math.max(originUnclippedHeight - diffY, 1),
          }
        } else {
          if (unclippedAttr && diffY < originUnclippedY - elementOriginY) {
            diffY = originUnclippedY - elementOriginY
          }
          updateElementMap = {
            y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
            height: Math.max(elementOriginH - diffY, 1),
          }
        }
      } else {
        updateElementMap = {
          y: Math.min(elementOriginY + diffY, elementOriginY + elementOriginH - 1),
          height: Math.max(elementOriginH - diffY, 1),
        }
      }
    } else if (this.clickedPosition === 'bottom-middle') {
      if (drawType === 'circle' || drawType === 'avatar') {
        updateElementMap = {
          radius: Math.max(elementOriginR + diffY, 1),
        }
      } else if (drawType === 'text') {
        updateElementMap = {
          x: Math.floor((elementOriginX + diffX) * 100) / 100,
          y: Math.floor((elementOriginY + diffY) * 100) / 100,
        }
      } else if (drawType === 'image') {
        if (!this.isCliping) { // 常规模式（非裁剪）
          updateElementMap = {
            height: Math.max(elementOriginH + diffY, 1),
          }
          if (unclippedAttr) {
            updateElementMap.unclippedAttr = {
              ...unclippedAttr,
              y: elementOriginY - (elementOriginY - originUnclippedY) / (elementOriginH / (elementOriginH + diffY)),
              height: (elementOriginH + diffY) * originUnclippedHeight / elementOriginH,
            }
          }
        } else if (!this.onClipArea || (!unclippedAttr && diffY < 0)) { // 未裁剪过的图片
          updateElementMap.unclippedAttr = {
            ...unclippedAttr,
            height: Math.max(originUnclippedHeight + diffY, 1),
          }
        } else {
          if (unclippedAttr && diffY > originUnclippedY + originUnclippedHeight - elementOriginY - elementOriginH) {
            diffY = originUnclippedY + originUnclippedHeight - elementOriginY - elementOriginH
          }
          updateElementMap = {
            height: Math.max(elementOriginH + diffY, 1),
          }
        }
      } else {
        updateElementMap = {
          height: Math.max(elementOriginH + diffY, 1),
        }
      }
    }

    this.selectedElement = { ...this.selectedElement, ...updateElementMap }
    this.canvasInstance.reDraw(this.selectedElement)
    this.canvasInstance.drawReferenceLine(this.selectedElement.id, { type: REFERENCE_LINE_TYPE.DRAG })
    if (this.isCliping) {
      this.canvasInstance.drawClipMask(this.selectedElement.id)
    }
  }

  // 拖动结束
  onTouchEnd = () => {
    if (!this.selectedElement) return
    this.simulatorContainer.current.removeEventListener('mousemove', this.onTouchMove)
    if (this.selectedElementMove) {
      this.updateDrawDataWithElement(this.selectedElement)
      this.selectedElementMove = false
    }
    this.canvasInstance.drawReferenceLine(this.selectedElement.id)
  }

  /**
   * 控制右键点击显示的菜单
   * @param {Event} e 点击事件
   */
  handleContextMenu = (e: { preventDefault?: any; target?: any; offsetX?: any; offsetY?: any }) => {
    e.preventDefault()
    const { target, offsetX, offsetY } = e
    const { offsetTop, offsetLeft } = target
    let { elementId } = this.canvasInstance.getTouchInElement(offsetX / this.scale * HD_RATIO, offsetY / this.scale * HD_RATIO) // 从canvasCore里获取的element信息
    this.selectedElement = this.getElementById(elementId)
    let disLeft = offsetX + offsetLeft
    let disTop = offsetY + offsetTop
    if (target.className === 'canvas-container') {
      disLeft = offsetX
      disTop = offsetY
    }
    this.referenceCanvas.current.removeEventListener('mousemove', this.onTouchMove)
    this.contextMenuClickEvent = e
    this.setState({
      contextMenuVisible: true,
      showEditMenu: false,
      showDbClickTextEditDom:false,
    }, () => {
      this.contextMenuRef.current.style.left = `${disLeft}px`;
      this.contextMenuRef.current.style.top = `${disTop}px`;
    })
  }

  onKeyDown = (e: { preventDefault?: any; keyCode?: any }) => {
    if (!this.selectedElement || this.selectedElement.blocked) {
      return
    }
    let { keyCode } = e
    let { x, y } = this.selectedElement
    switch (keyCode) {
      // ←键
      case 37:
        e.preventDefault()
        this.selectedElementMove = true
        this.selectedElement.x = x - 5
        this.canvasInstance.reDraw(this.selectedElement)
        this.canvasInstance.drawReferenceLine(this.selectedElement.id, { type: REFERENCE_LINE_TYPE.DRAG })
        break;
      // →键
      case 39:
        e.preventDefault()
        this.selectedElementMove = true
        this.selectedElement.x = x + 5
        this.canvasInstance.reDraw(this.selectedElement)
        this.canvasInstance.drawReferenceLine(this.selectedElement.id, { type: REFERENCE_LINE_TYPE.DRAG })
        break;
      // ↑键
      case 38:
        e.preventDefault()
        this.selectedElementMove = true
        this.selectedElement.y = y - 5
        this.canvasInstance.reDraw(this.selectedElement)
        this.canvasInstance.drawReferenceLine(this.selectedElement.id, { type: REFERENCE_LINE_TYPE.DRAG })
        break;
      // ↓键
      case 40:
        e.preventDefault()
        this.selectedElementMove = true
        this.selectedElement.y = y + 5
        this.canvasInstance.reDraw(this.selectedElement)
        this.canvasInstance.drawReferenceLine(this.selectedElement.id, { type: REFERENCE_LINE_TYPE.DRAG })
        break;
      // delete键
      case 8:
        e.preventDefault()
        this.deleteElement()
        break;
      default:
        break;
    }
  }

  onKeyUp = () => {
    if (!this.selectedElement) return
    if (this.selectedElementMove) {
      this.updateDrawDataWithElement(this.selectedElement)
      this.selectedElementMove = false
    }
    this.canvasInstance.drawReferenceLine(this.selectedElement.id)
  }

  // 更新drawData
  updateDrawDataWithElement = (element: { drawType: any; id: any }, ignore = false) => {
    let drawData = cloneDeep(this.state.drawData)
    const elementArr = drawData[`${element.drawType}Arr`]
    if (elementArr && elementArr.length) {
      const newElementArr = elementArr.filter((item: { id: any }) => item.id !== element.id)
      newElementArr.push(element)
      drawData[`${element.drawType}Arr`] = newElementArr
      this.props.setDrawData({ ...drawData, ignore })
    }
  }

  // 点击模拟器区域时
  
  onClickSimulator = (e:any) => {
    // e.stopPropagation()
    if (typeof this.props.onClickCanvas === 'function') {
      if (e.target.className === 'canvas-container') {
        this.props.onClickCanvas(false)
        this.canvasInstance.clearReferenceLine()
        this.selectedElement = null
        this.setState({ showElementEditMenu: false })
      } else {
        this.props.onClickCanvas(true)
      }
    }
  }

  // 删除选中元素
  deleteElement = () => {
    const drawData = cloneDeep(this.props.drawData);
    if (!this.selectedElement || isEmpty(this.selectedElement)) {
      return message.warning('未选中元素')
    }
    const elementArr = drawData[`${this.selectedElement.drawType}Arr`]
    if (elementArr && elementArr.length) {
      const newElementArr = elementArr.filter((item: { id: any }) => item.id !== this.selectedElement.id)
      drawData[`${this.selectedElement.drawType}Arr`] = newElementArr
    }
    this.selectedElement = null
    this.props.setSelectedElementId(-1)
    this.props.setDrawData(drawData)
    return true
  }

  // 缩放控制器滑动
  onControllChange = (v: number) => {
    this.setState(({ defaultCanvasWidth, defaultCanvasHeight, canvasImage }:any) => {
      if (!canvasImage) {
        canvasImage = this.contentCanvas.current.toDataURL()
      }
      return {
        canvasImage,
        canvasWidth: (INITIAL_CANVAS_WIDTH  * v) / 100 ,
        canvasHeight: (INITIAL_CANVAS_WIDTH / defaultCanvasWidth * defaultCanvasHeight * v) / 100 ,
      }
    })
  }

  onAfterChange = () => {
    // this.props.onChangeTempInfo('zoomNum', this.scale)
    this.initCanvas()
    setTimeout(() => {
      this.setState({ canvasImage: null })
    }, 250)
  }

  changeSelectedElementContent = (e: { target: { value: any } }) => {
    const value = e.target ? e.target.value : e
    this.tempSelectedElement = cloneDeep(this.selectedElement)
    const { drawType } = this.tempSelectedElement
    switch (drawType) {
      case 'rect':
        this.tempSelectedElement.height = value;
        break;
      case 'image':
        this.tempSelectedElement.url = value;
        break;
      case 'qrcode':
        this.tempSelectedElement.url = value;
        break;
      case 'wxacode':
        this.tempSelectedElement.path = value;
        break;
      default:
        break;
    }
  }

  onEditorSaveButtonClick = () => {
    const selectedElement = cloneDeep(this.tempSelectedElement)
    this.updateDrawDataWithElement(selectedElement)
    this.tempSelectedElement = null
    this.setState({ showEditMenu: false })
  }

  onEditorCancelButtonClick = () => {
    this.setState({
      showEditMenu: false,
    })
  }

  getUploadProps = () => ({
    name: 'file',
    action: '/proxy/alita/api/inside//upload?type=image',
    onChange: (info: { file: { status: string; response: { data: { url: any } } } }) => {
      if (info.file.status === 'done') {
        const selectedElement = cloneDeep(this.selectedElement)
        selectedElement.url = info.file.response.data.url
        this.tempSelectedElement = selectedElement
      }
    },
  })

  changeElementBlockStatus = () => {
    const { selectedElement } = this
    selectedElement.blocked = !selectedElement.blocked
    this.updateDrawDataWithElement(selectedElement)
  }

  editSelectedElement = () => {
    const { selectedElement, contextMenuClickEvent } = this
    const { blocked } = selectedElement
    if (!blocked) {
      this.dbClickHandler(contextMenuClickEvent)
    }
  }

  getNewElementId = () => {
    const { drawData } = this.props
    let elementsArr: List<any> | null | undefined = []
    Object.keys(drawData).forEach(key => {
      if (key.includes('Arr') && drawData[key] instanceof Array) {
        elementsArr = [].concat.apply(elementsArr, drawData[key])
      }
    })
    let sortedArr = sortBy(elementsArr, (e:any) => e.id)
    let element:any = sortedArr.pop()
    return element ? element.id + 1 : 0
  }

  addElement = (element: { id?: any; zIndex?: any; drawType?: any }) => {
    const { drawData } = this.props
    const { drawType } = element
    const id = this.getNewElementId()
    element.id = id
    element.zIndex = id
    drawData[`${drawType}Arr`] = drawData[`${drawType}Arr`] || []
    drawData[`${drawType}Arr`].push(element)
    this.props.setSelectedElementId(id)
    this.props.setDrawData(drawData)
  }

  // 复制选中元素
  copyElement = () => {
    const { selectedElement } = this
    const drawData = cloneDeep(this.props.drawData)
    if (!selectedElement || isEmpty(selectedElement)) {
      message.warning('未选中元素')
    }
    const { drawType } = selectedElement
    const newElement = cloneDeep(selectedElement)
    const id = this.getNewElementId()
    newElement.id = id
    newElement.zIndex = id
    newElement.x += 20
    newElement.y += 20
    newElement.blocked = false
    drawData[`${drawType}Arr`].push(newElement)
    this.props.setSelectedElementId(id)
    this.props.setDrawData(drawData)
  }

  // 通过拖拽添加元素
  onSelectedDrop = (event: { preventDefault: () => void; dataTransfer: { getData: (arg0: string) => string } }) => {
    event.preventDefault()
    const selectedElement = JSON.parse(event.dataTransfer.getData('text/plain'));
    // todo 添加到拖动位置
    this.addElement(selectedElement)
  }

  // 通过拖拽添加元素
  onSelectedDragOver = (event: { preventDefault: () => void; dataTransfer: { dropEffect: string } }) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move';
  }

  exportPoster = () => {
    const { width, height } = this.props.drawData;
    const { exportSizeScale } = this.state;
    const exportWidth = width * exportSizeScale;
    const exportHeight = height * exportSizeScale
    const poster = this.contentCanvas.current.toDataURL();
    const img = new Image();
    img.src = poster;
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = exportWidth;
      tempCanvas.height = exportHeight;
      const ctx  = tempCanvas.getContext('2d');
      (ctx as CanvasRenderingContext2D).drawImage(img, 0, 0, exportWidth, exportHeight);
      const exportPoster = tempCanvas.toDataURL();
      downloadFile(`${Date.now()}.png`, exportPoster);
      this.closeExportModal();
    }
  }

  showExportModal = () => {
    this.setState({
      exportModalVisible:true,
    })
  }

  closeExportModal = () => {
    this.setState({
      exportModalVisible:false,
    })
  }

  // 右键菜单render
  renderContextMenu = () => {
    const { blocked, drawType } = this.selectedElement || {}
    const doNothing = () => null
    return (
      <div ref={this.contextMenuRef} className="contextMenu">
        { drawType && (
          <div className={classnames('contextMenu-container', { disbaled: blocked })} onClick={!blocked ? this.editSelectedElement : doNothing}>
            <EditOutlined className="icon" />
            <div className={classnames('contextMenu-option', { disbaled: blocked })}>编辑元素</div>
          </div>
        )}
        { drawType && (
          <div className={classnames('contextMenu-container', { disbaled: blocked })} onClick={!blocked ? this.deleteElement : doNothing}>
            <DeleteOutlined className="icon" />
            <div className={classnames('contextMenu-option', { disbaled: blocked })}>删除元素</div>
          </div>
        )}
        { drawType && (
          <div className={classnames('contextMenu-container', { disbaled: blocked })} onClick={this.copyElement}>
            <CopyOutlined className="icon" />
            <div className={classnames('contextMenu-option')}>复制元素</div>
          </div>
        )}
        { drawType && (
          <div className={classnames('contextMenu-container')} onClick={this.changeElementBlockStatus}>
            {blocked ? <LockOutlined className="icon" /> : <UnlockOutlined className="icon" />}
            <div className={classnames('contextMenu-option')}>{blocked ? '解锁图层' : '锁定图层'}</div>
          </div>
        )}
        <div className={classnames('contextMenu-container')} onClick={this.showExportModal}>
          <ExportOutlined className="icon" />
          <div className={classnames('contextMenu-option')}>导出海报</div>
        </div>
      </div>
    )
  }

  // 双击编辑框render
  renderEditorContainer = () => {
    const { drawType, text, url, width, height, path } = this.selectedElement || {}
    const uploadProps = this.getUploadProps()
    return (
      <div ref={this.elementEditMenuContainer} className="element-edit-menu">
        { (drawType === 'image' || drawType === 'avatar')
          && (
            <Item label="图片链接">
              <Input name="url" placeholder="请输入图片链接" defaultValue={url} className="editor-input" onChange={this.changeSelectedElementContent} />
            </Item>
          )}
        { (drawType === 'qrcode')
          && (
            <Item label="二维码内容" >
              <Input name="url" placeholder="二维码内容" defaultValue={url} className="editor-input" onChange={this.changeSelectedElementContent} />
            </Item>
          )}
        { (drawType === 'wxacode')
          && (
            <Item label="小程序Path" >
              <Input name="path" placeholder="小程序Path" defaultValue={path} className="editor-input" onChange={this.changeSelectedElementContent} />
            </Item>
          )}
        { (drawType === 'image' || drawType === 'avatar')
          && (
            <Item label="上传图片">
              <ImgCrop rotate grid>
                <Upload listType="picture-card" {...uploadProps}>
                  <PlusOutlined />
                </Upload>
              </ImgCrop>
            </Item>
          )}
        { drawType === 'rect' && (
          <div className="item-container">
            <Item label="宽">
              <InputNumber step={1} onChange={e => this.changeSelectedElementContent(e)} defaultValue={width} className="number-editor" />
            </Item>
            <Item label="高">
              <InputNumber step={1} onChange={e => this.changeSelectedElementContent(e)} defaultValue={height} className="number-editor" />
            </Item>
          </div>
        )}
        <div className="button-container">
          <Button size="small" className="element-editor-button" onClick={this.onEditorCancelButtonClick}>取消</Button>
          <Button size="small" className="element-editor-button" onClick={this.onEditorSaveButtonClick} type="primary">确定</Button>
        </div>
      </div>
    )
  }

  // 双击文字
  renderTextDbClickEditor = () => {
    const selectedElement = getSelectedElementById(this.props.selectedElementId,this.state.drawData);
    
    const { text,lineHeight,fontSize,fontStyle,fontWeight,fontFamily = 'Microsoft Yahei',fontVariant,textAlign,textContainerWidth = 300, color } = selectedElement || {};
    const scaleFontSize = fontSize * this.scale / HD_RATIO; // 缩放后的字体大小
    let scale = 1 ;
    let width = textContainerWidth * this.scale / HD_RATIO;;
    // 多行文本高度处理
    const {textArr} = this.canvasInstance.formatTextEle({...selectedElement});
    const rlineHeight = (fontSize > lineHeight ? fontSize : lineHeight) * this.scale
    let height = rlineHeight * (textArr.length || 1) / HD_RATIO;
    let relativeLineHeight = rlineHeight / HD_RATIO;
    // 字体小于12px使用transform 处理
    if(scaleFontSize <= 12){
      scale = scaleFontSize / 12;
      width = width / scale;
      height = height / scale;
      relativeLineHeight = relativeLineHeight / scale;
    }
    return (
      <textarea 
        ref={this.textDbClickEditContainer}
        placeholder={text}
        className="text-dbClickEdit-container"
        style={{
          width:`${width}px`,
          height:`${height}px`,
          lineHeight:`${relativeLineHeight}px`,
          fontStyle,
          fontWeight,
          fontVariant,
          fontFamily,
          textAlign,
          fontSize:`${scaleFontSize <= 12 ? 12 : scaleFontSize}px`,
          color:'transparent',
          caretColor:'rgba(0,0,0,0.5)',
          transform:`scale(${scale})`,
          transformOrigin:'top left'
        }}
        onInput={this.onInput}
        onCompositionStart={this.onCompositionStart}
        onCompositionEnd={this.onCompositionEnd}
        >
          {text}
      </textarea>
    )
  }
  onCompositionStart = (e: any) => {
    this.setState({
      cpLock:true,
    })
  }
  onCompositionEnd = (e: any) => {
    this.setState({
      cpLock:false,
    });
    const selectedElement = getSelectedElementById(this.props.selectedElementId,this.state.drawData);
    this.onChangeText(e.target.value,{...selectedElement});
  }
  onInput= (e: any) => {
    const {cpLock} = this.state;
    const selectedElement = getSelectedElementById(this.props.selectedElementId,this.state.drawData);
    if(!cpLock){
      this.onChangeText(e.target.value,{...selectedElement});
    }
  }
  onChangeText = (val: any,target: any) => {
    target.text = val;
    this.updateDrawDataWithElement(target);
  }

  onExportSizeChange = (e:any) => {
    this.setState({
      exportSizeScale: e.target.value,
    })
  }

  onToggleEleList = () => {
    this.setState({
      showEleList:!this.state.showEleList,
    })
  }

  // 导出海报弹框render
  renderExportModal = () => {
    const { exportModalVisible,exportSizeScale } = this.state;
    const { width, height } = this.props.drawData;
    return (
      <Modal
        title="导出海报"
        visible={exportModalVisible}
        onOk={this.exportPoster}
        onCancel={this.closeExportModal}
      >
        <div className="exportModal-content">
          海报尺寸:
          <span className="exportModal-content-text">
            {Math.floor(width * exportSizeScale)}
            px
          </span>
          <CloseOutlined />
          <span className="exportModal-content-text">
            {Math.floor(height * exportSizeScale)}
            px
          </span>
        </div>
        <div className="exportModal-content">
          缩放比例：
          <Radio.Group onChange={this.onExportSizeChange} value={exportSizeScale}>
            <Radio value={0.5}>0.5倍</Radio>
            <Radio value={0.75}>0.75倍</Radio>
            <Radio value={1}>1倍</Radio>
            <Radio value={2}>2倍</Radio>
            <Radio value={3}>3倍</Radio>
          </Radio.Group>
        </div>
      </Modal>
    )
  }

  render() {
    const { canvasHeight, showEditMenu,showDbClickTextEditDom, canvasWidth, contextMenuVisible, canvasImage,showEleList,hoverElementId } = this.state
    const { selectedElementId } = this.props
    const elementArr = this.getElementList()
    return (
      <div ref={this.simulatorContainer} className="simulator-container" onClick={this.onClickSimulator}>
        <div className="canvas-container" onDrop={this.onSelectedDrop} onDragOver={this.onSelectedDragOver} ref={this.canvasContainer}>
          <canvas width={canvasWidth} height={canvasHeight} ref={this.contentCanvas} className="canvas" style={{ height: canvasHeight / 2, width: canvasWidth / 2 }} />
          <canvas width={canvasWidth} height={canvasHeight} ref={this.maskCanvas} className="canvas stand" style={{ height: canvasHeight / 2, width: canvasWidth / 2 }} />
          <canvas width={canvasWidth} height={canvasHeight} ref={this.referenceCanvas} className="canvas stand" style={{ height: canvasHeight / 2, width: canvasWidth / 2 }} />
          {canvasImage ? <img className="canvas-image" style={{ width: canvasWidth / 2, height: canvasHeight / 2 }} src={canvasImage} alt="" /> : null}
          {showEditMenu ? this.renderEditorContainer() : null}
          {showDbClickTextEditDom ? this.renderTextDbClickEditor(): null}
          {contextMenuVisible && this.renderContextMenu()}
        </div>
        <div className="controller-container">
          <Slider
            vertical
            min={50}
            max={300}
            defaultValue={100}
            tooltipPlacement="left"
            className="controller-slider"
            tipFormatter={v => `缩放${v}%`}
            onAfterChange={this.onAfterChange}
            onChange={this.onControllChange}
          />
        </div>
        <UndoRedo />
        <Draggable
          defaultPosition={{x: 24, y: 24}}
        >
          <div className={classnames("element-container",{"close":!showEleList})}>
            <div className="element-container-header">
              <div>元素列表</div>
              <CloseOutlined className="element-container-header-close" onClick={this.onToggleEleList}/>
            </div>
            <ElementList
              elementArr={elementArr} 
              onSelectElement={this.onSelectElement} 
              onHoverElement={this.onHoverElement}
              hoverElementId={hoverElementId}
              selectedElementId={selectedElementId}
            />
          </div>
        </Draggable>
        {this.renderExportModal()}
      </div>
    )
  }
}
export default connect(bindState, bindActions(), null, { forwardRef: true })(Simulator)
