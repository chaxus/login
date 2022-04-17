/*
 * @Author: ran
 * @Date: 2021-07-13 19:23:10
 * @LastEditTime: 2022-02-20 15:26:01
 * @LastEditors: Please set LastEditors
 */
import fontList from '../../config/font'

// 采用cb，而非Promise的形式，可以避免海更换已加载字体造成闪屏
export const loadFontFamily = (fontFamily: string, cb: () => void) => {
  if (!fontFamily) return
  let hasFont = document.fonts.check(`12px ${fontFamily}`)
  if (hasFont) {
    if (typeof cb === 'function') {
      cb()
    }
  } else {
    const font = fontList.find(item => item.fontFamily === fontFamily)
    if (!font) {
      return console.log(`暂不支持字体:${fontFamily}`)
    }
    let { url } = font
    const fontface = new FontFace(fontFamily, `url(${url})`)
    document.fonts.add(fontface);
    document.fonts.load(`12px ${fontFamily}`).then(() => {
      if (typeof cb === 'function') {
        cb()
      }
    }).catch((err: any) => {
      console.error('字体加载失败', err)
    })
  }
}

export const loadFontFamilys = (fontFamilys: any[]) => {
  let loadFontArr: any[] = []
  fontFamilys = fontFamilys.filter((i: any) => i)
  for (let i = 0, len = fontFamilys.length; i < len; i++) {
    let fontFamily = fontFamilys[i]
    let hasFont = document.fonts.check(`12px ${fontFamily}`)
    if (!hasFont) {
      const font = fontList.find(item => item.fontFamily === fontFamily)
      if (!font) {
        loadFontArr.push(Promise.reject(new Error(`暂不支持字体:${fontFamily}`)))
      } else {
        let { url } = font
        const fontface = new FontFace(fontFamily, `url(${url})`)
        document.fonts.add(fontface);
        let loadPromise = document.fonts.load(`12px ${fontFamily}`)
        loadFontArr.push(loadPromise)
      }
    }
  }
  return Promise.all(loadFontArr)
}
