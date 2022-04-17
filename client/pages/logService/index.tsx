import * as React from 'react'
import moment from 'moment'
import { bindActions, bindState } from '@/lib/redux'
import { connect } from 'react-redux'
import { cloneDeep } from 'lodash';
import { Input, message, Form, Table, DatePicker, Descriptions, Button, Tooltip } from 'antd';
import { UnControlled as CodeMirror } from 'react-codemirror2-react-17'
// theme
import 'codemirror/lib/codemirror.css';
// mode
import 'codemirror/mode/javascript/javascript';
 // 折叠代码
 import 'codemirror/addon/fold/foldgutter.css';
 import 'codemirror/addon/fold/foldcode';
 import 'codemirror/addon/fold/foldgutter';
 import 'codemirror/addon/fold/brace-fold';

const { RangePicker } = DatePicker;

 class LogList extends React.Component<any,any> {
  constructor(props: any) {
    super(props)
    this.state = {
      total: 0,
      page: 1,
      pageSize: 10,
      data: [],
      queryData: {
        url:'',
        timeRange:[moment().subtract(1,'day'),moment().add(1,'day')]
      },
      initialValues:{
        url:'',
        timeRange:[moment().subtract(1,'day'),moment().add(1,'day')]
      },
      hideContainer: true,
    }
  }

  handleSearch = (values: any) => {
    this.setState({
      queryData: values,
    }, () => {
      this.getLogList()
    })
  }

  getLogList = async (page = 1, pageSize = 10) => {
    try {
      let queryData = cloneDeep(this.state.queryData)
      const { timeRange } = queryData
      if (timeRange) {
        const [startTime, endTime] = timeRange
        queryData.startTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss');
        queryData.endTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss');
        delete queryData.timeRange
      }
      const res = await this.props.get('/api/getLogList', { offset: (page - 1) * pageSize, limit: pageSize, ...queryData })
      let { success, data } = res
      if (success) {
        this.setState({
          data:data.data,
          total:data.total,
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

  renderTable = () => {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
      },
      {
        title: 'Method',
        dataIndex: 'method',
      },
      {
        title: 'url',
        dataIndex: 'url',
        ellipsis: {
          showTitle: false,
        },
        render: (url: {} | null | undefined) => (
          <Tooltip placement="topLeft" title={url}>
            {url}
          </Tooltip>
        ),
      },
      {
        title: '开始时间',
        dataIndex: 'beginTime',
      },
      {
        title: '结束时间',
        dataIndex: 'endTime',
      },
    ]

    return (
      <Table
        rowKey="id"
        columns={columns}
        className="table"
        pagination={{
          simple: true,
          total: this.state.total,
          current: this.state.page,
          onChange: this.getLogList,
        }}
        expandable={{
          expandedRowRender: this.renderExpandRows,
        }}
        dataSource={this.state.data}
      />
    )
  }

  renderExpandRows = (record: { detailInfo: any; requestBody: any; responseBody: any; userAgent: any; requestIp: any; localIp: any; xRealIp: any; }) => {
    const { detailInfo, requestBody, responseBody, userAgent, requestIp, localIp, xRealIp } = record;
    return (
      <Descriptions title="详细信息" bordered size="small">
        <Descriptions.Item label="UserAgent" span={3}>{userAgent}</Descriptions.Item>
        <Descriptions.Item label="请求IP" span={1}>{requestIp}</Descriptions.Item>
        <Descriptions.Item label="主机IP" span={xRealIp ? 1 : 2}>{localIp}</Descriptions.Item>
        {xRealIp && <Descriptions.Item label="X-Real-IP" span={1}>{xRealIp}</Descriptions.Item>}
        {requestBody !== '' && (
        <Descriptions.Item label="请求体" span={3}>
          <CodeMirror
            value={requestBody}
            options={{
              mode: 'application/json',
              lineNumbers: true,
              foldGutter: true,
              gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
              readOnly: true,
            }}
          />
        </Descriptions.Item>
)}
        <Descriptions.Item label="响应体" span={3}>
          <CodeMirror
            value={responseBody}
            options={{
              mode: 'application/json',
              lineNumbers: true,
              foldGutter: true,
              gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
              readOnly: true,
            }}
          />
        </Descriptions.Item>
        {detailInfo && (
        <Descriptions.Item label="请求过程时间表" span={3}>
          <CodeMirror
            value={detailInfo}
            options={{
              mode: 'application/json',
              lineNumbers: true,
              foldGutter: true,
              gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
              readOnly: true,
            }}
          />
        </Descriptions.Item>
        )}
      </Descriptions>
    )
  }

  componentDidMount() {
    this.getLogList()
  }

  render() {
    const {initialValues} = this.state;
    return (
      <div className="logService-container">
        <div className="tool-bar">
          <Form layout="inline" className="breadcrumb" initialValues={initialValues} onFinish={this.handleSearch}>
            <div className="form-item-container">
              <Form.Item label="接口名" name="url" className="item">
                <Input placeholder="输入接口名查找" allowClear />
              </Form.Item>
              <Form.Item label="时间范围" name="timeRange">
                <RangePicker
                  showTime={{ format: 'HH:mm:ss' }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
        {this.renderTable()}
      </div>
    )
  }
}
export default connect(bindState, bindActions())(LogList)
