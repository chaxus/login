// @ts-nocheck
import { message } from 'antd';
import QRCode from 'qrcode';
import axios from 'axios'
import { loadFontFamilys } from './fontLoad'
import { cloneDeep, find } from 'lodash'

const REFERENCE_LINE_TYPE = {
  NOP: 0, // 选中常驻状态
  DRAG: 1, // 拖拽状态
  HOVER: 2, // 鼠标hover状态
}

export default class ImageCreator {
  options: any
  canvas: any
  context: any
  referenceContext: any
  clipContext: any
  scale: any
  pointHandlerSize: any
  drawElementArr: any
  canvasWidth: any
  canvasHeight: any
  drawData: any
  isCliping: boolean | undefined

  constructor(options: any) {
    this.options = options
    this.canvas = this.options.canvas;
    this.context = this.options.canvas.getContext('2d');
    this.referenceContext = this.options.referenceCanvas.getContext('2d')
    this.clipContext = this.options.maskCanvas.getContext('2d')
    this.scale = this.options.scale
    this.pointHandlerSize = 8
    this.drawElementArr = []
  }

  /**
   * 初始化绘制接口
   * @param {Object} drawData
   * 
  */
  async draw(drawData) {
    drawData = cloneDeep(drawData)
    const { width, height } = drawData
    this.canvasWidth = width
    this.canvasHeight = height
    this.drawData = drawData
    return this.packDrawElement(drawData, this.context)
  }

  /**
   * 拖动时重新绘制元素
   * @param {Object} changeElementData
   */
  async reDraw(changeElementData: any) {
    changeElementData = cloneDeep(changeElementData)
    if (this.drawElementArr) {
      const { drawType } = changeElementData
      let preElement = this.drawElementArr.filter((item: { id: any; }) => item.id === changeElementData.id)[0] || {}

      if ((drawType === 'image' || drawType === 'qrcode' || drawType === 'wxacode')) {
        let { url, path, wxappId } = changeElementData
        if (drawType === 'qrcode' && preElement.url !== url) {
          changeElementData = this.handleQRCodeElement(changeElementData)
          changeElementData.imgData = await changeElementData.downloadTask
        } else if (drawType === 'image' && preElement.url !== url) {
          changeElementData = this.handleImageElement(changeElementData)
          changeElementData.imgData = await changeElementData.downloadTask
        } else if (drawType === 'wxacode' && preElement.path !== path || preElement.wxappId !== wxappId) {
          changeElementData = this.handleWxacodeElement(changeElementData)
          changeElementData.imgData = await changeElementData.downloadTask
        } else {
          // changeElementData没有imgData, 需要手动更新
          changeElementData = {
            ...changeElementData,
            imgData: preElement.imgData
          }
        }
      } else if (drawType === 'avatar') {
        let { url } = changeElementData
        if (preElement.url !== url) {
          changeElementData = this.handleImageElement(changeElementData)
          changeElementData.imgData = await changeElementData.downloadTask
        } else {
          changeElementData = {
            ...changeElementData,
            imgData: preElement.imgData
          }
        }
        changeElementData.width = changeElementData.height = changeElementData.radius * 2
      } else if (drawType === 'text') {
        let { fontSize, fontFamily, textContainerWidth, text } = changeElementData
        if (fontSize !== preElement.fontSize || fontFamily !== preElement.fontFamily
          || textContainerWidth !== preElement.textContainerWidth || text !== preElement.text) {
          changeElementData = this.formatTextEle(changeElementData)
        } else {
          // changeElementData没有textArr、 width、height，需要手动更新
          const { textArr, width, height } = preElement
          changeElementData = {
            ...changeElementData,
            textArr: textArr,
            width: width,
            height: height,
          }
        }
      } else if (drawType === 'circle') {
        changeElementData = {
          ...changeElementData,
          width: changeElementData.radius * 2,
          height: changeElementData.radius * 2,
        }
      }
      this.drawElementArr = this.drawElementArr.filter((item: { id: any; }) => item.id !== changeElementData.id)
      this.drawElementArr.push({ ...changeElementData })
      this.drawElementArr = this.indexSort(this.drawElementArr)
      this.drawElementArr = this.formatDrawElements(this.drawElementArr)
      this.context.clearRect(0, 0, this.canvasWidth * this.scale, this.canvasHeight * this.scale)
      this.drawController(this.drawElementArr, this.context)
    }
    return changeElementData
  }

  /**
   * 打包整理绘制元素
   * @param {Object} config
   */
  async packDrawElement(config: { imageArr?: never[] | undefined; textArr?: never[] | undefined; rectArr?: never[] | undefined; circleArr?: never[] | undefined; lineArr?: never[] | undefined; avatarArr?: never[] | undefined; qrcodeArr?: never[] | undefined; wxacodeArr?: never[] | undefined; }, context: any) {
    const { imageArr = [], textArr = [], rectArr = [], circleArr = [], lineArr = [], avatarArr = [], qrcodeArr = [], wxacodeArr = [] } = config
    try {
      // 规范化元素宽高、生成图片数据
      const toDrawImages = await this.formatDrawImageArr(imageArr)
      const toDrawAvatar = await this.formatDrawAvatarArr(avatarArr)
      const toDrawQRCodes = await this.formatDrawQRCodeArr(qrcodeArr)
      const toDrawWxacodes = await this.formatDrawWxacodeArr(wxacodeArr)
      const toDrawCircleArr = this.formatDrawCircleArr(circleArr)
      const toDrawTexts = this.formatTextEleArr(textArr)
      try {
        await loadFontFamilys(textArr.map((item: { fontFamily: any; }) => item.fontFamily))
      } catch (error) {
        console.error('字体加载失败', error)
      }
      this.drawElementArr = this.indexSort([].concat([], toDrawImages, toDrawAvatar, toDrawQRCodes, toDrawWxacodes, toDrawTexts, toDrawCircleArr, rectArr, lineArr))
      this.drawElementArr = this.formatDrawElements(this.drawElementArr)
      await this.drawController(this.drawElementArr, context)
    } catch (e) {
      console.error(e)
      message.warning(`图片加载失败！${e}`)
      throw e
    }
  }

  /**
   * 绘制分类控制器
   * @param {Array} elementArr
   */
  async drawController(elementArr: string | any[], context: any) {
    context.clearRect(0, 0, this.canvasWidth * this.scale, this.canvasHeight * this.scale);
    for (let i = 0; i < elementArr.length; i++) {
      const drawElement = elementArr[i]
      const { drawType } = drawElement
      if (drawType === 'image' || drawType === 'qrcode' || drawType === 'wxacode') {
        await this.drawImage(drawElement, context)
      } else if (drawType === 'text') {
        await this.drawText(drawElement, context)
      } else if (drawType === 'rect') {
        await this.drawRect(drawElement, context)
      } else if (drawType === 'line') {
        await this.drawLine(drawElement, context)
      } else if (drawType === 'circle') {
        await this.drawCircle(drawElement, context)
      } else if (drawType === 'avatar') {
        await this.drawAvatar(drawElement, context)
      } else if (drawType === 'ring') {
        await this.drawRing(drawElement, context)
      } else if (drawType === 'shape') {
        await this.drawShape(drawElement, context)
      }
    }
  }

  /**
   * 
   * @param {*} elementArr 
   */
  formatDrawElements(elementArr: any[]) {
    let addedElements: any[] = []
    for (let i = 0, length = elementArr.length; i < length; i++) {
      let element = elementArr[i]
      if (element.followOptions) {
        const realData = this.calculateRealDataWithFollowOptions(element) || {}
        element.x = realData.x !== undefined ? realData.x : element.x
        element.y = realData.y !== undefined ? realData.y : element.y
        element.width = realData.width !== undefined ? realData.width : element.width
        element.height = realData.height !== undefined ? realData.height : element.height
      }
      if (element.listOptions) {
        addedElements = addedElements.concat(this.handleElementsWithListOptions(element))
        element.listOptions = null
      }
    }
    return elementArr.concat(addedElements)
  }

  handleElementsWithListOptions(element: any) {
    let { column = 1, rowSpacing = 0, columnSpacing = 0, rowDistance = 0, columnDistance = 0, count = 1 } = element.listOptions
    let addedElements: any[] = []

    let preElement = element
    let originX = element.x

    let x = 0, y = 0

    for (let i = 1; i < count; i++) {
      if (i % column === 0) { // 行首元素
        x = originX
        if (rowDistance) {
          y = i === 0 ? preElement.y : preElement.y + rowDistance
        } else {
          y = i === 0 ? preElement.y : preElement.y + preElement.height + rowSpacing
        }
      } else {
        if (columnDistance) {
          x = preElement.x + columnDistance
        } else {
          x = preElement.x + columnSpacing + preElement.width
        }
        y = preElement.y
      }
      let newElement = {
        ...element,
        x,
        y,
        listOptions: null,
      }
      addedElements.push(newElement)
      preElement = newElement

    }
    return addedElements

  }


  /**
   * 生成绘制图片元素元信息
   * @param {Array} imgArr
   */
  async formatDrawImageArr(imgArr: any[]) {
    if (!imgArr.length) return imgArr;
    try {
      const vaildImages = imgArr.map((item: { isQRCode: any; }) => {
        let { isQRCode } = item
        if (isQRCode === 'qrcode') {
          return this.handleQRCodeElement(item)
        }
        return this.handleImageElement(item)
      }).filter((item: { downloadTask: any; }) => item.downloadTask)
      const imageData = await Promise.all(vaildImages.map((item: { downloadTask: any; }) => item.downloadTask))
      return vaildImages.map((item: { imgData: unknown; }, index: string | number) => {
        item.imgData = imageData[index]
        return item
      })
    } catch (e) {
      throw e
    }
  }

