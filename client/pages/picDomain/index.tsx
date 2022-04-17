import * as React from 'react';
import classname from 'classnames';
import { Button, Modal, Form, Input, Table, message, Tag, Select, DatePicker } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { cloneDeep, map } from 'lodash';
import SearchForm from '@/components/searchForm';
import dayjs from 'dayjs'
import Context from '@/lib/context'
import { get, post } from '@/lib/request';
const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
const STATUS = {
  '-1': '全部',
  0: '已下线',
  1: '在线',
};

interface IState {
  ModalText: string,
  visible: boolean,
  confirmLoading: boolean,
  total: number,
  page: number,
  pageSize: number,
  data: any[],
  queryData: object,
  hideContainer: boolean,
  serviceList: any[],
}
export default class HostManage extends React.Component<any, IState> {
  static contextType = Context
  constructor(props) {
    super(props)
    this.state = {
      ModalText: 'Content of the modal',
      visible: false,
      confirmLoading: false,
      total: 0,
      page: 1,
      pageSize: 10,
      data: [],
      queryData: {},
      hideContainer: true,
      serviceList: []
    }
  }

  renderForm = () => {
    const [form] = Form.useForm();
    const layout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const tailLayout = {
      wrapperCol: { offset: 8, span: 16 },
    };
    const onFinish = async values => {
      this.setState({
        confirmLoading: true,
      });
      try {
        const result = await post('/api/picDomain/add', values);
        if (result.success) {
          message.success('域名添加成功');
          form.resetFields();
          this.handleOk();
          this.getDomainList();
          this.setState(({
            page: 1
          }))
        } else {
          message.error(`域名添加失败，${result.error.message}`);
        }
      } catch (e) {
        message.error('域名添加失败');
        console.log('e', e)
      }
    };

    const onFinishFailed = errorInfo => {
      console.log('Failed:', errorInfo);
    };
    return (
      <Form
        {...layout}
        form={form}
        name="basic"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="域名"
          name="domain"
          rules={[{ required: true, pattern: RegExp(`^(?=^.{3,255}$)(http(s)?:\\/\\/)?(www\\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\\d+)*(\\/\\w+\\.\\w+)*$`), message: '请输入正确的域名!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button className='submit-button' type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    );
  }

  renderModal = () => {
    const { visible, confirmLoading, ModalText } = this.state;
    return (
      <Modal
        title="添加域名"
        visible={visible}
        onOk={this.handleOk}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div><this.renderForm /></div>
      </Modal>
    )
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    this.setState({
      visible: false,
      confirmLoading: false,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  renderTable = () => {
    const columns = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id'
      },
      {
        title: '域名',
        dataIndex: 'domain',
        key: 'domain',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (value) => {
          return value === 0 ? <Tag color="red">{STATUS[value]}</Tag> : <Tag color="green">{STATUS[value]}</Tag>
        },
      },
      {
        title: '添加时间',
        key: 'createTime',
        dataIndex: 'createTime',
        render: text => {
          return (
            <div key={text}>
              {dayjs(text).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          );
        },
      },
      {
        title: '添加人',
        key: 'creator',
        dataIndex: 'creator',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <span>
            {
              this.context.userInfo.email === record.creator ? <a style={{ marginRight: 16 }} onClick={() => this.deletaDomain(record.id)}>删除</a> : null
            }
            <a style={{ marginRight: 16 }} onClick={() => this.changeStatus(record)}>{record.status === 1 ? '停用' : '启用'}</a>
          </span>
        ),
      },
    ];
    return (
      <Table
        rowKey="id"
        columns={columns}
        className='table'
        dataSource={this.state.data}
        pagination={{
          total: this.state.total,
          pageSize: this.state.pageSize,
          current: this.state.page,
          onChange: this.getDomainList,
          onShowSizeChange: this.getDomainList
        }}
      />
    )
  }

  changeStatus = (data) => {
    let { id, status } = data
    let api = 'online'
    if (status === 1) {
      api = 'offline'
    }
    confirm({
      title: `${status === 1 ? '下线' : '上线'}域名`,
      content: `确定要${status === 1 ? '下线' : '上线'}该域名`,
      onOk: async () => {
        try {
          const res = await post(`/api/picDomain/${api}`, { id })
          if (res.success) {
            message.success('操作成功');
            this.getDomainList(this.state.page, this.state.pageSize)
          } else {
            message.error(`操作失败: ${res.message}`)
          }
        } catch (e) {
          message.error(`操作失败: ${e}`)
        }
      },
      onCancel() { },
    });
  }

  getDomainList = async (page = 1, pageSize = 10) => {
    try {
      const queryData:any = cloneDeep(this.state.queryData);
      const { createTime } = queryData;
      if (createTime) {
        queryData.createTimeStart = dayjs(createTime[0]).format('YYYY-MM-DD HH:mm:ss');
        queryData.createTimeEnd = dayjs(createTime[1]).format('YYYY-MM-DD HH:mm:ss');
        delete queryData.createTime;
      }
      const { success, data, paging, message: errorMessage } = await get('/api/picDomain/list', { offset: (page - 1) * pageSize, limit: pageSize, ...queryData, })
      if (success) {
        const { total } = paging;
        this.setState({ data, total, page, pageSize })
      } else {
        message.error(`操作失败: ${errorMessage}`)
        console.log(errorMessage)
      }
    } catch (error) {
      message.error(`操作失败: ${error}`)
    }
  }

  componentDidMount() {
    this.getDomainList()
  }

  deletaDomain = async (id) => {
    confirm({
      title: '删除域名',
      content: '确定要删除该域名',
      onOk: () => {
        return post('/api/picDomain/delete', { id }).then(res => {
          const { success } = res;
          if (success) {
            message.success('操作成功');
            this.getDomainList(this.state.page, this.state.pageSize)
          } else {
            message.error(`操作失败: ${message}`)
          }
        }).catch(error => {
          message.error(`操作失败`)
        })
      }
    });
  }

  handleSearch = values => {
    this.setState({
      queryData: values
    }, this.getDomainList)
  }

  changeSearchContainerStatus = () => {
    this.setState({
      hideContainer: !this.state.hideContainer,
    });
  };

  render() {
    const { serviceList } = this.state;
    return (
      <div className="index-container">
        <div className="content-container">
          <div className="content-search-container">
            <SearchForm
              handleSearch={this.handleSearch}
              initialValues={{ status: '-1' }}
              extraButtons={
                <Button className="create-button" type="primary" onClick={this.showModal}>添加域名</Button>
              }
            >
              <div>
                <div className="form-item-container">
                  <Form.Item label="域名" name="domain"><Input allowClear /></Form.Item>
                  <Form.Item className="item" label="添加人" name="createUserEmail"><Input allowClear /></Form.Item>
                  <Form.Item className="item" label="状态" name="status">
                    <Select>
                      {
                        map(STATUS, (item, key) => (
                          <Option value={key} key={key}>{item}</Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                </div>
                <div className={classname('form-item-container', { 'hide-container': this.state.hideContainer })}>
                  <Form.Item label="添加时间" name="createTime"><RangePicker /></Form.Item>
                </div>
              </div>
            </SearchForm>
            <div className="more-operation" onClick={this.changeSearchContainerStatus}>
              {this.state.hideContainer ? <span>更多查询</span> : <span>收起</span>}
              {this.state.hideContainer ? <DownOutlined /> : <UpOutlined />}
            </div>
          </div>
          {this.renderTable()}
          {this.renderModal()}
        </div>
      </div>

    )
  }

}