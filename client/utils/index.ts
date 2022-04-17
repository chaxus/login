/*
 * @Author: your name
 * @Date: 2022-02-20 14:48:26
 * @LastEditTime: 2022-02-26 19:27:57
 * @LastEditors: ran
 */
const base64ToBlob = (code: string) => {
    let parts = code.split(';base64,');
    let contentType = parts[0].split(':')[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;
    let uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  }
  
  const downloadFile = (fileName: string, content: any) => {
    let aLink = document.createElement('a');
    let blob = base64ToBlob(content);
    let evt = document.createEvent('HTMLEvents');
    evt.initEvent('click', true, true);
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  }
  
  const getSelectedElementById = (id: any, drawData: { [x: string]: any; }) => {
    let elementsArr: any[] = []
    Object.keys(drawData).forEach(key => {
      if (key.includes('Arr') && drawData[key] instanceof Array) {
        elementsArr = elementsArr.concat(drawData[key])
      }
    })
    let element = elementsArr.find(item => item.id === id)
    return element
  }
  
  export {
    downloadFile,
    getSelectedElementById
  }