  /**
   * 生成绘制头像元素
   * @param {Array} avatarArr
   */
  async formatDrawAvatarArr(avatarArr: any[]) {
    if (!avatarArr.length) return avatarArr;
    try {
      const vaildImages = avatarArr.map((item: any) => this.handleImageElement(item)).filter((item: { downloadTask: any; }) => item.downloadTask)
      const imageData = await Promise.all(vaildImages.map((item: { downloadTask: any; }) => item.downloadTask))
      return vaildImages.map((item: { imgData: unknown; width: number; radius: number; height: number; }, index: string | number) => {
        item.imgData = imageData[index]
        item.width = item.radius * 2
        item.height = item.radius * 2
        return item
      })
    } catch (e) {
      throw e
    }
  }

  /**
  * 生成绘制二维码
  * @param {Array} imgArr
  */
  async formatDrawQRCodeArr(imgArr: any[]) {
    if (!imgArr.length) return imgArr;
    try {
      const vaildImages = imgArr.map((item: any) => this.handleQRCodeElement(item)).filter((item: { downloadTask: any; }) => item.downloadTask)
      const imageData = await Promise.all(vaildImages.map((item: { downloadTask: any; }) => item.downloadTask))
      return vaildImages.map((item: { imgData: unknown; }, index: string | number) => {
        item.imgData = imageData[index]
        return item
      })
    } catch (e) {
      throw e
    }
  }

  /**
  * 生成绘制小程序
  * @param {Array} imgArr
  */
  async formatDrawWxacodeArr(imgArr: any[]) {
    if (!imgArr.length) return imgArr;
    try {
      const vaildImages = imgArr.map((item: any) => this.handleWxacodeElement(item)).filter((item: { downloadTask: any; }) => item.downloadTask)
      const imageData = await Promise.all(vaildImages.map((item: { downloadTask: any; }) => item.downloadTask))
      return vaildImages.map((item: { imgData: unknown; }, index: string | number) => {
        item.imgData = imageData[index]
        return item
      })
    } catch (e) {
      throw e
    }
  }

  formatDrawCircleArr(circleArr: any[]) {
    if (!circleArr.length) return circleArr;
    return circleArr.map((item: { height: number; radius: number; width: number; }) => {
      item.height = item.radius * 2
      item.width = item.radius * 2
      return item
    })
  }

  /**
   * 生成图片数据Task
   * @param {Object} item
   */
  handleImageElement(item: any) {
    item.url = item.url.trim()
    const urlReg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
    const itemIsVaild = urlReg.test(item.url)
    if (itemIsVaild) {
      item.downloadTask = this.loadImg(item.url)
    } else {
      message.warning('参数URL不合法不进行绘制')
    }
    return item
  }

  /**
   * 生成二维码数据Task
   * @param {Object} item
   */
  handleQRCodeElement(item:any) {
    item.url = item.url.replace(/\s/g, '')
    const downloadTask = new Promise(async (resolve, reject) => {
      QRCode.toCanvas(item.url, (err, canvas) => {
        if (err) {
          reject(err)
        }
        resolve(canvas)
      })
    })
    item.downloadTask = downloadTask
    return item
  }

  /**
  * 生成小程序维码数据Task
  * @param {Object} item
  */
  handleWxacodeElement(item = {} as any) {
    const defaultImg = 'https://p3.com/tvun864b1604298509904.png'
    let { wxappId, path } = item
    let downloadTask
    if (wxappId) {
      downloadTask = axios.post(`/proxy/alita/api/inside/createMiniCode`, {
        appId: wxappId, // 小程序appid, 必需
        path, // 小程序路径，必需
        method: 3, // 生成小程序码方式
      }).then(res => {
        let { data } = res
        let { url } = data
        if (!data.success) {
          url = defaultImg
          message.warning(`小程序码生成失败,${data.message}`)
        }
        return this.loadImg(url)
      })
    } else {
      downloadTask = this.loadImg(defaultImg)
    }
    item.downloadTask = downloadTask
    return item
  }

