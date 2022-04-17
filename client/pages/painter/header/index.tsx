import React, { useState, useEffect } from 'react'
import { Dropdown, Menu, Upload, Modal,Button,Tabs,message,Popover,Divider } from 'antd';
import {
  MoreOutlined,
  LogoutOutlined,
  SaveOutlined,
  RollbackOutlined,
  FundViewOutlined,
  UploadOutlined,
  UserOutlined,
  DownloadOutlined,
  OrderedListOutlined,
  HomeOutlined,
  EditOutlined,
  CommentOutlined,
} from '@ant-design/icons'
import { connect } from 'react-redux'
import { bindActions, bindState } from '@/lib/redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '@/lib/index'
import PsdParser from '@/lib/psdParser'
import JsonEditor from '@/components/jsonEditor'
import {isEqual } from 'lodash';
import {getSelectedElementById} from '@/utils/index'

const { Item } = Menu
const { TabPane } = Tabs
interface Iprops {
  setDrawData: (drawData: any) => void;
  setLoading?: () => void;
  onSaveTemplate?: () => void;
  onPreview?: () => void;
  onExportPoster?:() => void;
  onBatchGenPoster?:() => void;
  onChangeIdentity?:() => void;
  drawData:any,
  selectedElementId:any,
  identity:number,
}

const Header: React.FC<Iprops> = props => {
  const { setDrawData, onSaveTemplate, onPreview, drawData,selectedElementId,identity } = props
  const [codeModalVisible,setCodeModalVisible] = useState(false);
  const [activeTab,setActiveTab] = useState("1");
  const [elementCodeEditor,setElementCodeEditor ]= useState({getValue:function():string{return ''}});
  const [drawDataCodeEditor,setDrawDataCodeEditor ]= useState({getValue:function():string{return ''}});
  const [selectedElement,setSelectedElement] = useState();

  useEffect(() => {
    const selectedElement = getSelectedElementById(selectedElementId, drawData);
    setSelectedElement(selectedElement);
  });

  const updateDrawDataWithElement = (element: { drawType: any; id: any; },ignore = false )=> {
    const elementArr = drawData[`${element.drawType}Arr`]
    if (elementArr && elementArr.length) {
      const newElementArr = elementArr.filter((item: { id: any; }) => item.id !== element.id)
      newElementArr.push(element)
      drawData[`${element.drawType}Arr`] = newElementArr
      props.setDrawData({...drawData,ignore})
    }
  }
  // 编辑单个元素配置代码
  const onElementEditorChange = (valueObj: any) => {
    updateDrawDataWithElement(valueObj);
  }

  // 编辑模板配置代码
  const onDrawDataEditorChange = (valueObj: any) => {
    props.setDrawData(valueObj);
  }

  // 提交代码编辑
  const onCodeEditSubmit = () => {
    if (activeTab === '1') {
      let value = elementCodeEditor.getValue();
      try {
        let valueObj = JSON.parse(value)
        if (!isEqual(valueObj, selectedElement)) {
          onElementEditorChange(valueObj);
        }
        setCodeModalVisible(false);
      } catch (error) {
        message.error(`${error}`);
      }
    } else {
      let value = drawDataCodeEditor.getValue();
      try {
        let valueObj = JSON.parse(value)
        if (!isEqual(valueObj, drawData)) {
          onDrawDataEditorChange(valueObj);
        }
        setCodeModalVisible(false);
      } catch (error) {
        message.error(`${error}`);
      }
    }
  }

  let navigate = useNavigate()

  const customRequest = async ({ file }:any) => {
    const objectURL = URL.createObjectURL(file);
    let parser = new PsdParser(objectURL)
    let drawInfo = await parser.parsePsd()
    props.setDrawData(drawInfo)
    URL.revokeObjectURL(objectURL)
  }

  const toTemplateList = () => {
    setDrawData({});
    navigate('/template');
  }


  const toCenter = () => {
    setDrawData({});
    navigate('/');
  }

  const menu = (
    <Menu>
      <Item>
        <div className="header-menu-item-container" onClick={logout}>
          <LogoutOutlined />
          <div className="menu-text">退出</div>
        </div>
      </Item>
      <Item>
        <div className="header-menu-item-container" onClick={props.onChangeIdentity}>
          <UserOutlined />
          <div className="menu-text">身份选择</div>
        </div>
      </Item>
    </Menu>
  )

  const renderCodeConfigModal = () => {
    return (
      <Modal
          title="编辑代码"
          centered
          visible={codeModalVisible}
          destroyOnClose={true}
          onCancel={() => setCodeModalVisible(false)}
          width={800}
          className="code-config-modal"
          footer={[
            <Button key="close" onClick={() => setCodeModalVisible(false)}>取消</Button>,
            <Button key="submit" type="primary" onClick={onCodeEditSubmit}>确定</Button>,
          ]}
        >
          <Tabs type="card" onChange={key => setActiveTab(key)} activeKey={activeTab}>
            <TabPane tab="选中元素" key="1">
              <JsonEditor value={selectedElement} editorDidMount={(editor: React.SetStateAction<{ getValue: () => string; }>) => { setElementCodeEditor(editor)}} />
            </TabPane>
            <TabPane tab="模版代码" key="2">
              <JsonEditor value={drawData} editorDidMount={(editor: React.SetStateAction<{ getValue: () => string; }>) => { setDrawDataCodeEditor(editor)}} />
            </TabPane>
          </Tabs>
        </Modal>
    )
  }

  return (
    <div className="header-container">
      <Popover 
      content={<img className="helpGroup-img" src="https://p3.com/be602046.jpg"/>} 
      trigger="hover">
        <div className="opt-button">
          <CommentOutlined className="opt-icon" />
          <span className="opt-title">钉钉答疑</span>
        </div>
      </Popover>      
      {
        identity !==3 &&
        <div className="opt-button" onClick={()=> setCodeModalVisible(true)}>
          <EditOutlined className="opt-icon" />
          <span className="opt-title">代码编辑</span>
        </div>
      }
      <div className="opt-button" onClick={props.onBatchGenPoster}>
        <OrderedListOutlined className="opt-icon" />
        <span className="opt-title">批量生成</span>
      </div>
      <div className="opt-button" onClick={props.onExportPoster}>
        <DownloadOutlined className="opt-icon" />
        <span className="opt-title">导出海报</span>
      </div>
      <Upload
        className="opt-title special"
        name="file"
        accept=".psd"
        showUploadList={false}
        customRequest={customRequest}
      >
        <div className="opt-button">
          <UploadOutlined className="opt-icon" />
          <span className="opt-title">PSD解析</span>
        </div>
      </Upload>
      <div className="opt-button" onClick={onPreview}>
        <FundViewOutlined className="opt-icon" />
        <span className="opt-title">预览</span>
      </div>
      <div className="opt-button" onClick={onSaveTemplate}>
        <SaveOutlined className="opt-icon" />
        <span className="opt-title">保存</span>
      </div>
      <div className="opt-button" onClick={toTemplateList}>
        <RollbackOutlined className="opt-icon" />
        <div className="opt-title">模版管理</div>
      </div>
      <div className="opt-button" onClick={toCenter}>
        <HomeOutlined className="opt-icon" />
        <div className="opt-title">个人中心</div>
      </div>
      <Dropdown overlay={menu} placement="bottomRight">
        <div className="opt-button">
          <MoreOutlined className="opt-icon" />
          <span className="opt-title">更多</span>
        </div>
      </Dropdown>
      {renderCodeConfigModal()}
    </div>
  );
}

export default connect(bindState, bindActions())(Header)


