import React, { useEffect, useRef, useState } from 'react'
import { Modal, Tabs, Upload, Table, Progress, Button, message } from 'antd'
import axios from 'axios';
import { CloudUploadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Dragger } = Upload;
const { TabPane } = Tabs;

export default function Uploader({
  children,
  btnClass,
  buttonText,
  onSuccess,
}) {
  const [visible, setVisible] = useState(false)
  const [uploadList, setUploadList] = useState<any[]>([])
  const [finishedList, setFinishedList] = useState<any[]>([])
  const latestUploadList = useRef(uploadList)

  const closeModal = () => {
    setVisible(false)
    setUploadList([])
    setFinishedList([])
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress = 0) => (<Progress percent={progress} />),
    },
  ];

  const getUploadConfig = () => {
    const uploadConfig = {
      showUploadList: false,
      action: '/proxy/alita/api/inside/upload',
      accept: 'image/*',
      onStart: file => {
        const { name, size } = file;
        const newList = [{
          key: +new Date(),
          fileName: name,
          progress: 0,
          size: `${(Number(size || 0) / 1024).toFixed(2)}KB`,
        }, ...uploadList]
        setUploadList(newList)
      },
      customRequest: async ({
        action,
        file,
      }) => {
        const formData = new FormData()
        formData.append('file', file)
        const result = await axios.post(action, formData)
        const { data: res } = result;
        if (res.success) {
          const { data } = res;
          const tempList = [...latestUploadList.current]
          const cur = tempList.shift()
          const curFinished = [
            { ...cur, progress: 100 },
            ...finishedList,
          ]
          setUploadList(tempList)
          setFinishedList(curFinished)
          onSuccess?.(data)
        } else {
          const { error } = res;
          message.warn(error.message)
        }
      },
    }
    return uploadConfig;
  }
  useEffect(() => {
    latestUploadList.current = uploadList
  }, [uploadList])
  return (
    <>
      {
        children
          ? (
            <div onClick={() => setVisible(true)} className={btnClass}>
              {children}
              {' '}
            </div>
          )
          : (
            <Button type="primary" onClick={() => setVisible(true)} className={btnClass}>
              {buttonText}
            </Button>
          )
      }
      <Modal
        title="上传素材"
        visible={visible}
        onCancel={closeModal}
        onOk={closeModal}
        className="upload-material-modal"
      >
        <Dragger {...getUploadConfig()}>
          <div className="upload-material-modal-content">
            <CloudUploadOutlined style={{ fontSize: '28px' }} />
            <div className="upload-material-modal-content-title">
              将文件拖到此处，或点击上传
              {/* <Upload {...this.getUploadConfig()} className="upload-by-click"><em className="upload-by-click-title">点击上传</em>
                  </Upload> */}
            </div>
            <div className="upload-material-modal-content-sub-title">单个文件大小不超过20M，支持 png、jpg、svg 格式</div>
          </div>
        </Dragger>
        <div className="upload-material-modal-table">
          <Tabs defaultActiveKey="1">
            <TabPane tab="正在上传" key="1">
              <Table
                className="upload-list-table"
                scroll={{ y: 240 }}
                columns={columns}
                dataSource={uploadList}
                key="doing"
                pagination={false}
              />
            </TabPane>
            <TabPane tab="上传完成" key="2">
              <Table
                className="finished-list-table"
                scroll={{ y: 240 }}
                columns={columns}
                dataSource={finishedList}
                key="finished"
              />
            </TabPane>
          </Tabs>
        </div>
      </Modal>
    </>
  )
}
Uploader.propTypes = {
  onSuccess: PropTypes.func,
  buttonText: PropTypes.string,
  btnClass: PropTypes.string,
  children: PropTypes.node,
}
Uploader.defaultProps = {
  buttonText: '上传素材',
  btnClass: '',
  onSuccess: () => { },
  children: null,
}
