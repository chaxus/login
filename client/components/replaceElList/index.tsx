/*
 * @Author: your name
 * @Date: 2022-02-20 14:51:51
 * @LastEditTime: 2022-02-20 15:02:23
 * @LastEditors: Please set LastEditors
 */
import * as React from 'react'
import { Typography } from 'antd'

interface replaceElArrType {
    key: string,
    elType: string,
    value: any,
}

const { Paragraph } = Typography

const TYPE = {
  IMAGE: '图片',
  TEXT: '文字',
  AVATAR: '头像',
  LINE: '直线',
  CIRCLE: '圆形',
  RECT: '矩形',
  QRCODE: '二维码',
  WXACODE: '小程序码',
}
export default class ReplaceElList extends React.Component<any, any> {
  getReplaceElList = (drawData: { [x: string]: any }) => {
    let replaceElArr: Array<replaceElArrType> = [];
    for (let i = 0, keys = Object.keys(drawData); i < keys.length; i++) {
      let elementList = drawData[keys[i]]
      if (Array.isArray(elementList)) {
        elementList.forEach(item => {
          if (item.placeholders && item.placeholders.length > 0) {
            item.placeholders.forEach((placeholder: string | number) => {
              const key = `$${placeholder}$${item.id}`;
              replaceElArr.push(
                {
                  key,
                  elType: item.drawType,
                  value: item[placeholder],
                },
              )
            })
          }
        })
      }
    }
    return replaceElArr;
  }

  render() {
    const { drawData } = this.props;
    const replaceArr = this.getReplaceElList(drawData);
    return (
      <div className="replaceEl-list">
        {
          replaceArr.length > 0 && replaceArr.map(el => {
            const { key, elType, value } = el;
            const type = TYPE[elType.toUpperCase()  as keyof typeof TYPE]
            return (
              <div key={key} className="replaceEl-li">
                <div className="replaceEl-li-key">{key}</div>
                <div className="replaceEl-li-desc">{type}</div>
                {elType === 'text'
                  ? (
                    <div className="replaceEl-li-content">
                      <Paragraph ellipsis>{value}</Paragraph>
                    </div>
                  )
                  : (
                    <div className="replaceEl-li-content">
                      <img className="replaceEl-li-img" src={value} alt="" />
                    </div>
                  )}
              </div>
            )
          })
        }
      </div>
    )
  }
}
