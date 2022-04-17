import * as React from 'react';
import { InputNumber, Tooltip } from 'antd';
import { StyleConfigContext } from '@/lib/context';

export default function CoordinateSetting() {
  const { selectedElement, onInfoChange } = React.useContext(StyleConfigContext);
  const { drawType, rotate = 0, blocked = false, id } = selectedElement
  const itemOptions = getCoordinates(selectedElement);
  
  function onLineCoordinateChange(val: any, arrIndex: string | number, key: string | number){
    const { points: newPoints } = selectedElement;
    newPoints[arrIndex][key] = val;
    onInfoChange(newPoints,'points');
  }

  return (
    <div className="editor-item-container">
      <ul className="editor-item-base">
        <li key="id">
          <Tooltip title="元素ID" placement="bottom" overlayStyle={{ width: '100px' }}>
            <span className="label">ID</span>
            <InputNumber
              disabled
              value={id}
              className="number-editor"
            />
          </Tooltip>
        </li>
        {drawType !== 'line' ? itemOptions.map((item: any) => (
          <li
            key={item.label}
          >
            <Tooltip title={item.description} placement="bottom" overlayStyle={{ width: '100px' }}>
              <span className="label">{item.label}</span>
              <InputNumber
                disabled={!!blocked}
                step={0.1}
                onChange={v => onInfoChange(v, item.tag)}
                value={item.value}
                precision={1}
                className="number-editor"
              />
            </Tooltip>
          </li>
        )) : itemOptions.map((item: any) => (
          <li
            key={item.label}
          >
            <Tooltip title={item.description} placement="bottom" overlayStyle={{ width: '100px' }}>
              <span className="label">{item.label}</span>
              <InputNumber
                disabled={!!blocked}
                step={1}
                onChange={v => onLineCoordinateChange(v, item.arrIndex, item.key)}
                value={item.value}
                precision={0}
                className="number-editor"
              />
            </Tooltip>
          </li>
        ))}
        {drawType === 'image' && (
          <li key="rotate">
            <Tooltip title="旋转" overlayStyle={{ width: '75px' }} placement="bottom">
              <svg xmlns="http://www.w3.org/2000/svg" className="svg-icon icon design-rotate" viewBox="0 0 12 12" aria-hidden="true">
                <circle cx="6" cy="6" r="6" className="main" />
                <circle cx="6" cy="3" r="2" className="fore" />
              </svg>
              <InputNumber disabled={!!blocked} step={2} onChange={v => onInfoChange(v, 'rotate')} value={rotate} formatter={value => `${value}°`} parser={(value: any) => value.replace('°', '')} className="number-editor" precision={0} />
            </Tooltip>
          </li>
        )}
      </ul>
    </div>
  )
}
function getCoordinates(selectedElement: { drawType?: any; x?: any; y?: any; width?: any; height?: any; radius?: any; points?: any; }): any[] {
  const { drawType, x, y, width, height, radius } = selectedElement;
  const itemOptions: any[] = [];
  if (drawType === 'line') {
    const { points } = selectedElement;
    let [startPoint, endPoint] = points;
    let { x: startX, y: startY } = startPoint;
    let { x: endX, y: endY } = endPoint;
    const lineProp = [
      { label: 'X1', description: '起点坐标X', value: startX, tag: 'points', arrIndex: 0, key: 'x' },
      { label: 'Y1', description: '起点坐标Y', value: startY, tag: 'points', arrIndex: 0, key: 'y' },
      { label: 'X2', description: '终点坐标X', value: endX, tag: 'points', arrIndex: 1, key: 'x' },
      { label: 'Y2', description: '终点坐标Y', value: endY, tag: 'points', arrIndex: 1, key: 'y' },
    ];
    Array.prototype.push.apply(itemOptions, lineProp)
  } else {
    const positionOptions = [
      { label: 'X', description: '横坐标(X)', value: x, tag: 'x' },
      { label: 'Y', description: '纵坐标(Y)', value: y, tag: 'y' },
    ];
    Array.prototype.push.apply(itemOptions, positionOptions)
    if (drawType !== 'avatar' && drawType !== 'circle' && drawType !== 'text') {
      const privateProp = [
        { label: 'W', description: '宽度(Width)', value: width, tag: 'width' },
        { label: 'H', description: '高度(Height)', value: height, tag: 'height' },
      ];
      Array.prototype.push.apply(itemOptions, privateProp)
    }
    if (drawType === 'avatar' || drawType === 'circle') {
      const avatarProp = [
        { label: 'R', description: '半径(Radius)', value: radius, tag: 'radius' },
      ];
      Array.prototype.push.apply(itemOptions, avatarProp)
    }
  }
  return itemOptions;
}