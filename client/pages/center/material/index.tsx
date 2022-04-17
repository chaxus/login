/*
 * @Author: your name
 * @Date: 2022-02-20 15:06:47
 * @LastEditTime: 2022-03-01 10:37:48
 * @LastEditors: ran
 */
import React, { useState } from 'react'
import { Menu, Dropdown, Modal, message } from 'antd'
import { MoreOutlined, CopyOutlined, DeleteOutlined, WarningOutlined, EyeOutlined } from '@ant-design/icons';
import { connect, useSelector } from 'react-redux'
import { bindActions, bindState } from '@/lib/redux'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Uploader from '@/components/uploader'
import addIcon from "@/assets/svgs/add-icon.svg"

const MenuItem = Menu.Item

const Material = ({ get, post }: any) => {
  const [state, setState] = useState<any>({
    ownMaterialList:[],
    curPicInfo:{},
    previewVisible:false
  })
  const getMaterialList = async () => {
    const res = await get('/api/userCenter/material')
    if (res.success) {
      const { data } = res;
      setState({
        ...state,
        ownMaterialList: data,
      })
    }
  }

  const splitNameWithDot = (str:string, len:number) => {
    if (!str) return ''
    const realLen = (s:string) => s.replace(/[^\x00-\xff]/g, "**").length
    if (realLen(str) <= len) return str
    const m = Math.floor(len / 2)
    for (let i = m; i < str.length; i++) {
      const cur = str.slice(0, i)
      if (realLen(cur) >= len) {
        return `${cur}...`
      }
    }
    return str
  }

  const setMenu = (imgInfo:any) => (
    <Menu>
      <CopyToClipboard text={imgInfo.coverUrl} onCopy={() => message.success('复制成功')}>
        <MenuItem>
          <>
            <CopyOutlined />
            复制链接
          </>
        </MenuItem>
      </CopyToClipboard>
      <MenuItem onClick={() => delMaterial(imgInfo)}>
        <DeleteOutlined />
        删除
      </MenuItem>
    </Menu>
  )

  const delMaterial = (imgInfo:any) => {
    if (!imgInfo || !imgInfo.id) {
      return message.warn('操作失败')
    }
    Modal.confirm({
      icon: <WarningOutlined />,
      content: '确定要删除吗',
      okText: '确认',
      onOk: async () => {
        const res = await post('/api/material/delete', { id: imgInfo.id })
        if (res.success) {
          message.success('操作成功')
          getMaterialList()
        } else {
          message.warn('操作失败')
        }
      },
      cancelText: '取消',
    });
  }

  const onUploadSuccess = async ({ url, fileName }:any) => {
    const insertRes = await post('/api/material/add', { imgUrl: url, fileName })
    if (insertRes.success) {
      getMaterialList();
    }
  }

  const previewPic = (picInfo:any) => {
    setState({
      ...state,
      curPicInfo: picInfo,
      previewVisible: true,
    })
  }

  const closePreviewModal = () => {
    setState({
      ...state,
      previewVisible: false,
    })
  }
  const { ownMaterialList, curPicInfo, previewVisible } = state
  return  <div className="user-center-material-container">
  <section className="material-container-owns">
    <header className="content-label">我的素材</header>
    <div className="material-container-owns-content">
      <Uploader onSuccess={onUploadSuccess} >
        <div className='create-new-element-template'>
          <img className='create-img' src={addIcon} />
          <div className='create-text'>上传素材</div>
        </div>
      </Uploader>
      {
        ownMaterialList.map((item:any) => {
          return (
            <div key={item.id} className="material-item-content">
              <img src={item.coverUrl} className="material-item" />
            </div>
          )
        })
      }
    </div>
  </section>
  <Modal
    title={curPicInfo.coverName}
    visible={previewVisible}
    className="material-preview-modal"
    onCancel={closePreviewModal}
    onOk={closePreviewModal}
  >
    <div className="material-preview-modal-content">
      <img className="material-preview-modal-content-img" src={curPicInfo.coverUrl} alt={curPicInfo.coverName} />
    </div>
  </Modal>
</div>
}
export default connect(bindState, bindActions())(Material)