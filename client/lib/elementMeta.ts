export default {
  image: {
    drawType: 'image',
    x: 0,
    y: 0,
    url: 'https://p3.com/xbx5ivov1599625151993.png',
    width: 200,
    height: 200,
    zIndex: 1,
    id: 1,
    rotate: 0, // 旋转角度
    isBorderChecked: false,
    borderWidth: 0, // 边框宽度
    borderColor: 'transparent', // 边框颜色
    borderRadius: 0, // 圆角
    borderStyle: 'solid',
    borderTopLeftRadius: 0, // 左上角圆角值   borderRadius存在时 此值无效
    borderTopRightRadius: 0, // 右上角圆角值   borderRadius存在时 此值无效
    borderBottomLeftRadius: 0, // 左下角圆角值   borderRadius存在时 此值无效
    borderBottomRightRadius: 0, // 右下角圆角值   borderRadius存在时 此值无效
    // "blur": 5,                      // 高斯模糊 模糊半径
    // isLatest: false, // 是否是最后一个元素， 为高度自适应提供基准
    autoClip: 2, // 图片裁剪 0代表长边优先；1代表短边优先；2代表强制缩略；4代表短边优先缩略后填充
    // "follow": 5 ,                    // 跟随某一个元素，值为被跟随元素的ID
    // "followOptions": {
    //   "target": 15,               // 随动参照元素ID
    //   "type": "size",             // 随动类型  size: 自适应宽高； position: 位置随动
    //   "align": "center",          // 自适应宽高类型 left: 始终居左； center: 始终剧中； right:始终居右   以参照物的其实坐标为参照
    //   "axis": 10,                 // type为position时起作用，y: y轴随动；x: x轴随动
    //   "paddingTop": 10,           // type为size时起作用 上内边距
    //   "paddingBottom": 10,        // type为size时起作用 下内边距
    //   "paddingLeft": 10,          // type为size时起作用 左内边距
    //   "paddingRight": 10,         // type为size时起作用 右内边距
    //   "marginTop": 10,            // type为position、axis为y时起作用 上外边距
    //   "marginLeft": 10,           // type为position、axis为x时起作用 左外边距
    // }
    shadow: {
      blur: 0, // 模糊半径
      color: 'transparent', // 阴影颜色
      offsetX: 0, // X 偏移量
      offsetY: 0, // Y 偏移量
    }, // 阴影
  },
  text: {
    id: 1, // 元素ID，如果不被跟随可不标注
    drawType: 'text', // 绘制类型
    text: '双击/右键编辑文本', // 文本
    x: 100, // 元素X坐标
    y: 100, // 元素Y坐标
    zIndex: 2, // 绘制层级
    fontSize: 24, // 字符大小
    fontStyle: 'normal', // 字体样式
    fontWeight: 'normal', // 字重样式
    fontVariant: 'normal', // 字样式
    textAlign: 'left', // 对齐方式
    padding: 0, // 边距
    paddingLeft: 0, // 左边距 padding存在时 此值无效
    paddingRight: 0, // 右边距 padding存在时 此值无效
    lineHeight: 24, // 行距
    textBaseline: 'middle', // 文本基线 默认middle
    row: 0, // 加入pdding时生效
    color: '#000', // 文本颜色  或 rgba(0,0,0,0)
    textContainerWidth: 300,
  },
  rect: {
    id: 1, // 元素ID，如果不被跟随可不标注
    drawType: 'rect', // 绘制类型
    x: 100, // 元素X坐标
    y: 100, // 元素Y坐标
    width: 150, // 元素宽
    height: 150, // 元素高
    zIndex: 2, // 绘制层级
    backgroundColor: '#75f454', // 填充颜色
    borderWidth: 0, // 边框宽度
    borderColor: 'transparent', // 边框颜色
    borderRadius: 0, // 圆角
    borderTopLeftRadius: 0, // 左上角圆角值   borderRadius存在时 此值无效
    borderTopRightRadius: 0, // 右上角圆角值   borderRadius存在时 此值无效
    borderBottomLeftRadius: 0, // 左下角圆角值   borderRadius存在时 此值无效
    borderBottomRightRadius: 0, // 右下角圆角值   borderRadius存在时 此值无效
    borderInsideRadius: 0,
    borderTopLeftInsideRadius: 0, // 左上角内圆角值   borderInsideRadius存在时 此值无效
    borderTopRightInsideRadius: 0, // 右上角内圆角值   borderInsideRadius存在时 此值无效
    borderBottomLeftInsideRadius: 0, // 左下角内圆角值   borderInsideRadius存在时 此值无效
    borderBottomRightInsideRadius: 0, // 右下角内圆角值   borderInsideRadius存在时 此值无效
    // "blur": 5,                      // 高斯模糊 模糊半径
    // "gradient" : {                              // 背景渐变
    //   "type": "linear",                   // 线性渐变 、 放射性渐变
    //   "options": {
    //     "colorArr": [
    //       {
    //         "position": 0,  // 渐变插值
    //         "color": "red"  // 渐变开始颜色
    //       },
    //       {
    //         "position": 0.1,  // 渐变插值
    //         "color": "green"// 渐变开始颜色
    //       }
    //     ],
    //     "startX": 0,            // 渐变开始位置X
    //     "startY": 0,            // 渐变开始位置Y
    //     "endX": 100,            // 渐变结束位置X
    //     "endY": 500             // 渐变结束位置Y
    //   }
    // },
    shadow: {
      offsetX: 0, // X 偏移量
      offsetY: 0, // Y 偏移量
      blur: 0, // 模糊半径
      color: 'transparent', // 阴影颜色
    }, // 阴影
    // "isLatest": false ,                  // 是否是最后一个元素， 为高度自适应提供基准
    // "follow": 5                     // 跟随某一个元素，值为被跟随元素的ID
  },
  line: {
    id: 1, // 元素ID，如果不被跟随可不标注
    drawType: 'line', // 绘制类型
    borderWidth: 1, // 线宽
    points: [ // 线经过的点
      { x: 100, y: 100 },
      { x: 300, y: 300 },
    ],
    borderColor: '#000', // 线颜色
    lineStyle: 'solid', // 线类型
    dashedWidth: 0, // 虚线段宽
    dashedOffset: 0, // 虚线段间距
    // "isLatest": 5,                   // 是否是最后一个元素， 为高度自适应提供基准
    // "follow": 5 ,                    // 跟随某一个元素，值为被跟随元素的ID
  },
  avatar: {
    drawType: 'avatar',
    x: 100,
    y: 100,
    zIndex: 0,
    radius: 50,
    url: 'http://p3.com/168765f0e4a3c672acd7b852b183b1ffc443e008.png',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  circle: {
    drawType: 'circle',
    x: 100,
    y: 100,
    zIndex: 101,
    backgroundColor: '#4395d5',
    radius: 50,
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: 0,
    dashedWidth: 2,
    dashedOffset: 2,
  },
  qrcode: {
    drawType: 'qrcode',
    x: 0,
    y: 0,
    url: '输入二维码内容',
    width: 150,
    height: 150,
  },
  wxacode: {
    drawType: 'wxacode',
    x: 0,
    y: 0,
    wxappId: '',
    path: '',
    width: 150,
    height: 150,
  },
  placeholder: {
    image: [{ name: 'url', field: 'url' }],
    text: [{ name: '文本', field: 'text' }],
    rect: [{ name: '进度条', field:'process'}],
    line: [],
    avatar: [{ name: 'url', field: 'url' }],
    circle: [],
    qrcode: [{ name: '内容', field: 'url' }],
    wxacode: [{ name: '页面路径', field: 'path' }],
    listElement: [{ name: '数量', field: 'count' }],
  },
}
