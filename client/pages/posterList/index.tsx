import * as React from 'react';
import { Table, Modal, Button, message, Form, Input, DatePicker } from 'antd';
import { map, forEach, cloneDeep } from 'lodash';
import SearchForm from '@/components/searchForm';
import SearchInput from '@/components/searchInput';
import InputFileReader from '@/components/inputFileReader';
import { getEnv } from '@/lib/index'
import dayjs from 'dayjs';
import { get, post } from '@/lib/request';
import example from '@/assets/example.xlsx'


const { RangePicker } = DatePicker;
const ALITA_ID = {
  local: 'F5565FE25CC113958E189A1939281B29',
  test: 'F5565FE25CC113958E189A1939281B29',
  staging: '42890A18D2C8FF523EC6287BF2B74AE8',
  prod: '42890A18D2C8FF523EC6287BF2B74AE8',
}
interface IState {
  visible: boolean
  total: number
  page: number
  pageSize: number
  data: any[]
  batchModalVisibel: boolean
  queryData: object
  serviceList?: any[]
  image?: string
  batchData?: any[]
}
export default class PosterList extends React.Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      total: 0,
      page: 1,
      pageSize: 10,
      data: [],
      batchModalVisibel: false,
      queryData: {},
    };
  }

  renderTable = () => {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
      },
      {
        title: '海报',
        dataIndex: 'url',
        render: value => (
          !value ? '生成失败' : (
            <div onClick={this.showModal.bind(this, value)}>
              <img style={{ width: '75px', height: '110px' }} src={value} alt="" />
            </div>
          )
        ),
      },
      {
        title: '服务名',
        dataIndex: 'serviceName',
      },
      {
        title: '模板ID',
        dataIndex: 'templateId',
      },
      {
        title: '模板名',
        dataIndex: 'templateName',
      },
      {
        title: '生成时间',
        dataIndex: 'createTime',
        render: (value, line) => {
          if (!value) return ''
          let d = dayjs(value).format('YYYY-MM-DD HH:mm:ss')
          return d
        },
      },
      {
        title: '生成用户id',
        dataIndex: 'createUserId',
      },
      {
        title: '绘制耗时',
        dataIndex: 'spentTime',
      },
    ]

    return (
      <Table
        rowKey="id"
        columns={columns}
        className="table"
        pagination={{
          total: this.state.total,
          pageSize: this.state.pageSize,
          current: this.state.page,
          onChange: this.getPosterList,
          onShowSizeChange: this.getPosterList,
        }
        }
        dataSource={this.state.data}
      />
    )
  }

  getPosterList = async (page = 1, pageSize = 10) => {
    try {
      let queryData:any = cloneDeep(this.state.queryData)
      let { createTime } = queryData
      if (createTime) {
        queryData.createTimeStart = dayjs(createTime[0]).format('YYYY-MM-DD HH:mm:ss')
        queryData.createTimeEnd = dayjs(createTime[1]).format('YYYY-MM-DD HH:mm:ss')
        delete queryData.createTime
      }
      const res = await get('/api/poster/list', { offset: (page - 1) * pageSize, limit: pageSize, ...queryData })
      let { success, data, paging: { total } } = res
      if (success) {
        this.setState({
          data,
          total,
          page,
          pageSize,
        })
      } else {
        message.error(`查询失败: ${res.message}`)
      }
    } catch (error) {
      console.error(error)
      message.error(`查询失败: ${error}`)
    }
  }

  componentDidMount() {
    this.getPosterList();
    this.fetchService()
  }

  showModal = image => {
    this.setState({
      visible: true,
      image,
    })
  }

  showBatchModal = () => {
    this.setState({
      batchModalVisibel: true,
    })
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    })
  }

  handleCancelBatch = () => {
    this.setState({
      batchModalVisibel: false,
    })
  }

  renderModal = () => {
    const { visible, image } = this.state
    return (
      <Modal
        title="海报"
        visible={visible}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div className="poster-image-container" >
          <img src={image} alt="" />
        </div>
      </Modal>
    )
  }

  renderBatchModal = () => {
    const batchColumns = [{
      title: '序号',
      dataIndex: 'index',
      key: 'index',
    },
    {
      title: 'templateId',
      dataIndex: 'templateId',
      key: 'templateId',
    },
    {
      title: 'drawContent',
      dataIndex: 'drawContent',
      key: 'drawContent',
    },
    {
      title: 'url',
      dataIndex: 'url',
      key: 'url',
    }]

    const { batchModalVisibel, batchData = [] } = this.state
    return (
      <Modal
        width={800}
        title="批量生成海报"
        visible={batchModalVisibel}
        onCancel={this.handleCancelBatch}
        footer={
          [
            <Button key="back" onClick={this.handleCancelBatch} >
              取消
      </Button>,
            <Button key="submit" type="primary" onClick={this.batchCreatePoster} >
              生成
      </Button>,
          ]
        }
      >
        <InputFileReader onChange={this.handleImportData} xlsx />
        <p style={{ marginTop: 15 }}> <a href={example} > 示例文件 </a></p >
        <Table columns={batchColumns} dataSource={batchData} rowKey="index" scroll={{ x: 700 }
        } />
      </Modal>
    )
  }

  batchCreatePoster = () => {
    let { batchData } = this.state
    let appId = ALITA_ID[getEnv()]
    forEach(batchData, item => {
      let { templateId, drawContent } = item
      post('/api/inside/poster/genPoster', { templateId, appId, drawContent: JSON.parse(drawContent) })
        .then(res => {
          if (res.success) {
            item.url = res.data
            this.setState({
              batchData,
            })
          } else {
            message.error(`生成失败: ${res.message}`)
          }
        })
        .catch(e => {
          console.error(e)
          message.error(`生成失败: ${e}`)
        })
    })
  }

  handleImportData = sheets => {
    let sheetData = sheets[0].data;
    if (!sheetData) {
      message.warn('当前文件为空')
    }
    // 删除表头
    if (sheetData && sheetData[0] && typeof sheetData[0][0] !== 'number') {
      sheetData.shift();
    }

    let unavailableRow:any = -1
    let data = map(sheetData, (row, index) => {
      if (!row[0]) {
        unavailableRow = index
      }
      return {
        index,
        templateId: row[0],
        drawContent: row[1],
      }
    })
    if (unavailableRow !== -1) {
      message.error(`第${unavailableRow + 1}行数据templateId,请检查并重新上传`);
      data = []
    }

    this.setState({
      batchData: data,
    })
  }

  handleSearch = values => {
    this.setState({
      queryData: values,
    }, () => {
      this.getPosterList()
    })
  }

  fetchService = async () => {
    try {
      let { success, data = [], error: { message: errMsg = '' } = {} } = await get('/api/accessService/list')
      if (success) {
        data = map(data, item => ({
          label: item.serviceName,
          value: item.serviceId,
        }))
      } else {
        message.error('查询失败', errMsg)
        console.error('查询失败', errMsg)
      }
      this.setState({ serviceList: data })
    } catch (error) {
      message.error('查询失败', error)
      console.error('查询失败', error)
      this.setState({ serviceList: [] })
    }
  }

  render() {
    let { serviceList } = this.state;
    return (
      <div className="poster-container">
        <SearchForm handleSearch={this.handleSearch} extraButtons={<Button type="primary" onClick={this.showBatchModal}>批量生成</Button>}>
          <Form.Item label="模版ID" name="templateId"><Input allowClear /></Form.Item>
          <Form.Item label="服务名" name="serviceId">
            <SearchInput options={serviceList} placeholder="输入服务名查找" style={{ width: 170 }} />
          </Form.Item>
          <Form.Item label="生成时间" name="createTime"><RangePicker /></Form.Item>
        </SearchForm>
        {this.renderTable()}
        {this.renderModal()}
        {this.renderBatchModal()}
      </div>
    )
  }
}
