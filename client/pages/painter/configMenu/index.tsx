import React from 'react'
import { bindActions, bindState } from '@/lib/redux'
import { connect } from 'react-redux'
import { isEqual, map, cloneDeep } from 'lodash';
import { Tabs, InputNumber, Form, Input, Tooltip, Checkbox, message } from 'antd'
import classnames from 'classnames';
import SearchInput from '@/components/searchInput';
import AdvancedConfig from './advancedConfig';
import { StyleConfigContext } from '@/lib/context';
import { AdvancedConfigContext } from '@/lib/context';
import StyleConfig from './styleConfig';
import {getSelectedElementById} from '@/utils/index'

const { TabPane } = Tabs

 class ConfigMenu extends React.Component<any, any & {ref:any}> {
  formRef: any

  constructor(props: any) {
    super(props)
    this.state = {
      serviceList: [],
      wxappList: [],
      borderRediusChecked: 'setAll',
    }
    this.formRef = React.createRef();
  }

  static getDerivedStateFromProps(nextProps: { drawData: any; selectedElementId: any; }) {
    const { drawData, selectedElementId } = nextProps
    return {
      drawData: cloneDeep(drawData),
      selectedElement: getSelectedElementById(selectedElementId, drawData) || {},
    }
  }

  componentDidMount() {
    this.fetchService();
  }

  componentDidUpdate(prevProps: { basicData: any; }) {
    let { basicData = {} } = this.props
    if (!isEqual(prevProps.basicData, basicData)) {
      this.formRef.current.setFieldsValue(basicData)
    }
  }

  // 表单信息编辑时修改信息
  onInfoChange = (val: any, tag: any, ignore = false) => {
    const { selectedElement } = this.state
    this.updateDrawDataWithElement({ ...selectedElement, [tag]: val },ignore);
  }

  onMultiInfoChange = (updateInfo: any) => {
    const { selectedElement } = this.state
    this.updateDrawDataWithElement({ ...selectedElement, ...updateInfo });
  }

  onBoardChange = (val: any, tag: string) => {
    const { drawData } = this.props;
    this.props.setDrawData({ ...drawData, [tag]: val });
  }

  updateDrawDataWithElement = (element: { drawType: any; id: any; },ignore = false )=> {
    const { drawData } = this.state
    const elementArr = drawData[`${element.drawType}Arr`]
    if (elementArr && elementArr.length) {
      const newElementArr = elementArr.filter((item: { id: any; }) => item.id !== element.id)
      newElementArr.push(element)
      drawData[`${element.drawType}Arr`] = newElementArr
      this.props.setDrawData({...drawData,ignore})
    }
  }

  // 供外部调用获取模版的信息
  getTemplateBasicData = () => {
    let form = this.formRef.current;
    let result = form.getFieldsValue();
    return result;
  }

  // 表单信息编辑时修改信息
  onInputChange = (event: { target: { value: any; }; }, tag: any) => {
    this.onInfoChange(event.target.value, tag)
  }

  // 加载注册的服务
  fetchService = async () => {
    try {
      let { success, data = [], message: errMessage } = await this.props.get('/api/accessService/list')
      if (success) {
        data = map(data, item => ({
          label: `${item.serviceName}`,
          value: item.serviceId,
        }))
      } else {
        message.error('查询失败', errMessage)
        console.error('查询失败', errMessage)
      }
      this.setState({ serviceList: data })
    } catch (error: any) {
      message.error('查询失败', error)
      console.error('查询失败', error)
      this.setState({ serviceList: [] })
    }
  }

  // 模版信息编辑时调用
  onChangeTempInfo(tag: any, v: any) {
    let { onChangeTempInfo } = this.props;
    onChangeTempInfo(tag, v);
  }

  rendeTemplateInfo = () => {
    let { basicData = {}, identity } = this.props;
    let initialValues = cloneDeep(basicData)
    initialValues.isShared = !!initialValues.isShared
    let { serviceList } = this.state;
    return (
      <Form ref={this.formRef} initialValues={initialValues} className="template-form">
        <Form.Item label="模版名称" name="name" rules={[{ required: true, message: '请输入模版名!' }]} >
          <Input />
        </Form.Item>
        {
          (identity === 1 || identity === 2) && (
            <>
              <Form.Item label="服务名称" name="serviceId">
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
      </Form>
    )
  }

  renderDrawingBoardConfig = () => {
    const { height, width } = this.props.drawData;
    return (
      <div className="board-config-container">
        <div className="title">画板设置</div>
        <div className="board-config">
          <div className="label">画板宽高</div>
          <Tooltip title="画板宽度">
            <InputNumber precision={0} step={2} onChange={v => this.onBoardChange(v, 'width')} value={width} formatter={value => `${value}px`} parser={(value: any) => value.replace('px', '')} />
          </Tooltip>
          &nbsp;&nbsp;
          <Tooltip title="画板高度">
            <InputNumber precision={0} step={2} onChange={v => this.onBoardChange(v, 'height')} value={height} formatter={value => `${value}px`} parser={(value: any) => value.replace('px', '')} />
          </Tooltip>
        </div>
      </div>
    )
  }

  render() {
    let { isCanvasClicked, identity, drawData } = this.props;
    let { selectedElement } = this.state
    const { drawType } = selectedElement
    return (
      <div className="config-menu-container">
        <div className={classnames({ hidden: !!isCanvasClicked })}>
          <Tabs defaultActiveKey="1" type="card" size="small">
            <TabPane tab="模板信息" key="1">
              {this.rendeTemplateInfo()}
              {this.renderDrawingBoardConfig()}
            </TabPane>
          </Tabs>
        </div>
        {
          isCanvasClicked && typeof drawType === 'undefined' && (
            <div className="default-tip">请先添加或选中元素</div>
          )
        }
        {
          isCanvasClicked && typeof drawType !== 'undefined' && (
            <Tabs defaultActiveKey="1" type="card" size="small">
              <TabPane tab="样式配置" key="1">
                <div className="setting-wrap">
                  <StyleConfigContext.Provider
                    value={{
                      selectedElement,
                      onInfoChange: this.onInfoChange,
                      onMultiInfoChange:this.onMultiInfoChange
                    }}
                  >
                    <StyleConfig />
                  </StyleConfigContext.Provider>
                </div>
              </TabPane>
              {
                // 开发配置，身份为RD或PM
                (identity === 1 || identity === 2) && (
                  <TabPane tab="开发配置" key="2">
                    <div className="editor-item-engineer">
                      <AdvancedConfigContext.Provider
                        value={{
                          selectedElement,
                          drawData,
                          onInfoChange: this.onInfoChange,
                          onMultiInfoChange:this.onMultiInfoChange
                        }}
                      >
                        <AdvancedConfig/>
                      </AdvancedConfigContext.Provider>
                    </div>
                  </TabPane>
                )
              }
            </Tabs>
          )
        }
      </div>
    )
  }
}
export default connect(bindState, bindActions(), null, { forwardRef: true })(ConfigMenu as any)
