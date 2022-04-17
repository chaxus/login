/*
 * @Author: ran
 * @Date: 2021-07-13 19:23:10
 * @LastEditTime: 2022-02-20 15:39:08
 * @LastEditors: 
 */

const canvas = document.createElement('canvas')

export default class TextMeasurer {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D

  constructor() {
    this.canvas = canvas
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
  }

  measureText(textEle:any) {
    let { lineHeight, fontSize, fontFamily, text, textContainerWidth = 300 } = textEle
    let textArr = this.sliceText({ fontSize, fontFamily, text, textContainerWidth })
    let height, width
    if (textArr.length > 1) {
      height = textArr.length * lineHeight
      width = textContainerWidth
    } else {
      this.context.font = `${fontSize}px ${fontFamily}`
      width = this.context.measureText(text).width
      height = lineHeight
    }
    return {
      height,
      width,
    }
  }

  sliceText({ fontSize, fontFamily, text, textContainerWidth }:any) {
    let textArr: string[] = []
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
    return textArr
  }
}
