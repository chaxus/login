// @ts-nocheck
import axios from 'axios'
import SparkMD5 from 'spark-md5'
import fontList from '../../config/font'
import TextMeasurer from './textMeasurer'

function dataURLtoBlob(dataurl) {
  let arr = dataurl.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
const textMeasurer = new TextMeasurer()

export default class PsdParser {
  psdUrl: string;
  imageCache: any;
  psdTree: any;
  subTree: any;
  amount: number;
  drawInfo: any;

  constructor(url) {
    this.psdUrl = url
    this.imageCache = {}
  }

  async initPsd() {
    let psd = await window.psdjs.fromURL(this.psdUrl)
    this.psdTree = psd.tree();
    this.subTree = this.psdTree.subtree();
    this.amount = this.subTree.length
    this.drawInfo = {
      width: this.psdTree.width,
      height: this.psdTree.height,
      textArr: [],
      imageArr: [],
      rectArr: [],
      circleArr: [],
    }
  }

  async parsePsd() {
    await this.initPsd()
    const { subTree, amount, drawInfo } = this
    let imageTasks: any[] = []
    for (let i = 0; i < amount; i++) {
      const temp = subTree[i]
      const typeTool = temp.get('typeTool');
      const vectorMask = temp.get('vectorMask');
      const solidColor = temp.get('solidColor')
      if (temp.type === 'layer' && temp.layer.visible) {
        if (typeTool) {
          const typeToolExport = typeTool.export()
          let fontSize = await this.computeFontSize(temp, typeTool)
          let fontFamily = typeToolExport.font.name // encodeURI(fontFamily): %EF%BB%BF{fontFamily}%00
          let fontObj = fontList.find(font => ~fontFamily.indexOf(font.logogram))
          fontFamily = fontObj ? fontObj.fontFamily : fontFamily
          textMeasurer.context.font = `${fontSize}px ${fontFamily}`
          let textContainerWidth = textMeasurer.context.measureText(typeTool.textValue).width
          const dataInfo = {
            id: Number(i),
            drawType: 'text', // 绘制类型
            text: typeTool.textValue, // 文本
            x: temp.get('left'), // 元素X坐标
            y: temp.get('top') + fontSize / 2, // 元素Y坐标
            zIndex: amount - i, // 绘制层级
            fontSize, // 字符大小
            fontStyle: typeTool.styles().FauxItalic && typeTool.styles().FauxItalic[0] ? 'italic' : 'normal', // 字体样式
            fontFamily,
            fontWeight: typeTool.styles().FauxBold && typeTool.styles().FauxBold[0] ? 'bold' : 'normal', // 字重样式
            fontVariant: 'normal', // 字样式
            // "textAlign" : typeTool.alignment()[0],           // 对齐方式
            textAlign: 'left', // 对齐方式
            padding: 0, // 边距
            paddingLeft: 0, // 左边距 padding存在时 此值无效
            paddingRight: 0, // 右边距 padding存在时 此值无效
            lineHeight: typeTool.styles().Leading ? typeTool.styles().Leading[0] : typeTool.styles().FontSize[0], // 行距
            textBaseline: 'middle', // 文本基线 默认middle
            row: 3, // 加入pdding时生效
            color: `rgba(${typeTool.colors()[0].join(',')})`, // 文本颜色  或 rgba(0,0,0,0)
            textContainerWidth: Math.min(textContainerWidth, this.drawInfo.width)// 文本框宽度
            // "transform": `matrix(1 0 0 1 ${transform.tx} ${transform.ty})`
          }
          drawInfo.textArr.push(dataInfo);
        } else if (vectorMask && solidColor) {
          solidColor.parse()
          const { r, g, b } = solidColor;
          const dataInfo = {
            id: Number(i),
            drawType: 'rect',
            x: temp.get('left'),
            y: temp.get('top'),
            width: temp.get('width'),
            height: temp.get('height'),
            zIndex: amount - i,
            backgroundColor: `rgba(${r},${g},${b},${temp.get('opacity')})`,
            borderWidth: 0,
            borderColor: '',
            borderRadius: 0,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderInsideRadius: 0,
            borderTopLeftInsideRadius: 0,
            borderTopRightInsideRadius: 0,
            borderBottomLeftInsideRadius: 0,
            borderBottomRightInsideRadius: 0,
          }
          drawInfo.rectArr.push(dataInfo);
        } else {
          let imageTask = this.getImage(i, temp)
          imageTasks.push(imageTask)
        }
      }
    }
    let imageArr = await Promise.all(imageTasks)
    drawInfo.imageArr = imageArr.filter(i => i)
    return drawInfo
  }

  getImageUrl = async img => {
    let hexHash = SparkMD5.hash(img);
    if (this.imageCache[hexHash]) {
      return this.imageCache[hexHash]
    }
    let blob = dataURLtoBlob(img)
    const formData = new FormData();
    formData.append('file', blob, `img${hexHash}`)
    let uploadPromise = axios.post('/proxy/alita/api/inside/upload', formData).then(res => {
      let { data: { success, data } } = res
      if (success) {
        return data.url
      }
      return ''
    })
    this.imageCache[hexHash] = uploadPromise
    return uploadPromise
  }

  getImage = async (id, temp) => {
    let img = temp.layer.image.toPng()
    let url = await this.getImageUrl(img.src)
    if (url) {
      let imageInfo = {
        drawType: 'image',
        x: temp.get('left'),
        y: temp.get('top'),
        url,
        width: temp.get('width'),
        height: temp.get('height'),
        zIndex: this.amount - id,
        id,
        rotate: 0,
        borderWidth: 0,
        borderColor: 'transparent',
        borderRadius: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        backgroundColor: 'transparent',
      }
      return imageInfo
    }
    return null
  }

  computeFontSize = async function (node, typeTool, defValue = 24) {
    const { text } = node.export();
    typeTool.parse();
    const sizes = typeTool.sizes();
    let size;

    if (sizes && sizes[0]) {
      if (text.transform.yy !== 1) {
        size = Math.round((sizes[0] * text.transform.yy) * 100) * 0.01;
      } else {
        [size] = sizes;
      }
    } else {
      size = defValue; // 默认
    }
    return size
  }
}
