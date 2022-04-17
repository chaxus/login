// @ts-nocheck
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { message, Button, Form, Modal, Input, Checkbox, Radio, Drawer, Table } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { cloneDeep, map, find, forEach } from 'lodash';
import SparkMD5 from 'spark-md5';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import InputFileReader from '@/components/inputFileReader'
import { bindActions, bindState } from '@/lib/redux'
import { getQuery, getUser, getEnv } from '@/lib/index'
import Header from './header'
import SideMenu from './sideMenu'
import Simulator from './simulator'
import ConfigMenu from './configMenu'
import SearchInput from '@/components/searchInput'
import JsonEditor from '@/components/jsonEditor'
import ReplaceElList from '@/components/replaceElList'

const { confirm } = Modal

const DEFAULT_DRAW_DATA = { width: 375, height: 667 }

const IDENTITY = {
  RD: 1, // 开发
  PM: 2, // 产品
  OP: 3, // 运营
}

const ALITA_ID = {
  local: 'F5565FE25CC113958E189A1939281B29',
  test: 'F5565FE25CC113958E189A1939281B29',
  staging: '42890A18D2C8FF523EC6287BF2B74AE8',
  prod: '42890A18D2C8FF523EC6287BF2B74AE8',
}

const DRAWDATA_FIELD_INDEX = [{
  title: '二维码链接',
  dataIndex: 'qrcode',
}, {
  title: '小程序路径',
  dataIndex: 'path',
}, {
  title: '海报名称',
  dataIndex: 'posterName',
}, {
  title: '海报地址',
  dataIndex: 'url',
  render: (value: string) => <a href={value} target="_blank" rel="noreferrer">{value}</a>,
}]

interface IBasicData {
  id: number,
  templateId: string,
  serviceId: string,
  name: string,
  isShared: 1 | 0,
  content: string,
}

