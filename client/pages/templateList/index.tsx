import * as React from 'react';
import classname from 'classnames';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, Modal, Form, Input, Table, message, Tag,Select,DatePicker } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import {cloneDeep,map} from 'lodash';
import SearchForm from '@/components/searchForm';
import SearchInput from '@/components/searchInput';
import  dayjs from 'dayjs'
import { get, post } from '@/lib/request';

const { confirm } = Modal;
const {Option} = Select;
const { RangePicker } = DatePicker;
const STATUS = {
  '-1': '全部',
  0: '已下线',
  1: '在线',
};
interface IState{
  ModalText: string,
  visible: boolean,
  confirmLoading: boolean,
  total: number,
  page: number,
  pageSize: number,
  data:any[],
  serviceList:any[],
  queryData:object,
  hideContainer:boolean,
}

export default class ServiceList extends React.Component<any, IState> {
  constructor(props) {
    super(props);
    this.state = {
      ModalText: 'Content of the modal',
      visible: false,
      confirmLoading: false,
      total: 0,
      page: 1,
      pageSize: 10,
      data: [],
      serviceList:[],
      queryData:{},
      hideContainer:true,
    };
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
        const result = await post('/api/accessService/registerService', values);
        if (result.success) {
          message.success('服务注册成功');
          form.resetFields();
          this.handleOk();
          this.getServiceList();
          this.setState(({
            page: 1,
          }));
        } else {
          message.error(`服务注册失败，${result.error.message}`);
        }
      } catch (e) {
        message.error('服务注册失败');
        console.log('e', e);
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
          label="服务名称"
          name="serviceName"
          rules={[{ required: true, message: '请输入服务名!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="serviceDec"
          label="服务描述"
          rules={[{ required: true, message: '请输入服务描述!' }]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button className='submit-button' type="primary" htmlType="submit">
            提交
          </Button>
        </Form.Item>
      </Form>
    );
  };

  renderModal = () => {
    const { visible, confirmLoading } = this.state;
    return (
      <Modal
        title="注册服务"
        visible={visible}
        onOk={this.handleOk}
        confirmLoading={confirmLoading}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div><this.renderForm /></div>
      </Modal>
    );
  };
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
    this.setState({ visible: false });
  };

  renderTable = () => {
    const columns = [
      {
        title: '序号',
        render: (text, record, index) => `${index + 1}`,
        key: 'id',
      },
      {
        title: '服务名称',
        dataIndex: 'serviceName',
        key: 'serviceName',
      },
      {
        title: '服务ID',
        dataIndex: 'serviceId',
        key: 'serviceId',
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: value => {
          return value === 0 ? <Tag color="red">{STATUS[value]}</Tag> : <Tag color="green">{STATUS[value]}</Tag>;
        },
      },
      {
        title: '创建时间',
        key: 'createTime',
        render: text => {
          return (
            <div key={text}>
              {dayjs(text).format('YYYY-MM-DD HH:mm:ss')}
            </div>
          );
        },
        dataIndex: 'createTime',
      },
      {
        title: '创建人',
        key: 'creator',
        dataIndex: 'creator',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <div key={record.serviceId}>
            <CopyToClipboard text={record.serviceId} onCopy={() => message.success('复制成功')}>
              <a style={{ marginRight: 16 }}>复制服务ID</a>
            </CopyToClipboard>
            <a onClick={() => this.changeStatus(record)}>{record.status === 0 ? '启用服务' : '下线服务'}</a>
          </div>
        ),
      },
    ];
    return (
      <Table
        rowKey="serviceId"
        columns={columns}
        className='table'
        pagination={{
          total: this.state.total,
          pageSize: this.state.pageSize,
          current: this.state.page,
          onChange: this.getServiceList,
          onShowSizeChange: this.getServiceList,
        }}
        dataSource={this.state.data}
      />
    );
  };

  changeStatus = data => {
    const { serviceId, status } = data;
    let api = 'startService';
    if (status === 1) {
      api = 'stopService';
    }
    confirm({
      title: `${status === 1 ? '下线' : '上线'}服务`,
      content: `确定要${status === 1 ? '下线' : '上线'}该服务`,
      onOk: async () => {
        try {
          const res = await post(`/api/accessService/${api}`, { serviceId });
          if (res.success) {
            this.getServiceList(this.state.page, this.state.pageSize);
          } else {
            message.error(`操作失败: ${res.message}`);
          }
        } catch (e) {
          message.error(`操作失败: ${e}`);
        }
      },
    });
  };

  getServiceList = async (page = 1, pageSize = 10) => {
    const queryData:any = cloneDeep(this.state.queryData);
    const { createTime } = queryData;
    if (createTime) {
      queryData.createTimeStart = dayjs(createTime[0]).format('YYYY-MM-DD HH:mm:ss');
      queryData.createTimeEnd = dayjs(createTime[1]).format('YYYY-MM-DD HH:mm:ss');
      delete queryData.createTime;
    }
    const { success, data, paging } = await get('/api/accessService/list', { offset: (page - 1) * pageSize, limit: pageSize,...queryData });
    if (success) {
      this.setState({ data,total: paging.total, page, pageSize });
    }
  };

  getServiceNameList = async () => {
    const { success, data } = await get('/api/accessService/list');
    if (success) {
      let serviceList = map(data, item => ({
        label: item.serviceName,
        value: item.serviceName,
      }));
      this.setState({  serviceList });
    }
  };

  componentDidMount() {
    this.getServiceNameList();
    this.getServiceList();
  }

  handleSearch = values=>{
    this.setState({
      queryData:values
    },this.getServiceList)
  }

  changeSearchContainerStatus = () => {
    this.setState({
      hideContainer: !this.state.hideContainer,
    });
  };

  render() {
    const {serviceList} = this.state;
    return (
      <div className="index-container">
        <div className="content-container">
          <div className="content-search-container">
            <SearchForm 
              handleSearch={this.handleSearch}
              initialValues={{ status: '-1' }}
              extraButtons={
                <Button className="create-button" type="primary" onClick={this.showModal}>注册服务</Button>
              }
          >
            <div>
              <div className="form-item-container">
                <Form.Item label="服务ID" name="serviceId"><Input allowClear /></Form.Item>
                <Form.Item label="服务名称" name="serviceName">
                  <SearchInput options={serviceList} placeholder="输入服务名查找" style={{ width: 170 }} />
                </Form.Item>
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
                <Form.Item label="创建时间" name="createTime"><RangePicker /></Form.Item>
                <Form.Item className="item" label="创建人" name="creator"><Input allowClear/></Form.Item>
              </div>
            </div>
          </SearchForm>
          
            <div className="more-operation" onClick={this.changeSearchContainerStatus}>
              {this.state.hideContainer ? <span>更多查询</span>:<span>收起</span>}
              {this.state.hideContainer ? <DownOutlined /> : <UpOutlined />}
            </div>
          </div>
          {this.renderTable()}
          {this.renderModal()}
        </div>
      </div>

    );
  }


}