  loadImg(url = '') {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = url
      img.addEventListener('load', () => resolve(img))
      img.addEventListener('error', err => reject(err))
    })
  }

  formatTextEleArr(textEleArr: string | any[]) {
    for (let i = 0; i < textEleArr.length; i++) {
      let textEle = textEleArr[i]
      textEleArr[i] = this.formatTextEle(textEle)
    }
    return textEleArr
  }

  /**
   * 格式化文本元素，添加textArr、width、height
   * @param {文本元素} ele 
   */
  formatTextEle(ele: { textArr?: any; width?: any; height?: any; lineHeight?: any; textContainerWidth?: any; text?: any; fontSize?: any; fontFamily?: any; row?: any; maxRow?: any; }) {
    let { lineHeight, textContainerWidth = 300, text, fontSize, fontFamily, row = 0, maxRow = 0 } = ele
    let textArr = this.sliceText({ textContainerWidth, text, fontSize, fontFamily, row, maxRow })
    ele.textArr = textArr;
    if (textArr.length > 1) {
      ele.width = textContainerWidth
      ele.height = textArr.length * lineHeight
    } else {
      const firstLineText = textArr.length === 1 ? textArr[0] : '';
      this.context.font = `${fontSize}px ${fontFamily}`
      let strWidth = this.context.measureText(firstLineText).width
      ele.width = strWidth
      ele.height = lineHeight
    }
    return ele
  }

  /**
   * 拆分文本, [第一行，第二行...]
   */
  sliceText({ fontSize, fontFamily, text, textContainerWidth, row, maxRow }) {
    let textArr: any[] = []
    this.context.font = `${fontSize}px ${fontFamily}`
    let start = 0
    if (typeof text === 'undefined') {
      return textArr
    } else {
      text = text + ''
    }
    for (let i = 1; i < text.length; i++) {
      let str = text.slice(start, i + 1)
      let strWidth = this.context.measureText(str).width
      if (text[i] === '\n') {
        textArr.push(text.slice(start, i))
        start = i + 1
      } else if (strWidth > textContainerWidth) {
        textArr.push(text.slice(start, i))
        start = i
      }
    }
    textArr.push(text.slice(start))
    //展示行数、最大行数
    const realRow = textArr.length;
    let newTextArr = textArr;
    if (maxRow <= 0 || maxRow >= realRow) {
      if (row > 0 && row < realRow) {
        newTextArr = this.sliceTextArrWithRow(textArr, row, textContainerWidth);
      } else if (row >= realRow) {
        for (let i = realRow; i < (maxRow <= 0 ? row : Math.min(maxRow, row)); i++) {
          newTextArr.push('');
        }
      }
    } else {
      const showRow = (row > 0 && row < maxRow) ? row : maxRow;
      newTextArr = this.sliceTextArrWithRow(textArr, showRow, textContainerWidth)
    }
    return newTextArr;
  }

  /*
   * 根据行数省略超出的文本
  */
  sliceTextArrWithRow(textArr: any[], row: any, textContainerWidth: number) {
    const newTextArr = textArr.slice(0, row);
    const ellipseWidth = this.context.measureText('...').width;
    let lastLineText = newTextArr[newTextArr.length - 1];
    let lastLineWidth = this.context.measureText(lastLineText).width;
    const restText = textArr.slice(row).join('');
    // 超出行数的文本不是空字符串，则需要加省略号
    if (restText !== '') {
      //省略号需替换文本中的末尾字符
      if (lastLineWidth + ellipseWidth > textContainerWidth) {
        // 最后一个字符不够省略号的长度，需要再往前一个字符，直到被替换的字符长度大于省略号长度
        for (let i = 1; i <= lastLineText.length; i++) {
          let str = lastLineText.slice(-i);
          let strWidth = this.context.measureText(str).width;
          if (strWidth >= ellipseWidth) {
            lastLineText = lastLineText.slice(0, -i) + '...';
            break;
          }
        }
      } else {//省略号直接放在文本末尾
        lastLineText = lastLineText + '...';
      }
    }
    // 超出行数的文本无内容，则保留原切割的文本即可，不需要加省略号
    newTextArr[newTextArr.length - 1] = lastLineText;
    return newTextArr;
  }

  /**
   * 获取当前点击区域的元素信息
   * @param {Number} offstX
   * @param {Number} offsetY
   */
  getTouchInElement(offstX: any, offsetY: any) {
    const noneItem = { elementId: -1 }
    if (this.drawElementArr) {
      const touchIn = this.drawElementArr.map((item: { id?: any; x?: any; y?: any; width?: any; height?: any; drawType?: any; lineHeight?: any; radius?: any; points?: any; textArr?: any; unclippedAttr?: any; textContainerWidth?: any; textBaseline?: any; }) => {
        const { x, y, width, height, drawType, lineHeight, radius, points, textArr, unclippedAttr = {} } = item
        let coordinateX = x
        let coordinateY = y
        let coordinateWidth = width
        let coordinateHeight = height
        if (drawType === 'line') {
          const isIn = this.isPointOnSegment({ x: offstX, y: offsetY }, points[0], points[1], this.pointHandlerSize)
          if (isIn) {
            let position
            let dist0 = this.getDistOfPoints({ x: points[0].x, y: points[0].y }, { x: offstX, y: offsetY })
            let dist1 = this.getDistOfPoints({ x: points[1].x, y: points[1].y }, { x: offstX, y: offsetY })
            if (dist0 < this.pointHandlerSize) {
              position = 0
            } else if (dist1 < this.pointHandlerSize) {
              position = 1
            }
            return { elementId: item.id, position };
          }
        } else if (drawType === 'image') {
          const coordinate = this.getCoordinate(coordinateX, coordinateY, coordinateWidth, coordinateHeight)
          const isIn = this.calculatePositionIsInController(offstX, offsetY, coordinate)
          if (isIn) {
            let position = this.checkTouchPosition(offstX, offsetY, coordinate)
            return { elementId: item.id, position, onClipArea: 1 };
          }
          if (this.isCliping) { // 裁剪状态下判断是否命中原图
            const { x: unclippedX = x, y: unclippedY = y, width: unclippedWidth = width, height: unclippedHeight = height } = unclippedAttr
            const wholeCoordinate = this.getCoordinate(unclippedX, unclippedY, unclippedWidth, unclippedHeight)
            const isIn = this.calculatePositionIsInController(offstX, offsetY, wholeCoordinate)
            if (isIn) {
              let position = this.checkTouchPosition(offstX, offsetY, wholeCoordinate)
              return { elementId: item.id, position, onClipArea: 0 };
            }
          }
        } else {
          if (drawType === 'text') {
            const { textContainerWidth = 300, textBaseline } = item
            coordinateWidth = textContainerWidth
            coordinateHeight = lineHeight * (textArr.length || 1)
            if (textBaseline === 'middle') {
              coordinateY = y - lineHeight / 2
            }
          } else if (drawType === 'avatar' || drawType === 'circle') {
            coordinateX = x - radius
            coordinateY = y - radius
            coordinateWidth = radius * 2
            coordinateHeight = radius * 2
          }

          if (coordinateWidth !== undefined && coordinateHeight !== undefined) {
            const coordinate = this.getCoordinate(coordinateX, coordinateY, coordinateWidth, coordinateHeight)
            const isIn = this.calculatePositionIsInController(offstX, offsetY, coordinate)
            if (isIn) {
              let position = this.checkTouchPosition(offstX, offsetY, coordinate)
              return { elementId: item.id, position };
            }
          }
        }

      }).filter((item: any) => !!item)
      let touchElement = touchIn[touchIn.length - 1] || noneItem
      return touchElement
    }
    return noneItem
  }

  getCoordinate(x: any, y: any, width: any, height: any) {
    const coordinate = [
      [x, y],
      [(x + width), y],
      [x, (y + height)],
      [(x + width), (y + height)],
    ]
    return coordinate
  }

  /**
   * 判断点是否在线段上
   * @param {*} p 点p
   * @param {*} p1 线段上点p1
   * @param {*} p2 线段上点p2
   * @param {*} offset 偏移范围
   */
  isPointOnSegment(p: { x: any; y: any; }, p1: { x: number; y: number; }, p2: { x: number; y: number; }, offset = 5) {
    if (p1.x > p2.x) {
      let temp = p1
      p1 = p2
      p2 = temp
    }
    let dis = 0
    if (p1.y === p2.y && (p.x < p1.x - offset || p.x > p2.x + offset)) { // 与x轴平行
      return false
    } else if (p1.x === p2.x) { // 与y轴平行
      if (p.y < p1.y - offset || p.y > p2.y + offset) {
        return false
      }
      dis = Math.abs(p.x - p1.x)
    } else {
      if ((p.x < p1.x - offset && p.y < p1.y - offset) || (p.x > p2.x + offset && p.y > p2.y + offset)) {
        return false
      }
      let lineK = (p2.y - p1.y) / (p2.x - p1.x)
      let lineC = (p2.x * p1.y - p1.x * p2.y) / (p2.x - p1.x)
      dis = Math.abs(lineK * p.x - p.y + lineC) / (Math.sqrt(lineK * lineK + 1))
    }
    return dis - offset <= 0
  }

  /**
   * 判断元素是否在当前点击的区域内
   * @param {Number} offstX
   * @param {Number} offsetY
   * @param {Number} coordinate
   */
  calculatePositionIsInController(offstX: number, offsetY: number, coordinate: any[][]) {
    const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = coordinate;
    // this.pointHandlerSize 误差范围为参考点的边长
    const v1 = [x1 - this.pointHandlerSize - offstX, y1 - this.pointHandlerSize - offsetY];
    const v2 = [x2 + this.pointHandlerSize - offstX, y2 - this.pointHandlerSize - offsetY];
    const v3 = [x3 - this.pointHandlerSize - offstX, y3 + this.pointHandlerSize - offsetY];
    const v4 = [x4 + this.pointHandlerSize - offstX, y4 + this.pointHandlerSize - offsetY];
    return (v1[0] * v2[1] - v2[0] * v1[1]) > 0
      && (v2[0] * v4[1] - v4[0] * v2[1]) > 0
      && (v4[0] * v3[1] - v3[0] * v4[1]) > 0
      && (v3[0] * v1[1] - v1[0] * v3[1]) > 0
  }

  checkTouchPosition(offstX: any, offsetY: any, coordinate: any[][]) {
    // 分别对应左上、右上、左下、右下坐标
    const [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] = coordinate
    let distLT = this.getDistOfPoints({ x: x1, y: y1 }, { x: offstX, y: offsetY })
    let distRT = this.getDistOfPoints({ x: x2, y: y2 }, { x: offstX, y: offsetY })
    let distLB = this.getDistOfPoints({ x: x3, y: y3 }, { x: offstX, y: offsetY })
    let distRB = this.getDistOfPoints({ x: x4, y: y4 }, { x: offstX, y: offsetY })
    let distLM = this.getDistOfPoints({ x: x1, y: (y3 + y1) / 2 }, { x: offstX, y: offsetY })
    let distTM = this.getDistOfPoints({ x: (x2 + x1) / 2, y: y1 }, { x: offstX, y: offsetY })
    let distRM = this.getDistOfPoints({ x: x2, y: (y4 + y2) / 2 }, { x: offstX, y: offsetY })
    let distBM = this.getDistOfPoints({ x: (x4 + x3) / 2, y: y3 }, { x: offstX, y: offsetY })
    if (distLT < this.pointHandlerSize) {
      return 'left-top'
    } else if (distRT < this.pointHandlerSize) {
      return 'right-top'
    } else if (distLB < this.pointHandlerSize) {
      return 'left-bottom'
    } else if (distRB < this.pointHandlerSize) {
      return 'right-bottom'
    } else if (distLM < this.pointHandlerSize) {
      return 'left-middle'
    } else if (distTM < this.pointHandlerSize) {
      return 'top-middle'
    } else if (distRM < this.pointHandlerSize) {
      return 'right-middle'
    } else if (distBM < this.pointHandlerSize) {
      return 'bottom-middle'
    }
  }

  getDistOfPoints(p1: { x: any; y: any; }, p2: { x: any; y: any; }) {
    var a = p2.x - p1.x
    var b = p2.y - p1.y
    return Math.sqrt(a * a + b * b)
  }

  /**
   * 检测当前点击区域的位置
   * @param {Object} p
   * @param {Array} poly
   */
  checkPointInPolyline(p: { x: any; y: any; }, poly: string | any[]) {
    const px = p.x
    const py = p.y
    let flag = false
    for (let i = 0, l = poly.length, j = l - 1; i < l; j = i, i++) {
      const sx = poly[i].x * this.scale
      const sy = poly[i].y * this.scale
      const tx = poly[j].x * this.scale
      const ty = poly[j].y * this.scale
      if ((sx === px && sy === py) || (tx === px && ty === py)) {
        flag = true
      }
      if ((sy < py && ty >= py) || (sy >= py && ty < py)) {
        const x = sx + (py - sy) * (tx - sx) / (ty - sy)
        if (x === px) {
          flag = true
        }
        if (x > px) {
          flag = !flag
        }
      }
    }
    return flag
  }

  /**
   * 选中元素参考线描点
   * @param {*} x 
   * @param {*} y 
   * @param {*} width 
   * @param {*} height 
   */
  drawReferenceLinePoints(x = 0, y = 0) {
    this.referenceContext.lineWidth = 0.5
    this.referenceContext.strokeStyle = '#000'
    this.referenceContext.fillRect(x, y, this.pointHandlerSize, this.pointHandlerSize)
    this.referenceContext.strokeRect(x, y, this.pointHandlerSize, this.pointHandlerSize)
  }

  drawReferenceLineOutLine(x = 0, y = 0, width = 0, height = 0, lineType: number) {
    const { pointHandlerSize } = this
    const showVerticalMiddlePoints = (height - pointHandlerSize * 4) > 0
    const showHorizontalMiddlePoints = (width - pointHandlerSize * 4) > 0
    this.referenceContext.setLineDash([0, 0])
    this.referenceContext.beginPath()
    this.referenceContext.lineWidth = 1
    this.referenceContext.strokeStyle = lineType !== REFERENCE_LINE_TYPE.DRAG ? '#006eff' : 'rgb(219,199,83)';
    this.referenceContext.fillStyle = '#fff'
    this.referenceContext.moveTo(x, y)

    this.referenceContext.lineTo(x + width, y)
    this.referenceContext.lineTo(x + width, y + height)
    this.referenceContext.lineTo(x, y + height)
    this.referenceContext.lineTo(x, y)
    this.referenceContext.stroke()
    this.referenceContext.closePath()
    if (lineType === REFERENCE_LINE_TYPE.NOP) {
      // 左上角
      this.drawReferenceLinePoints(x - pointHandlerSize / 2, y - pointHandlerSize / 2)
      // 中间上
      showHorizontalMiddlePoints && this.drawReferenceLinePoints(x + width / 2 - pointHandlerSize / 2, y - pointHandlerSize / 2)
      // 右上角
      this.drawReferenceLinePoints(x + width - pointHandlerSize / 2, y - pointHandlerSize / 2)
      // 左中
      showVerticalMiddlePoints && this.drawReferenceLinePoints(x - pointHandlerSize / 2, y + height / 2 - pointHandlerSize / 2)
      // 左下角
      this.drawReferenceLinePoints(x - pointHandlerSize / 2, y + height - pointHandlerSize / 2)
      // 中间下
      showHorizontalMiddlePoints && this.drawReferenceLinePoints(x + width / 2 - pointHandlerSize / 2, y + height - pointHandlerSize / 2)
      // 右下角
      this.drawReferenceLinePoints(x + width - pointHandlerSize / 2, y + height - pointHandlerSize / 2)
      // 中间右
      showVerticalMiddlePoints && this.drawReferenceLinePoints(x + width - pointHandlerSize / 2, y + height / 2 - pointHandlerSize / 2)
    }
    this.referenceContext.save()
  }

  drawLineReferenceLineOutLine(points: any[], lineType: number) {
    this.referenceContext.setLineDash([0, 0])
    this.referenceContext.beginPath()
    this.referenceContext.lineWidth = 1
    this.referenceContext.strokeStyle = lineType !== REFERENCE_LINE_TYPE.DRAG ? '#006eff' : 'rgb(219,199,83)';
    this.referenceContext.fillStyle = '#fff'
    this.referenceContext.moveTo(points[0].x, points[0].y)
    points.forEach((item: { x: any; y: any; }) => {
      this.referenceContext.lineTo(item.x, item.y)
    })

    this.referenceContext.stroke()
    this.referenceContext.closePath()
    if (lineType === REFERENCE_LINE_TYPE.NOP) {
      points.forEach((item: { x: number; y: number; }) => {
        this.drawReferenceLinePoints(item.x - this.pointHandlerSize / 2, item.y - this.pointHandlerSize / 2)
      })
    }
    this.referenceContext.save()
  }

  /**
   * 拖动时交叉参考线
   * @param {*} x 
   * @param {*} y 
   */
  drawRuleLine(x: any, y: any, width: any, height: any) {
    this.referenceContext.restore()
    this.referenceContext.beginPath()
    this.referenceContext.setLineDash([5, 2])
    this.referenceContext.lineWidth = 1
    this.referenceContext.strokeStyle = 'rgb(219,199,83)'
    this.referenceContext.moveTo(x, 0)
    this.referenceContext.lineTo(x, this.canvasHeight * this.scale)
    this.referenceContext.moveTo(0, y)
    this.referenceContext.lineTo(this.canvasWidth * this.scale, y)
    this.referenceContext.stroke()
    this.referenceContext.closePath()
  }

  /**
   * 获取元素参考线位置信息
   * @param {*} element 
   */
  getReferenceLineInfo(element: { drawType?: any; points?: any; x?: any; y?: any; width?: any; height?: any; radius?: any; lineHeight?: any; textBaseline?: any; textAlign?: any; fontSize?: any; textContainerWidth?: any; textArr?: any; }) {
    if (!element) return {}
    let { drawType, points, x, y, width, height, radius } = element
    x *= this.scale
    y *= this.scale
    width *= this.scale
    height *= this.scale
    if (drawType === 'avatar' || drawType === 'circle') {
      radius *= this.scale
      x = x - radius
      y = y - radius
      height = radius * 2
      width = radius * 2
    } else if (drawType === 'text') {
      let { lineHeight, textBaseline, textAlign, fontSize, textContainerWidth = 300, textArr = [] } = element
      lineHeight = (fontSize > lineHeight ? fontSize : lineHeight) * this.scale
      width = textContainerWidth * this.scale
      this.context.textAlign = textAlign
      this.context.textBaseline = textBaseline
      height = lineHeight * (textArr.length || 1)
      y = y - lineHeight / 2
    } else if (drawType === 'line') {
      points = points.map((item: { x: number; y: number; }) => ({
        x: item.x * this.scale,
        y: item.y * this.scale,
      }))
      x = points[0].x
      y = points[0].y
    }
    return { x, y, width, height, points }
  }

  /**
   * 绘制参考线
   * @param {Object} selectedElementId
   */
  drawReferenceLine(selectedElementId = -1, optiopns = {} as any) {
    let { type: lineType = REFERENCE_LINE_TYPE.NOP, hoverElementId } = optiopns
    let selectedElement = this.getElementById(selectedElementId)
    let { x, y, width, height, points } = this.getReferenceLineInfo(selectedElement)
    let drawType = selectedElement && selectedElement.drawType
    this.referenceContext.clearRect(0, 0, this.canvasWidth * this.scale, this.canvasHeight * this.scale)

    if (lineType === REFERENCE_LINE_TYPE.HOVER) {
      let hoverElement = this.getElementById(hoverElementId)
      // 绘制hover元素参考线
      if (hoverElement) {
        let { x: xHover, y: yHover, width: widthHover, height: heightHover, points: poiontsHover } = this.getReferenceLineInfo(hoverElement)
        let { drawType: hoverDrawType } = hoverElement
        hoverDrawType === 'line' ? this.drawLineReferenceLineOutLine(poiontsHover, REFERENCE_LINE_TYPE.HOVER)
          : this.drawReferenceLineOutLine(xHover, yHover, widthHover, heightHover, REFERENCE_LINE_TYPE.HOVER)
      }
      // 绘制选中元素参考线
      drawType === 'line' ? this.drawLineReferenceLineOutLine(points, REFERENCE_LINE_TYPE.NOP)
        : this.drawReferenceLineOutLine(x, y, width, height, REFERENCE_LINE_TYPE.NOP)
    } else {
      if (drawType === 'line') {
        this.drawLineReferenceLineOutLine(points, lineType)
      } else if (drawType === 'image' && this.isCliping) {
        let { x: unclippedX, y: unclippedY, width: unclippedWidth, height: unclippedHeight } = selectedElement.unclippedAttr || {}
        this.drawReferenceLineOutLine(x, y, width, height, lineType)
        this.drawReferenceLineOutLine(unclippedX * this.scale, unclippedY * this.scale, unclippedWidth * this.scale, unclippedHeight * this.scale, lineType)
      } else {
        this.drawReferenceLineOutLine(x, y, width, height, lineType)
      }
    }
    if (lineType === REFERENCE_LINE_TYPE.DRAG) {
      this.drawParamsContainer(x, y, height)
      this.drawRuleLine(x, y, width, height)
    }
  }

  /**
   * 拖动时元素位置标签
   * @param {*} x 
   * @param {*} y 
   * @param {*} height 
   */
  drawParamsContainer(x: number, y: number, height: number) {
    this.referenceContext.font = `24px FZXH1JW `
    let containerX = (x < 0 ? 0 : x) + 10
    let containerY = y
    const disToElement = 20
    const padding = 20
    const containerHeight = 16 + 10 + padding * 2
    const point = `x: ${Math.floor(x / this.scale)}点   y: ${Math.floor(y / this.scale)}点`
    const pointWidth = this.referenceContext.measureText(point).width
    // const sizeWidth = this.referenceContext.measureText(size).width
    const rectWidth = pointWidth + padding * 2

    if (containerY - (containerHeight + disToElement) < 0) {
      containerY = containerY + height + containerHeight + disToElement * 2
    }

    if (this.canvasHeight * this.scale - height < containerHeight + disToElement * 2) {
      containerY = (this.canvasHeight * this.scale / 2 - containerHeight)
    }

    if (containerX + rectWidth > this.canvasWidth * this.scale) {
      containerX = this.canvasWidth * this.scale - rectWidth
    }
    const rectY = containerY - (disToElement + containerHeight)
    const rectRadius = 4
    this.referenceContext.beginPath()
    this.referenceContext.moveTo(containerX + rectRadius, rectY)
    this.referenceContext.arcTo(containerX + rectWidth, rectY, containerX + rectWidth, rectY + containerHeight, rectRadius)
    this.referenceContext.arcTo(containerX + rectWidth, rectY + containerHeight, containerX, rectY + containerHeight, rectRadius)
    this.referenceContext.arcTo(containerX, rectY + containerHeight, containerX, rectY, rectRadius)
    this.referenceContext.arcTo(containerX, rectY, containerX + rectRadius, rectY, rectRadius)

    this.referenceContext.strokeStyle = 'transparent';
    this.referenceContext.stroke()
    this.referenceContext.fillStyle = 'rgba(0,0,0,0.9)'
    this.referenceContext.fill()

    this.referenceContext.fillStyle = '#fff'
    this.referenceContext.shadowBlur = 0
    this.referenceContext.shadowColor = 'transparent'
    this.referenceContext.fillText(point, containerX + padding, containerY - containerHeight + padding)
    // this.referenceContext.fillText(size, containerX + padding, containerY - disToElement - padding)
    this.referenceContext.stroke()

  }

  /**
   * 清除参考线
   */
  clearReferenceLine() {
    this.referenceContext.clearRect(0, 0, this.canvasWidth * this.scale + 10, this.canvasHeight * this.scale)
  }

  /**
   * 计算随动元素的实际坐标信息及实际尺寸
   * @param {Object} element
   */
  calculateRealDataWithFollowOptions(element: { x: any; y: any; width: any; height: any; followOptions?: {} | undefined; }) {
    let { x, y, width, height, followOptions = {} } = element
    let { positonOption, sizeOption } = followOptions
    if (positonOption && positonOption.target !== undefined) {
      ({ x, y } = this.calculateRealDataOfWithPosition(element, positonOption))
    }
    if (sizeOption && sizeOption.target !== undefined) {
      ({ height, width } = this.calculateRealDataOfWithSize(element, sizeOption))
    }

    // 兼容单配置写法
    if (!positonOption && !sizeOption && followOptions.target !== undefined) {
      const { type } = followOptions
      if (type === 'size') {
        ({ height, width } = this.calculateRealDataOfWithSize(element, followOptions))
      } else {
        ({ x, y } = this.calculateRealDataOfWithPosition(element, followOptions))
      }
    }

    return {
      x, y, width, height
    }
  }

  calculateRealDataOfWithPosition(element: { x: any; y: any; }, followOptions: { target?: number | undefined; axis?: string | undefined; marginTop?: number | undefined; marginLeft?: number | undefined; justify: any; }) {
    let { x, y } = element
    let { target = -1, axis = 'y', marginTop = 0, marginLeft = 0, justify } = followOptions
    const followTarget = this.getElementById(target)
    if (!followTarget) {
      return { x, y }
    }
    if (axis === 'x') {
      x = (marginLeft + followTarget.x + followTarget.width)
      y = y
    } else { // y轴方向随动
      let justifyStart = justify === 'start'
      if (justifyStart) {
        y = marginTop + followTarget.y
      } else {
        y = marginTop + followTarget.y + followTarget.height
      }
      x = x
    }
    return { x, y }
  }

  calculateRealDataOfWithSize(element: { width: any; height: any; }, followOptions: { target?: number | undefined; paddingTop?: number | undefined; paddingBottom?: number | undefined; paddingLeft?: number | undefined; paddingRight?: number | undefined; sizeType: any; }) {
    let { width, height } = element
    let { target = -1, paddingTop = 0, paddingBottom = 0, paddingLeft = 0, paddingRight = 0, sizeType } = followOptions
    const followTarget = this.getElementById(target)
    if (!followTarget) {
      return { width, height }
    }
    if (sizeType === 'width') {
      width = followTarget.width + paddingLeft + paddingRight
    } else if (sizeType === 'height') {
      height = followTarget.height + paddingTop + paddingBottom
    } else {
      width = followTarget.width + paddingLeft + paddingRight
      height = followTarget.height + paddingTop + paddingBottom
    }
    return { width, height }
  }

  /**
   * 文本渲染
   * @param {Object} content
   */
  drawText(content: { x: any; y: any; color: any; text: any; fontSize?: number | undefined; fontStyle?: string | undefined; fontWeight?: string | undefined; fontVariant?: string | undefined; fontFamily?: string | undefined; textAlign?: string | undefined; textBaseline?: string | undefined; lineHeight?: any; textContainerWidth?: number | undefined; textArr?: never[] | undefined; }, context: { textAlign: any; fillStyle: any; textBaseline: any; font: string; fillText: (arg0: any, arg1: any, arg2: any) => void; }) {
    let {
      x,
      y,
      color,
      text,
      fontSize = 12,
      fontStyle = 'normal',
      fontWeight = 'normal',
      fontVariant = 'normal',
      fontFamily = 'Microsoft YaHei',
      textAlign = 'left',
      textBaseline = 'top',
      lineHeight = fontSize,
      textContainerWidth = 300,
      textArr = [],
    } = content
    x *= this.scale;
    y *= this.scale;
    fontSize *= this.scale;
    lineHeight *= this.scale;
    textContainerWidth *= this.scale;
    return new Promise(async (resolve) => {
      context.textAlign = textAlign
      context.fillStyle = color
      context.textBaseline = textBaseline
      context.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${fontFamily}`
      if (textAlign === 'center') {
        x = x + textContainerWidth / 2
      } else if (textAlign === 'right') {
        x = x + textContainerWidth
      }
      for (let i = 0; i < textArr.length; i++) {
        context.fillText(textArr[i], x, y)
        y = y + lineHeight
      }
      resolve(1)
    })
  }

  /**
   * 线段渲染
   * @param {Object} content
   */
  drawLine(content: { borderColor?: string | undefined; backgroundColor?: string | undefined; lineStyle?: string | undefined; dashedWidth?: number | undefined; dashedOffset?: number | undefined; borderWidth?: number | undefined; points?: never[] | undefined; }, context: { beginPath: () => void; save: () => void; strokeStyle: any; fillStyle: any; lineWidth: any; setLineDash: (arg0: any[]) => any; moveTo: (arg0: number, arg1: number) => void; lineTo: (arg0: number, arg1: number) => void; stroke: () => void; closePath: () => void; restore: () => void; }) {
    let {
      borderColor = '#000',
      backgroundColor = 'transparent',
      lineStyle = 'solid',
      dashedWidth = 1,
      dashedOffset = 1,
      borderWidth = 0,
      points = [],
    } = content
    dashedWidth *= dashedWidth * this.scale;
    borderWidth *= borderWidth * this.scale;
    dashedOffset *= dashedOffset * this.scale;
    return new Promise((resolve, reject) => {
      if (points.length) {
        context.beginPath()
        context.save()
        context.strokeStyle = borderColor
        context.fillStyle = backgroundColor
        context.lineWidth = borderWidth || 0
        lineStyle === 'dashed' && context.setLineDash([dashedWidth, dashedOffset]);
        const [startX, startY] = points
        context.moveTo(startX * this.scale, startY * this.scale)
        points.forEach((item: { x: number; y: number; }) => {
          context.lineTo(item.x * this.scale, item.y * this.scale)
        })
        context.stroke()
        context.closePath()
        context.restore()
      }
      resolve(1)
    })
  }

  /**
   * 多边形渲染
   * @param {Object} content
   */
  drawShape(content: { borderColor?: "#000" | undefined; backgroundColor?: "transparent" | undefined; lineStyle?: "solid" | undefined; dashedWidth?: 0 | undefined; borderWidth?: 0 | undefined; dashedOffset?: 0 | undefined; points?: never[] | undefined; gradient?: null | undefined; closePath?: true | undefined; }, context: { beginPath: () => void; strokeStyle: string; fillStyle: any; lineWidth: number; setLineDash: (arg0: any[]) => any; moveTo: (arg0: number, arg1: number) => void; lineTo: (arg0: number, arg1: number) => void; createLinearGradient: (arg0: any, arg1: any, arg2: any, arg3: any) => any; createRadialGradient: (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any, arg5: any) => any; closePath: () => any; fill: () => any; stroke: () => void; }) {
    const {
      borderColor = '#000',
      backgroundColor = 'transparent',
      lineStyle = 'solid',
      dashedWidth = 0,
      borderWidth = 0,
      dashedOffset = 0,
      points = [],
      gradient = null,
      closePath = true,
    } = content
    return new Promise((resolve, reject) => {
      if (points.length) {
        context.beginPath()
        context.strokeStyle = borderColor
        context.fillStyle = backgroundColor
        context.lineWidth = borderWidth
        lineStyle == 'dashed' && context.setLineDash([dashedWidth, dashedOffset]);
        const [startX, startY] = points
        context.moveTo(startX * this.scale, startY * this.scale)
        points.forEach((item: { x: number; y: number; }) => {
          context.lineTo(item.x * this.scale, item.y * this.scale)
        })
        if (gradient) {
          const { type, options = {} } = gradient
          const { colorArr } = options
          if (colorArr && colorArr.length > 0) {
            let fillStyle;
            // 线性渐变
            if (type === 'linear') {
              const { startX = 0, startY = 0, endX = this.canvasWidth, endY = this.canvasHeight } = options
              fillStyle = context.createLinearGradient(startX + points[0].x * this.scale, startY + points[0].y * this.scale, endX + points[0].x * this.scale, endY + points[0].y * this.scale)
              // 径向渐变
            } else if (type === 'radial') {
              const {
                startX = 0,
                startY = 0,
                startRadius = 0,
                endX = this.canvasWidth,
                endY = this.canvasHeight,
                endRadius = 0,
              } = options
              fillStyle = context.createRadialGradient(startX + points[0].x * this.scale, startY + points[0].y * this.scale, startRadius, endX + points[0].x * this.scale, endY + points[0].y * this.scale, endRadius)
            }
            for (let i = 0, len = colorArr.length; i < len; i++) {
              const { position, color } = colorArr[i];
              fillStyle.addColorStop(position, color);
            }
            context.fillStyle = fillStyle
          }
        }
        if (borderWidth) {
          context.lineWidth = borderWidth
        } else {
          context.lineWidth = 0
        }
        closePath && context.closePath()
        closePath && context.fill()
        context.stroke()
        context.strokeStyle = 'transparent'
        context.lineWidth = 0
      }
      resolve(1)
    })
  }

  /**
   * 矩形渲染
   * @param {Object} content
   */
  drawRect(content: { x?: number | undefined; y?: number | undefined; width?: number | undefined; height?: number | undefined; gradient?: null | undefined; borderWidth?: number | undefined; borderColor?: string | undefined; backgroundColor?: string | undefined; borderRadius?: number | undefined; borderTopLeftRadius?: number | undefined; borderTopRightRadius?: number | undefined; borderBottomLeftRadius?: number | undefined; borderBottomRightRadius?: number | undefined; borderInsideRadius?: number | undefined; borderTopLeftInsideRadius?: number | undefined; borderTopRightInsideRadius?: number | undefined; borderBottomLeftInsideRadius?: number | undefined; borderBottomRightInsideRadius?: number | undefined; shadow?: null | undefined; marginBottom?: number | undefined; isLatest: any; }, context: { setLineDash: (arg0: never[]) => void; lineWidth: any; strokeStyle: string; fillStyle: any; beginPath: () => void; shadowOffsetX: number; shadowOffsetY: number; shadowBlur: number; shadowColor: string; createLinearGradient: (arg0: any, arg1: any, arg2: any, arg3: any) => any; createRadialGradient: (arg0: any, arg1: any, arg2: number, arg3: any, arg4: any, arg5: number) => any; moveTo: (arg0: any, arg1: any) => void; arcTo: (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any) => void; arc: (arg0: any, arg1: any, arg2: any, arg3: number, arg4: number, arg5: boolean) => void; lineTo: (arg0: number, arg1: number) => void; fill: () => void; stroke: () => void; }) {
    let {
      x = 0,
      y = 0,
      width = 0,
      height = 0,
      gradient = null,
      borderWidth = 0,
      borderColor = 'transparent',
      backgroundColor = 'green',
      borderRadius = 0,
      borderTopLeftRadius = 0,
      borderTopRightRadius = 0,
      borderBottomLeftRadius = 0,
      borderBottomRightRadius = 0,
      borderInsideRadius = 0,
      borderTopLeftInsideRadius = 0,
      borderTopRightInsideRadius = 0,
      borderBottomLeftInsideRadius = 0,
      borderBottomRightInsideRadius = 0,
      shadow = null,
      marginBottom = 0,
      isLatest,
    } = content

    x *= this.scale
    y *= this.scale
    width *= this.scale
    height *= this.scale
    borderWidth *= this.scale
    borderRadius *= this.scale
    borderTopLeftRadius *= this.scale
    borderTopRightRadius *= this.scale
    borderBottomLeftRadius *= this.scale
    borderBottomRightRadius *= this.scale
    borderInsideRadius *= this.scale
    borderTopLeftInsideRadius *= this.scale
    borderTopRightInsideRadius *= this.scale
    borderBottomLeftInsideRadius *= this.scale
    borderBottomRightInsideRadius *= this.scale
    return new Promise((resolve) => {
      context.setLineDash([])
      this.context.strokeStyle = 'transparent'
      if (borderWidth) {
        context.lineWidth = borderWidth;
      }
      if (borderColor && borderColor.length) {
        context.strokeStyle = borderColor;
      }
      context.fillStyle = backgroundColor;

      context.beginPath()
      if (shadow) {
        context.shadowOffsetX = shadow.offsetX * this.scale || 0
        context.shadowOffsetY = shadow.offsetY * this.scale || 0;
        context.shadowBlur = shadow.blur * this.scale || 0;
        context.shadowColor = shadow.color || 'transparent';
      }
      if (gradient) {
        const { type = 'linear', options = {} } = gradient
        const { colorArr } = options
        if (colorArr && colorArr.length > 0) {
          let fillStyle;
          // 线性渐变
          if (type === 'linear') {
            const { startX = 0, startY = 0, endX = 0, endY = 0 } = options
            fillStyle = context.createLinearGradient(x + startX * this.scale, y + startY * this.scale, x + endX * this.scale, y + endY * this.scale)
            // 径向渐变
          } else if (type === 'radial') {
            const initialValue = {
              initialStartX: x + width / 2,
              initialStartY: y + height / 2,
              initialStartRadius: 0,
              initialEndX: x + width / 2,
              initialEndY: y + height / 2,
              initialEndRadius: height / 2,
            };
            const {
              startX = 0,
              startY = 0,
              endX = 0,
              endY = 0,
            } = options
            const { initialStartX, initialStartY, initialStartRadius, initialEndX, initialEndY, initialEndRadius } = initialValue;
            fillStyle = context.createRadialGradient(initialStartX + startX * this.scale, initialStartY + startY * this.scale, initialStartRadius, initialEndX + endX * this.scale, initialEndY + endY * this.scale, initialEndRadius)
          }
          for (let i = 0, len = colorArr.length; i < len; i++) {
            const { position, color } = colorArr[i];
            fillStyle.addColorStop(position, color);
          }
          context.fillStyle = fillStyle
        }
      }

      context.moveTo(x + (borderRadius || borderTopLeftRadius || borderInsideRadius || borderTopLeftInsideRadius), y);
      if (borderRadius || borderTopRightRadius) {
        context.arcTo(x + width, y, x + width, y + height, borderRadius || borderTopRightRadius)
      } else if (borderInsideRadius || borderTopRightInsideRadius) {
        const radius = borderInsideRadius || borderTopRightInsideRadius
        context.arc(x + width, y, radius, 1 * Math.PI, 0.5 * Math.PI, true);
        context.lineTo(x + width, y + height - radius)
      } else {
        context.lineTo(x + width, y)
      }


      if (borderRadius || borderBottomRightRadius) {
        context.arcTo(x + width, y + height, x, y + height, borderRadius || borderBottomRightRadius)
      } else if (borderInsideRadius || borderBottomRightInsideRadius) {
        const radius = borderInsideRadius || borderBottomRightInsideRadius
        context.arc(x + width, y + height, radius, 1.5 * Math.PI, 1 * Math.PI, true);
        context.lineTo(x + radius, y + height)
      } else {
        context.lineTo(x + width, y + height)
      }


      if (borderRadius || borderBottomLeftRadius) {
        context.arcTo(x, y + height, x, y, borderRadius || borderBottomLeftRadius)
      } else if (borderInsideRadius || borderBottomLeftInsideRadius) {
        const radius = borderInsideRadius || borderBottomLeftInsideRadius
        context.arc(x, y + height, radius, 0 * Math.PI, 1.5 * Math.PI, true);
        context.lineTo(x, y + radius)
      } else {
        context.lineTo(x, y + height)
      }

      if (borderRadius || borderTopLeftRadius) {
        context.arcTo(x, y, x + (borderRadius || borderTopLeftRadius), y, borderRadius || borderTopLeftRadius)
      } else if (borderInsideRadius || borderTopLeftInsideRadius) {
        const radius = borderInsideRadius || borderTopLeftInsideRadius
        context.arc(x, y, radius, 0.5 * Math.PI, 0 * Math.PI, true);
        context.lineTo(x + width - radius, y)
      } else {
        context.lineTo(x, y - borderWidth / 2)
      }
      context.fill()
      context.stroke()
      context.strokeStyle = 'transparent';
      if (shadow) {
        context.shadowOffsetX = 0
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
        context.shadowColor = 'transparent';
      }
      resolve(1)
    })
  }

  /**
   * 图片渲染
   * @param {Object} content
   */
  drawImage(content: { imgData?: any; x?: any; y?: any; width?: any; height?: any; borderWidth?: any; borderColor?: any; borderRadius?: any; borderTopLeftRadius?: any; borderTopRightRadius?: any; borderBottomLeftRadius?: any; borderBottomRightRadius?: any; borderInsideRadius?: any; borderTopLeftInsideRadius?: any; borderTopRightInsideRadius?: any; borderBottomLeftInsideRadius?: any; borderBottomRightInsideRadius?: any; rotate?: any; shadow?: any; unclippedAttr?: any; }, context: { fillStyle: string; save: () => void; shadowOffsetX: number; shadowOffsetY: number; shadowBlur: number; shadowColor: any; restore: () => void; strokeStyle: any; lineWidth: any; beginPath: () => void; moveTo: (arg0: any, arg1: any) => void; lineTo: (arg0: any, arg1: number) => void; closePath: () => void; fill: () => void; stroke: () => void; drawImage: (arg0: any, arg1: number, arg2: number, arg3: number, arg4: number, arg5: any, arg6: any, arg7: any, arg8: any) => void; }) {
    let {
      x = 0,
      y = 0,
      width,
      height,
      borderWidth = 0,
      borderColor = 'transparent',
      borderRadius = 0,
      borderTopLeftRadius = 0,
      borderTopRightRadius = 0,
      borderBottomLeftRadius = 0,
      borderBottomRightRadius = 0,
      borderInsideRadius = 0,
      borderTopLeftInsideRadius = 0,
      borderTopRightInsideRadius = 0,
      borderBottomLeftInsideRadius = 0,
      borderBottomRightInsideRadius = 0,
      rotate = 0,
      shadow,
      unclippedAttr = {},
    } = content
    x *= this.scale
    y *= this.scale
    width = (width || content.imgData.width) * this.scale
    height = (height || content.imgData.height) * this.scale
    borderWidth *= this.scale;
    return new Promise(async (resolve) => {
      context.fillStyle = 'transparent';
      context.save()
      if (rotate) {
        context.save()
        this.transformImage(content, context)
      }
      if (shadow) {
        context.shadowOffsetX = shadow.offsetX * this.scale || 0
        context.shadowOffsetY = shadow.offsetY * this.scale || 0;
        context.shadowBlur = shadow.blur * this.scale || 0;
        context.shadowColor = shadow.color || 'transparent';
      }
      if (borderRadius || borderTopLeftRadius || borderTopRightRadius || borderBottomLeftRadius || borderBottomRightRadius || borderInsideRadius
        || borderTopLeftInsideRadius || borderTopRightInsideRadius || borderBottomLeftInsideRadius || borderBottomRightInsideRadius) {
        try {
          await this.drawImageWithRadius(content, context)
        } catch (error) {
          console.error(error)
        } finally {
          if (rotate) {
            context.restore()
          }
        }
        context.restore()
        resolve(1)
      } else {
        if (borderColor && borderColor.length && borderColor !== 'transparent') {
          context.strokeStyle = borderColor
        }
        if (borderWidth) {
          context.lineWidth = borderWidth
          context.beginPath()
          context.moveTo(x, y)
          context.lineTo(x + width, y)
          context.lineTo(x + width, y + height)
          context.lineTo(x, y + height)
          context.lineTo(x, y - borderWidth / 2)
          context.closePath()
          context.fill()
          context.stroke()
        }

        const img = content.imgData
        let { x: unclippedX, y: unclippedY, width: unclippedWidth, height: unclippedHeight } = unclippedAttr
        unclippedX = unclippedX === undefined ? x : unclippedX * this.scale
        unclippedY = unclippedY === undefined ? y : unclippedY * this.scale
        unclippedWidth = unclippedWidth === undefined ? width : unclippedWidth * this.scale
        unclippedHeight = unclippedHeight === undefined ? height : unclippedHeight * this.scale
        let { naturalWidth = img.width, naturalHeight = img.height } = img
        let widthScale = naturalWidth / unclippedWidth
        let heightScale = naturalHeight / unclippedHeight
        context.drawImage(img, (x - unclippedX) * widthScale, (y - unclippedY) * heightScale, widthScale * width, heightScale * height, x, y, width, height);
        if (rotate) {
          context.restore()
        }
        context.restore()
        resolve(1)
      }
    })
  }

  /**
   * 圆角图片渲染
   * @param {Object} content
   */
  drawImageWithRadius(content: { imgData?: any; x?: any; y?: any; width?: any; height?: any; autoClip?: any; borderWidth?: any; borderColor?: any; borderRadius?: any; borderTopLeftRadius?: any; borderTopRightRadius?: any; borderBottomLeftRadius?: any; borderBottomRightRadius?: any; borderInsideRadius?: any; borderTopLeftInsideRadius?: any; borderTopRightInsideRadius?: any; borderBottomLeftInsideRadius?: any; borderBottomRightInsideRadius?: any; }, context: { save: () => void; lineWidth: any; strokeStyle: any; beginPath: () => void; moveTo: (arg0: any, arg1: any) => void; arcTo: (arg0: any, arg1: any, arg2: any, arg3: any, arg4: any) => void; arc: (arg0: any, arg1: any, arg2: any, arg3: number, arg4: number, arg5: boolean) => void; lineTo: (arg0: number, arg1: number) => void; closePath: () => void; fill: () => void; stroke: () => void; clip: () => void; drawImage: (arg0: any, arg1: number, arg2: number, arg3: number, arg4: number, arg5: undefined, arg6: undefined, arg7: undefined, arg8: undefined) => void; restore: () => void; }) {
    let {
      x = 0,
      y = 0,
      width,
      height,
      autoClip,
      borderWidth = 0,
      borderColor = 'transparent',
      borderRadius = 0,
      borderTopLeftRadius = 0,
      borderTopRightRadius = 0,
      borderBottomLeftRadius = 0,
      borderBottomRightRadius = 0,
      borderInsideRadius = 0,
      borderTopLeftInsideRadius = 0,
      borderTopRightInsideRadius = 0,
      borderBottomLeftInsideRadius = 0,
      borderBottomRightInsideRadius = 0,
    } = content
    width = !width ? content.imgData.width : width
    height = !height ? content.imgData.height : height
    x *= this.scale;
    y *= this.scale
    width *= this.scale;
    height *= this.scale;
    borderWidth *= this.scale;
    borderRadius *= this.scale;
    borderTopLeftRadius *= this.scale;
    borderTopRightRadius *= this.scale;
    borderBottomLeftRadius *= this.scale;
    borderBottomRightRadius *= this.scale;
    borderInsideRadius *= this.scale
    borderTopLeftInsideRadius *= this.scale
    borderTopRightInsideRadius *= this.scale
    borderBottomLeftInsideRadius *= this.scale
    borderBottomRightInsideRadius *= this.scale
    return new Promise(async (resolve, reject) => {
      const img = content.imgData
      const originWidth = img.width
      const originHeight = img.height
      context.save()
      try {
        context.lineWidth = borderWidth;
        if (borderColor && borderColor.length && borderColor !== 'transparent') {
          context.strokeStyle = borderColor;
        }
        context.beginPath()
        context.moveTo(x + (borderRadius || borderTopLeftRadius || borderInsideRadius || borderTopLeftInsideRadius), y);
        if (borderRadius || borderTopRightRadius) {
          context.arcTo(x + width, y, x + width, y + height, borderRadius || borderTopRightRadius)
        } else if (borderInsideRadius || borderTopRightInsideRadius) {
          const radius = borderInsideRadius || borderTopRightInsideRadius
          context.arc(x + width, y, radius, 1 * Math.PI, 0.5 * Math.PI, true);
          context.lineTo(x + width, y + height - radius)
        } else {
          context.lineTo(x + width, y)
        }

        if (borderRadius || borderBottomRightRadius) {
          context.arcTo(x + width, y + height, x, y + height, borderRadius || borderBottomRightRadius)
        } else if (borderInsideRadius || borderBottomRightInsideRadius) {
          const radius = borderInsideRadius || borderBottomRightInsideRadius
          context.arc(x + width, y + height, radius, 1.5 * Math.PI, 1 * Math.PI, true);
          context.lineTo(x + radius, y + height)
        } else {
          context.lineTo(x + width, y + height)
        }


        if (borderRadius || borderBottomLeftRadius) {
          context.arcTo(x, y + height, x, y, borderRadius || borderBottomLeftRadius)
        } else if (borderInsideRadius || borderBottomLeftInsideRadius) {
          const radius = borderInsideRadius || borderBottomLeftInsideRadius
          context.arc(x, y + height, radius, 0 * Math.PI, 1.5 * Math.PI, true);
          context.lineTo(x, y + radius)
        } else {
          context.lineTo(x, y + height)
        }


        if (borderRadius || borderTopLeftRadius) {
          context.arcTo(x, y, x + (borderRadius || borderTopLeftRadius), y, borderRadius || borderTopLeftRadius)
        } else if (borderInsideRadius || borderTopLeftInsideRadius) {
          const radius = borderInsideRadius || borderTopLeftInsideRadius
          context.arc(x, y, radius, 0.5 * Math.PI, 0 * Math.PI, true);
          context.lineTo(x + width - radius, y)
        } else {
          context.lineTo(x, y - borderWidth / 2)
        }
        context.closePath()
        context.fill()
        if (borderWidth) {
          context.lineWidth = borderWidth
          context.stroke();
        }
        context.clip();
        if (autoClip != undefined) {
          let clipWidth = width / this.scale
          let clipHeight = height / this.scale
          let startX = 0;
          let startY = 0;
          if (autoClip == 0) {
            clipHeight = originHeight
            clipWidth = width / height * originHeight
            startX = (originWidth - clipWidth) / 2
          } else if (autoClip == 1) {
            clipWidth = originWidth
            clipHeight = height / width * originWidth
            startY = (originHeight - clipHeight) / 2
          } else if (autoClip == 2) {
            clipWidth = originWidth
            clipHeight = originHeight
          } else if (autoClip == 4) {
            startX = (originWidth - clipWidth) / 2
            startY = (originHeight - clipHeight) / 2
          }
          context.drawImage(img, startX, startY, clipWidth, clipHeight, x, y, width, height);
        } else {
          context.drawImage(img, x, y, width, height)
        }
        resolve(1)
      } catch (error) {
        reject(error)
      } finally {
        context.restore();
      }

    })
  }

  /**
   * 头像渲染渲染
   * @param {Object} content
   */
  drawAvatar(content: { imgData?: any; x?: any; y?: any; url?: any; radius?: any; borderColor?: any; borderWidth?: any; }, context: { save: () => void; beginPath: () => void; lineWidth: any; arc: (arg0: any, arg1: any, arg2: any, arg3: number, arg4: number) => void; strokeStyle: any; closePath: () => void; stroke: () => void; clip: () => void; drawImage: (arg0: any, arg1: number, arg2: number, arg3: number, arg4: number) => void; restore: () => void; }) {
    let {
      x,
      y,
      url,
      radius,
      borderColor = 'transparent',
      borderWidth = 0,
    } = content
    x *= this.scale;
    y *= this.scale
    radius *= this.scale
    borderWidth *= this.scale
    return new Promise(async (resolve, reject) => {
      const img = content.imgData
      context.save();
      context.beginPath();
      context.lineWidth = borderWidth;
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.strokeStyle = borderColor;
      context.closePath();
      context.stroke();
      context.clip();
      context.drawImage(img, x - radius, y - radius, 2 * radius, 2 * radius);
      context.restore();
      resolve(1)
    })
  }

  /**
   * 圆形渲染
   * @param {Object} content
   */
  drawCircle(content: { x: any; y: any; backgroundColor?: string | undefined; borderStyle: any; borderColor?: any; radius?: number | undefined; borderWidth?: number | undefined; dashedWidth?: number | undefined; dashedOffset?: number | undefined; }, context: { save: () => void; beginPath: () => void; lineWidth: any; setLineDash: (arg0: any[]) => any; arc: (arg0: any, arg1: any, arg2: any, arg3: number, arg4: number) => void; fillStyle: any; fill: () => void; strokeStyle: any; stroke: () => void; restore: () => void; }) {
    let {
      x,
      y,
      backgroundColor = 'red',
      borderStyle,
      borderColor = backgroundColor,
      radius = 0,
      borderWidth = 0,
      dashedWidth = 2,
      dashedOffset = 2,
    } = content

    x *= this.scale;
    y *= this.scale
    radius *= this.scale
    borderWidth *= this.scale
    dashedWidth *= this.scale
    dashedOffset *= this.scale
    return new Promise((resolve) => {
      context.save();
      context.beginPath()
      context.lineWidth = borderWidth
      borderStyle == 'dashed' && context.setLineDash([dashedWidth, dashedOffset]);
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = backgroundColor
      context.fill()
      context.strokeStyle = borderColor
      context.stroke()
      context.restore();
      resolve(1)
    })
  }

  /**
   * 环形渲染
   * @param {Object} content
   */
  drawRing(content: { x: any; y: any; backgroundColor?: string | undefined; borderStyle: any; borderColor?: any; radius: any; borderWidth?: number | undefined; dashedWidth?: number | undefined; dashedOffset?: number | undefined; }, context: { beginPath: () => void; lineWidth: any; setLineDash: (arg0: any[]) => any; arc: (arg0: any, arg1: any, arg2: any, arg3: number, arg4: number) => void; fillStyle: any; fill: () => void; strokeStyle: any; stroke: () => void; }) {
    let {
      x,
      y,
      backgroundColor = 'red',
      borderStyle,
      borderColor = backgroundColor,
      radius,
      borderWidth = 0,
      dashedWidth = 2,
      dashedOffset = 2,
    } = content
    return new Promise((resolve) => {
      context.beginPath()
      context.lineWidth = borderWidth
      borderStyle == 'dashed' && context.setLineDash([dashedWidth, dashedOffset]);
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = backgroundColor
      context.fill()
      context.strokeStyle = borderColor
      context.stroke()
      resolve(1)
    })
  }

  /**
   * 层级排序
   * @param {Array} arr
   */
  indexSort(arr: any):any {
    if (arr.length <= 1) return arr;
    const pivotIndex = Math.floor(arr.length / 2);
    const pivot = arr.splice(pivotIndex, 1)[0];
    const left: any[] = [];
    const right: any[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].zIndex < pivot.zIndex) {
        left.push(arr[i]);
      } else {
        right.push(arr[i]);
      }
    }
    return this.indexSort(left).concat([pivot], this.indexSort(right));
  }

  /**
   * 变换图片
   * @param {Object} content
   */
  transformImage(content: { x?: 0 | undefined; y?: 0 | undefined; width: any; height: any; scaleX?: 1 | undefined; scaleY?: 1 | undefined; mirror?: 0 | undefined; rotate?: 0 | undefined; }, context: { translate: (arg0: number, arg1: number) => void; scale: (arg0: number, arg1: number) => void; rotate: (arg0: number) => void; }) {
    const { x = 0, y = 0, width, height, scaleX = 1, scaleY = 1, mirror = 0, rotate = 0 } = content
    // 矩形中心点
    const rectCenterPoint = { x: (x + width / 2) * this.scale, y: (y + height / 2) * this.scale }
    context.translate(rectCenterPoint.x, rectCenterPoint.y);
    // 缩放
    if (scaleX !== 1 || scaleY !== 1) {
      context.scale(scaleX, scaleY);
    }
    // 旋转
    if (rotate) {
      context.rotate(rotate * Math.PI / 180);
    }
    // 镜像
    if (mirror) {
      context.scale(-1, 1);
    }
    context.translate(-rectCenterPoint.x, -rectCenterPoint.y);
  }

  /**
   * 高斯模糊（性能耗费）
   * @param {Object} content
   */
  // gaussBlur(content, limitArr) {
  //   context.save()
  //   let { height, width, imgData, blur = 10 } = content
  //   height = (height || imgData.height) * this.scale
  //   width = (width || imgData.width) * this.scale
  //   const startX = content.x * this.scale
  //   const startY = content.y * this.scale
  //   context.drawImage(imgData, startX, startY, width, height)
  //   const bulrImgData = context.getImageData(startX, startY, width, height)
  //   const pixes = bulrImgData.data;
  //   const radius = blur
  //   const gaussMatrix = [];
  //   let gaussSum = 0;
  //   let x; let y;
  //   let r; let g; let b; let a;
  //   let i; let j; let k; let len;
  //   const sigma = Math.floor(blur / 2);
  //   a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
  //   b = -1 / (2 * sigma * sigma);
  //   // 生成高斯矩阵
  //   for (i = 0, x = -radius; x <= radius; x++, i++) {
  //     g = a * Math.exp(b * x * x);
  //     gaussMatrix[i] = g;
  //     gaussSum += g;
  //   }
  //   // 归一化, 保证高斯矩阵的值在[0,1]之间
  //   for (i = 0, len = gaussMatrix.length; i < len; i++) {
  //     gaussMatrix[i] /= gaussSum;
  //   }
  //   if (limitArr) {
  //     for (let l = 0; l < limitArr.length; l++) {
  //       const currentGaussObj = limitArr[l];
  //       let { startX = 0, startY = 0 } = currentGaussObj
  //       let gaussHeight = currentGaussObj.height ? currentGaussObj.height : height
  //       let gaussWidth = currentGaussObj.width ? currentGaussObj.width : width
  //       if (startX < 0) {
  //         gaussWidth = Math.min(Math.abs(startX), gaussWidth)
  //         startX += width
  //       } else {
  //         gaussWidth = Math.min(width - startX, gaussWidth)
  //       }
  //       if (startY < 0) {
  //         gaussHeight = Math.min(Math.abs(startY), gaussHeight)
  //         startY += height
  //       } else {
  //         gaussHeight = Math.min(height - startY, gaussHeight)
  //       }
  //       // x 方向一维高斯运算
  //       for (y = startY; y < startY + Math.min(gaussHeight, height); y++) {
  //         for (x = startX; x < startX + Math.min(gaussWidth, width); x++) {
  //           r = g = b = a = 0;
  //           gaussSum = 0;
  //           for (j = -radius; j <= radius; j++) {
  //             k = x + j;
  //             if (k >= 0 && k < width) { // 确保 k 没超出 x 的范围
  //               // r,g,b,a 四个一组
  //               i = (y * width + k) * 4;
  //               r += pixes[i] * gaussMatrix[j + radius];
  //               g += pixes[i + 1] * gaussMatrix[j + radius];
  //               b += pixes[i + 2] * gaussMatrix[j + radius];
  //               // a += pixes[i + 3] * gaussMatrix[j];
  //               gaussSum += gaussMatrix[j + radius];
  //             }
  //           }
  //           i = (y * width + x) * 4;
  //           // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
  //           pixes[i] = r / gaussSum;
  //           pixes[i + 1] = g / gaussSum;
  //           pixes[i + 2] = b / gaussSum;
  //           // pixes[i + 3] = a ;
  //         }
  //       }
  //       // y 方向一维高斯运算
  //       for (x = startX; x < startX + Math.min(gaussWidth, width); x++) {
  //         for (y = startY; y < startY + Math.min(gaussHeight, height); y++) {
  //           r = g = b = a = 0;
  //           gaussSum = 0;
  //           for (j = -radius; j <= radius; j++) {
  //             k = y + j;
  //             if (k >= 0 && k < height) { // 确保 k 没超出 y 的范围
  //               i = (k * width + x) * 4;
  //               r += pixes[i] * gaussMatrix[j + radius];
  //               g += pixes[i + 1] * gaussMatrix[j + radius];
  //               b += pixes[i + 2] * gaussMatrix[j + radius];
  //               // a += pixes[i + 3] * gaussMatrix[j];
  //               gaussSum += gaussMatrix[j + radius];
  //             }
  //           }
  //           i = (y * width + x) * 4;
  //           pixes[i] = r / gaussSum;
  //           pixes[i + 1] = g / gaussSum;
  //           pixes[i + 2] = b / gaussSum;
  //         }
  //       }
  //     }
  //   } else {
  //     // x 方向一维高斯运算
  //     for (y = 0; y < height; y++) {
  //       for (x = 0; x < width; x++) {
  //         r = g = b = a = 0;
  //         gaussSum = 0;
  //         for (j = -radius; j <= radius; j++) {
  //           k = x + j;
  //           if (k >= 0 && k < width) { // 确保 k 没超出 x 的范围
  //             // r,g,b,a 四个一组
  //             i = (y * width + k) * 4;
  //             r += pixes[i] * gaussMatrix[j + radius];
  //             g += pixes[i + 1] * gaussMatrix[j + radius];
  //             b += pixes[i + 2] * gaussMatrix[j + radius];
  //             // a += pixes[i + 3] * gaussMatrix[j];
  //             gaussSum += gaussMatrix[j + radius];
  //           }
  //         }
  //         i = (y * width + x) * 4;
  //         // 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
  //         pixes[i] = r / gaussSum;
  //         pixes[i + 1] = g / gaussSum;
  //         pixes[i + 2] = b / gaussSum;
  //         // pixes[i + 3] = a ;
  //       }
  //     }
  //     // y 方向一维高斯运算
  //     for (x = 0; x < width; x++) {
  //       for (y = 0; y < height; y++) {
  //         r = g = b = a = 0;
  //         gaussSum = 0;
  //         for (j = -radius; j <= radius; j++) {
  //           k = y + j;
  //           if (k >= 0 && k < height) { // 确保 k 没超出 y 的范围
  //             i = (k * width + x) * 4;
  //             r += pixes[i] * gaussMatrix[j + radius];
  //             g += pixes[i + 1] * gaussMatrix[j + radius];
  //             b += pixes[i + 2] * gaussMatrix[j + radius];
  //             // a += pixes[i + 3] * gaussMatrix[j];
  //             gaussSum += gaussMatrix[j + radius];
  //           }
  //         }
  //         i = (y * width + x) * 4;
  //         pixes[i] = r / gaussSum;
  //         pixes[i + 1] = g / gaussSum;
  //         pixes[i + 2] = b / gaussSum;
  //       }
  //     }
  //   }
  //   context.restore();
  //   return bulrImgData
  // }

  getElementById(elementId: number) {
    let element = find(this.drawElementArr, item => item.id === elementId)
    return element
  }

  drawClipMask(elementId: any) {
    let element = this.getElementById(elementId)
    let { x, y, width, height, unclippedAttr = {}, imgData } = element
    let { x: unclippedX = x, y: unclippedY = y, width: unclippedWidth = width, height: unclippedHeight = height } = unclippedAttr
    x *= this.scale
    y *= this.scale
    width *= this.scale
    height *= this.scale
    unclippedX *= this.scale
    unclippedY *= this.scale
    unclippedWidth *= this.scale
    unclippedHeight *= this.scale

    this.isCliping = true
    this.clipContext.clearRect(0, 0, this.canvasWidth * this.scale, this.canvasHeight * this.scale);
    this.clipContext.fillStyle = '#D6D6D6'
    this.clipContext.globalAlpha = 0.5
    this.clipContext.drawImage(imgData, unclippedX, unclippedY, unclippedWidth, unclippedHeight)
    this.clipContext.fillRect(0, 0, this.canvasWidth * this.scale, this.canvasHeight * this.scale)
    this.clipContext.stroke()
    this.clipContext.clearRect(x, y, width, height)
  }

  clearClipMask() {
    this.isCliping = false
    this.clipContext.clearRect(0, 0, this.canvasWidth * this.scale, this.canvasHeight * this.scale)
  }


}