const Painter = (props: { get?: any; setDrawData?: any; post?: any; drawData: any; selectedElementId?: any; }) => {
  const configMenuRef = useRef<any>(null);
  const simulatorRef = useRef<any>(null);
  let editorRef = useRef<any>(null)

  const [templateForm] = Form.useForm();

  const [isCanvasClicked, setIsCanvasClicked] = useState(false)
  const [basicData, setBasicData] = useState<IBasicData | {}>({})
  const [identity, setIdentity] = useState(0)
  const [serviceList, setServiceList] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalType, setModalType] = useState('')
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [drawerType, setDrawerType] = useState('')
  const [previewResVisible, setPreviewResVisible] = useState(false)
  const [previewImg, setPreviewImg] = useState('')
  const [sampleFileUrl, setSampleFileUrl] = useState('')
  const [batchData, setBatchData] = useState([])
  const [importTableHead, setImportTableHead] = useState([])
  const [saveOnBatchGen,setSaveOnBatchGen] = useState(false);

  const getTemplateDetail = async (id: any) => {
    let { success, data, message: errorMessage } = await props.get('/api/template/detail', { id })
    if (success) {
      return data
    }
    message.error(`查询失败,${errorMessage}`)
    return void 0
  }

  const getIdentity = async () => {
    let { success, data = {}, message: errorMessage } = await props.get('/api/user/getUser')
    if (success) {
      let { identity } = data
      return identity
    }
    message.error(`查询失败,${errorMessage}`)
    return void 0
  }

  const getService = async () => {
    let { success, data = [], message: errorMessage } = await props.get('/api/accessService/list')
    if (success) {
      return data
    }
    message.error(`查询失败,${errorMessage}`)
    return void 0
  }

  const initTemplate = async (id?: number | undefined) => {
    let templateId = id || getQuery('templateId');
    let drawData = DEFAULT_DRAW_DATA
    if (templateId) {
      let templateData = await getTemplateDetail(templateId);
      if (templateData && templateData.content) {
        drawData = JSON.parse(templateData.content)
        // templateData.content = null
        setBasicData(templateData)
      } else {
        message.error('该模版不存在!2秒后将跳回模版管理页');
        setTimeout(() => {
          window.location.href = '/template'
        }, 2000)
      }
    }
    props.setDrawData(drawData)
  }

  const initIdentity = async () => {
    let identity = await getIdentity()
    if (!identity) {
      showIdentityModal()
    } else {
      setIdentity(identity)
    }
  }

  const initService = async () => {
    let list = await getService()
    let optionList:any = map(list, item => ({
      label: `${item.serviceName}`,
      value: item.serviceId,
    }))
    setServiceList(optionList)
  }

  useEffect(() => {
    initIdentity()
    initTemplate()
    initService()
  }, [])

  const onClickCanvas = (isCanvasClicked: boolean | ((prevState: boolean) => boolean)) => {
    setIsCanvasClicked(isCanvasClicked)
  }

  const saveTemplate = async () => {
    let isClone = getQuery('isClone');
    let basicFormData
    try {
      basicFormData = await templateForm.validateFields()
    } catch (error) {
      return void 0
    }
    let { drawData } = props
    let content = JSON.stringify(drawData)
    let data = {
      ...basicFormData,
      isShared: basicFormData.isShared ? 1 : 0,
      content
    }
    let { id } = basicData as IBasicData
    if (id && !isClone) {
      let { success, error } = await props.post('/api/template/update', { id, ...data })
      if (success) {
        message.success('修改成功')
        initTemplate(id)
      } else {
        message.error(`修改失败,${error.message}`)
      }
    } else {
      let { success, data: resData, error } = await props.post('/api/template/create', { creatorIdentity: identity, ...data })
      if (success) {
        message.success('创建成功')
        initTemplate(resData.id)
      } else {
        message.error(`创建失败,${error.message}`)
      }
    }
    if(saveOnBatchGen){
      setModalType('batchGen');
    }else{
      setModalVisible(false)
    }
  }

  const updateIdentity = async (identity: React.SetStateAction<number>) => {
    setModalVisible(false)
    try {
      let res = await props.post('/api/user/updateIdentity', { identity })
      if (res.success) {
        setIdentity(identity)
      } else {
        message.error(`修改失败，${res.error.message}`)
      }
    } catch (error) {
      message.error(`修改失败，${error}`)
    }
  }

  const preview = async () => {
    try {
      let valueObj = JSON.parse(editorRef.current.getValue());
      const drawData = cloneDeep(props.drawData);
      const res = await props.post('/api/poster/preview', { drawData, drawContent: valueObj })
      if (res.success) {
        setPreviewResVisible(true)
        setPreviewImg(res.data)
      } else {
        message.error(`服务端渲染失败: ${res.message}`)
      }
    } catch (e) {
      message.error(`预览失败，${e}`);
    }
  }

  /**
   * 生成示例文件
   */
  const genSampleFile = () => {
    let tHead = ['海报名称', '（勿动此行数据！）'] // 表头
    let tData = ['海报1'] // 示例数据

    let { qrcodeArr, wxacodeArr } = props.drawData
    if (wxacodeArr && wxacodeArr.length > 0) {
      tHead.splice(0, 0, '小程序路径')
      tData.splice(0, 0, 'pages/unlock/main?activityId=1562')
    }
    if (qrcodeArr && qrcodeArr.length > 0) {
      tHead.splice(0, 0, '二维码链接')
      tData.splice(0, 0, 'https://www.com/')
    }
    let sheetData = [
      tHead,
      tData,
    ]
    let worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet['!cols'] = new Array(tHead.length).fill({ wpx: 200 }) // 设置列宽
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    let fileArray = XLSX.write(workbook, { bookType: 'xlsx', bookSST: false, type: 'array' })
    let url = URL.createObjectURL(new Blob([fileArray], { type: 'application/octet-stream' })) // 转换成url
    return url
  }


  const handleImportData = (sheets: { data: any; }[]) => {
    let sheetData = sheets[0].data;
    let importTableHead:any = []
    let importTableHeadCN = [] // 导入文件的表头
    if (!sheetData) {
      message.warn('当前文件内容为空')
    }
    // 解析表头并删除
    if (sheetData && sheetData[0]) {
      importTableHeadCN = sheetData.shift();
      importTableHead = map(importTableHeadCN, headItem => (find(DRAWDATA_FIELD_INDEX, item => item.title === headItem) || {}).dataIndex).filter(i => i)
    }
    //删除空的行
    sheetData = sheetData.filter((row: string | any[])=>{
      return row.length !== 0;
    });

    let data:any = map(sheetData, (row, index) => {
      let item: any = {
        index: index + 1,
      }
      for (let i = 0; i < importTableHead.length; i++) {
        item[importTableHead[i]] = row[i]
      }
      return item
    })
    setBatchData(data)
    setImportTableHead(importTableHead)
  }

  const exportData = () => {
    let ws = XLSX.utils.json_to_sheet(batchData); // 添加数据
    // 更换header 重新生成sheet
    let tData:any = XLSX.utils.sheet_to_json(ws, { header: 1 })
    tData[0] = map(tData[0], dataIndex => {
      let item = find(DRAWDATA_FIELD_INDEX, item => item.dataIndex === dataIndex) || { title: dataIndex }
      return item.title
    })
    let ws1 = XLSX.utils.json_to_sheet(tData, { skipHeader: true });

    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Sheet1');
    XLSX.writeFile(wb, `海报${dayjs().format('YYYY-MM-DD')}.xlsx`);
  }

  const getDrawContent = (rowData: any) => {
    let drawContent:any = {}
    let { qrcodeArr, wxacodeArr } = props.drawData
    if (rowData.qrcode) {
      let qrcodeEle = qrcodeArr[qrcodeArr.length - 1]
      if (qrcodeEle) {
        drawContent[`$url$${qrcodeEle.id}`] = rowData.qrcode
      }
    }
    if (rowData.path) {
      let wxacodeEle = wxacodeArr[wxacodeArr.length - 1]
      if (wxacodeEle) {
        drawContent[`$path$${wxacodeEle.id}`] = rowData.path
      }
    }
    return drawContent
  }

  const batchGenPoster = () => {
    let { templateId } = basicData as IBasicData
    let appId = ALITA_ID[getEnv() as keyof typeof ALITA_ID]
    let userId = getUser().email
    const drawContentArr = batchData.map(item => getDrawContent(item));
    props.post('/api/poster/batchGenPoster', { templateId, drawContentArr,drawData:props.drawData, appId, userId })
      .then((res: { success: any; data: any; error: { message: any; }; }) => {
        if (res.success) {
          let urls = res.data;
          const data:any = map(batchData,(item:any) => {
            item.url = urls.shift();
            return item;
          })
          setBatchData(data)
        } else {
          message.error(`生成失败: ${res.error.message}`)
        }
      })
      .catch((e: any) => {
        message.error(`生成失败: ${e}`)
      })
  }

  const showSaveModal = () => {
    if (configMenuRef && configMenuRef.current) {
      let basicFormData = configMenuRef.current.getTemplateBasicData();
      const {scale = 1} = props.drawData
      templateForm.setFieldsValue({...basicFormData,scale})
    }
    setModalType('save')
    setModalVisible(true)
  }

  const showIdentityModal = () => {
    setModalType('identity')
    setModalVisible(true)
  }

  const showBatchGenPosterModal = () => {
    const sampleFileUrl = genSampleFile()
    setSampleFileUrl(sampleFileUrl)
    setModalType('batchGen')
    setModalVisible(true)
  }

  const renderIdentityModal = () => {
    return (
      <div className="identity-selector">
        <div className="identity-item" onClick={() => updateIdentity(IDENTITY.RD)}>开发</div>
        <div className="identity-item" onClick={() => updateIdentity(IDENTITY.PM)}>产品</div>
        <div className="identity-item" onClick={() => updateIdentity(IDENTITY.OP)}>运营</div>
      </div>
    )
  }

  const renderSaveModal = () => {
    const { width, height, scale = 1 } = props.drawData;
    const hiddenServiceInfo = identity === IDENTITY.PM || identity === IDENTITY.OP;
    return (
      <Form form={templateForm} className="template-form" onFinish={saveTemplate}>
        <Form.Item label="模版名称" name="name" rules={[{ required: true, message: '请输入模版名!' }]}>
          <Input />
        </Form.Item>
        {
          !hiddenServiceInfo && (
            <>
              <Form.Item label="接入应用" name="serviceId">
                <SearchInput options={serviceList} placeholder="输入服务名查找" />
              </Form.Item>
              <Form.Item label="模版ID" name="templateId">
                <Input disabled />
              </Form.Item>
            </>
          )
        }
        <Form.Item label="共享模板" name="isShared" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="模板尺寸">
          <span className="saveModal-content-text">{width * scale}px</span>
          <CloseOutlined />
          <span className="saveModal-content-text">{height * scale}px</span>
        </Form.Item>
        <Form.Item label="缩放比例" name="scale">
          <Radio.Group onChange={onSaveScaleSizeChange}>
            <Radio value={1}>1倍</Radio>
            <Radio value={2}>2倍</Radio>
            <Radio value={3}>3倍</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    )
  }

  const onSaveScaleSizeChange = (e:any) => {
    const value = e.target.value;
    props.setDrawData({...props.drawData,scale:value});
  }

  const renderBatchGenPosterModal = () => {
    const batchColumns:any = map([...importTableHead, 'url'], field => {
      let item = find(DRAWDATA_FIELD_INDEX, item => item.dataIndex === field)
      if (item) {
        return {
          title: item.title,
          dataIndex: item.dataIndex,
          render: item.render,
        }
      }
      return undefined
    }).filter(i => i)
    return (
      <div className="batch-gen-poster-modal">
        <InputFileReader onChange={handleImportData} xlsx />
        <p className="batch-gen-poster-opt">
          <a download="示例文件.xlsx" href={sampleFileUrl || ''}>请先下载当前海报模板文件</a>
          <a onClick={exportData}>导出文件</a>
        </p>
        <Table columns={batchColumns} dataSource={batchData} rowKey="index" scroll={{ x: 700 }} />
      </div>
    )
  }

  const closeModal = () => {
    setModalVisible(false)
  }

  const closeBatchModal = () => {
    setSaveOnBatchGen(false);
    closeModal();
  }

  const getModalInfo = (modalType: string) => {
    switch (modalType) {
      case 'save':
        return {
          title: '海报模板信息',
          onOk: saveTemplate,
          contentRender: renderSaveModal,
        }
      case 'identity':
        return {
          title: '切换角色',
          onOk: () => { },
          contentRender: renderIdentityModal,
          footer: null,
        }
      case 'batchGen':
        return {
          title: '批量生成海报',
          width: 800,
          onOk: batchGenPoster,
          contentRender: renderBatchGenPosterModal,
          footer: [
            <Button key="back" onClick={closeBatchModal}>
              取消
            </Button>,
            <Button key="submit" type="primary" onClick={batchGenPoster}>
              生成
            </Button>,
          ]
        }
      default:
        return {
          title: '',
          onOk: () => { },
          contentRender: () => null,
        }
    }
  }

  const showPreviewModal = () => {
    setDrawerVisible(true)
    setDrawerType('preview')
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  const getReplaceList = (drawData: { [x: string]: any; }) => {
    let replaceMap:any = {}
    for (let i = 0, keys = Object.keys(drawData); i < keys.length; i++) {
      let elementList = drawData[keys[i]]
      if (Array.isArray(elementList)) {
        elementList.forEach(item => {
          if (item.placeholders && item.placeholders.length > 0) {
            item.placeholders.forEach((placeholder: string | number) => {
              const key = `$${placeholder}$${item.id}`;
              replaceMap[key] = item[placeholder]
            })
          }
        })
      }
    }
    return replaceMap;
  }

  const closePreviewResModal = () => {
    setPreviewResVisible(false)
  }

  const renderPreviewDrawer = () => {
    let { drawData } = props
    const replaceMap = getReplaceList(drawData);
    return (
      <>
        <ReplaceElList drawData={drawData} />
        <JsonEditor value={replaceMap} editorDidMount={(editor: any) => { editorRef.current = editor }} />
        <Drawer
          title="海报预览"
          visible={previewResVisible}
          onClose={closePreviewResModal}
          footer={null}
          width={420}
        >
          <div className="posterEditor-template-image-container">
            <img src={previewImg} alt="" />
          </div>
        </Drawer>
      </>
    )
  }

  const getDrawerInfo = (drawerType: string) => {
    switch (drawerType) {
      case 'preview':
        return {
          title: '预览海报-替换内容',
          onOk: preview,
          contentRender: renderPreviewDrawer,
        }
      default:
        return {
          title: '',
          onOk: () => { },
          contentRender: () => null,
        }
    }
  }

  const onExportPoster = () => {
    simulatorRef.current?.showExportModal()
  }

  const onBatchGenPoster = () => {
    let { drawData } = props
    if (!basicData || !(basicData as IBasicData).templateId || SparkMD5.hash((basicData as IBasicData).content) !== SparkMD5.hash(JSON.stringify(drawData))) {
      confirm({
        title: '是否保存修改',
        content: '检测到未保存的修改，是否保存最新修改',
        onOk: () => {
          setSaveOnBatchGen(true);
          showSaveModal()
        },
        onCancel() {
          showBatchGenPosterModal()
        },
        okText:'保存',
        cancelText:'跳过'
      });
    } else {
      showBatchGenPosterModal()
    }
  }

  const onToggleEleList = () => {
    simulatorRef.current?.onToggleEleList()
  }

  const modalInfo = getModalInfo(modalType)
  const drawerInfo = getDrawerInfo(drawerType)
  return (
    <div className="poster-editor-layout-container">
      <Header
        identity={identity}
        onSaveTemplate={showSaveModal}
        onPreview={showPreviewModal}
        onChangeIdentity={showIdentityModal}
        onExportPoster={onExportPoster}
        onBatchGenPoster={onBatchGenPoster}
        drawData={props.drawData}
        selectedElementId={props.selectedElementId}
        setDrawData={props.setDrawData}      
      />
      <div className="main-container">
        <SideMenu onToggleEleList={onToggleEleList}/>
        <Simulator ref={simulatorRef} onClickCanvas={onClickCanvas} />
        <ConfigMenu
          ref={configMenuRef}
          basicData={basicData}
          isCanvasClicked={isCanvasClicked}
          identity={identity}
        />
        <Modal
          title={modalInfo.title}
          visible={modalVisible}
          closable={false}
          footer={modalInfo.footer}
          onOk={modalInfo.onOk}
          onCancel={closeModal}
          width={modalInfo.width}
        >
          {modalInfo.contentRender()}
        </Modal>
        <Drawer
          title={drawerInfo.title}
          width={420}
          closable={true}
          visible={drawerVisible}
          onClose={closeDrawer}
          footer={(
            <div style={{ textAlign: 'right' }} >
              <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
                取消
              </Button>
              <Button onClick={drawerInfo.onOk} type="primary">
                确定
              </Button>
            </div>
          )}
        >
          {drawerInfo.contentRender()}
        </Drawer>
      </div>
    </div>
  )
}

export default connect(bindState, bindActions())(Painter)

