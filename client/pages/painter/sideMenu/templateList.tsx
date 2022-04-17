import * as React from 'react';
import { useState, useCallback } from 'react';
import { message, Tabs,Modal } from 'antd';
import { map } from 'lodash';
import { connect } from 'react-redux';
import { bindActions, bindState } from '@/lib/redux';
import ListView from '@/components/listView';
import breviary from '@/assets/images/breviary.png'

const { TabPane } = Tabs;

const DEFAULT_IMAGE = breviary;
const LIMIT = 20
let timesOfTemplateReplacement = 0;

const TemplateList = props => {
  const [templateList, setTemplateList] = useState<any[]>([])
  const [tabKey, setTabKey] = useState('1')
  const [query, setQuery] = useState<any>({ offset: 0 })
  const [total, setTotal] = useState(-1)
  const fetchTemplateList = async query => {
    try {
      let { success, data = [], paging = {}, error = {} } = await props.get('/api/template/list', { limit: LIMIT, ...query })
      if (!success) {
        message.error(`查询失败${error.message}`)
        console.error('查询失败', error.message)
      }
      return { data, paging }
    } catch (error) {
      message.error(`查询失败${error}`)
      console.error('查询失败', error)
      return { data: [], paging: {} }
    }
  }

  const loadTemplates = async () => {
    const { data, paging } = await fetchTemplateList(query)
    setQuery({
      ...query,
      offset: query.offset += LIMIT
    })
    setTotal(paging.total)
    setTemplateList([...templateList, ...data])
  }

  const beforeSelectTemplate= (id) => {
    timesOfTemplateReplacement++;
    if(timesOfTemplateReplacement===1){
      Modal.confirm({
        title:'提示',
        centered:true,
        content:'使用模版后，将会覆盖掉此画布上的所有现有内容哦~',
        onOk:() => selectTemplate(id),
      });
    }else{
      selectTemplate(id);
    }
  }

  const selectTemplate = async id => {
    try {
      const { success, data = {}, error } = await props.get('/api/template/detail', { id })
      const { content } = data
      if (success && content) {
        const drawData = JSON.parse(content);
        props.setSelectedElementId(-1)
        props.setDrawData(drawData)
      } else {
        message.error(`查询失败${error.message}`)
        console.error('查询失败', error.message)
      }
    } catch (error) {
      message.error(`查询失败${error}`)
      console.error('查询失败', error)
    }
  }

  const onSwitchTab = key => {
    if (parseInt(key) === 2) { // 我的模板
      const { userInfo } = window.__INITIAL_STATE__
      setQuery({
        offset: 0,
        createUserId: userInfo.email,
      })
    } else {
      setQuery({
        offset: 0,
      })
    }
    setTabKey(key)
    setTemplateList([])
    setTotal(-1)
  }

  const onImageLoaded = e => {
    const { naturalWidth, naturalHeight, width } = e.target
    const height = (width / naturalWidth) * naturalHeight
    const row = height / 25
    e.target.parentElement.style['grid-row-end'] = `span ${Math.round(row)}`
  }

  return <>
    <Tabs defaultActiveKey={tabKey} centered size="small" onChange={onSwitchTab}>
      <TabPane tab="在线模板" key="1" />
      <TabPane tab="我的模板" key="2" />
    </Tabs>
    <div className="list-view-container">
      <ListView load={loadTemplates} hasMore={total !== templateList.length}>
        <div className="template-list">
          {
            map(templateList, item => (
              <div className="template-item" key={item.id} onClick={() => beforeSelectTemplate(item.id)}>
                <img src={item.image || DEFAULT_IMAGE} onLoad={onImageLoaded} />
              </div>
            ))
          }
        </div>
      </ListView>
    </div>
  </>
}

export default connect(bindState, bindActions())(TemplateList)
