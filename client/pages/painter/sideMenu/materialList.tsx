import * as React from 'react'
import { connect } from 'react-redux'
import { bindActions, bindState } from '@/lib/redux'
import { message, Input, Button, Modal, Dropdown, Menu, Empty } from 'antd'
import { MoreOutlined, CopyOutlined, DeleteOutlined, WarningOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import classnames from 'classnames'
import Uploader from '@/components/uploader'
import breviary from '@/assets/images/breviary.png'

const MenuItem = Menu.Item

 class MaterialList extends React.Component<any, any> {
  initPageNum: number;
  materialPageSize: number;
  boxRef: React.RefObject<any>;
  constructor(props) {
    super(props)
    this.state = {
      materialList: [],
      materialPage: 1,
      channelId: 0,
      keywords: '',
      ownMaterialList: [],
      materialVisible: false,
      uploadList: [],
      materialKey: 0,
      finishedList: [],
    }
    this.initPageNum = 1;
    this.materialPageSize = 20
    this.boxRef = React.createRef()
  }

  componentDidMount = () => {
    this.refreshMaterialList();
    this.getOwnMaterialList();
  }

  getOwnMaterialList = async () => {
    const { get } = this.props;
    const res = await get('/api/userCenter/material')
    if (res.success) {
      const { data } = res;
      this.setState({
        ownMaterialList: data,
      })
    }
  }

  onImageLoaded = e => {
    let { naturalWidth, naturalHeight, width } = e.target
    let height = (width / naturalWidth) * naturalHeight
    let row = height / 25
    e.target.parentElement.style['grid-row-end'] = `span ${Math.round(row)}`
  }

  handleListenScroll = () => {
    const box = this.boxRef.current;
    const { scrollHeight, scrollTop, clientHeight } = box;
    const { materialPage, maxMaterialPageNum } = this.state;
    if (scrollHeight === scrollTop + clientHeight && materialPage < maxMaterialPageNum) {
      this.setState(state => {
        state.materialPage++
      }, () => {
        this.fetchMaterial(this.state.materialPage).then(data => {
          this.setState(state => ({
            materialList: state.materialList.concat(data),
          }))
        });
      })
    }
  }

  fetchMaterial = async pageNum => {
    const { keywords, channelId } = this.state;
    try {
      const options = { pageSize: this.materialPageSize, keywords, channelId, pageNum, showLoading: true }
      let { success, data = {}, message: errorMessage } = await this.props.post('/proxy/design/api/queryResourceListByPage', options);
      if (!success) {
        message.error('查询失败', errorMessage)
        console.error('查询失败', errorMessage)
      }
      let maxMaterialPageNum = Math.ceil(data.total / this.materialPageSize);
      this.setState({
        maxMaterialPageNum,
      })
      return data.list;
    } catch (error) {
      message.error('查询失败', error)
      console.error('查询失败', error)
    }
  }

  refreshMaterialList = () => {
    this.fetchMaterial(this.initPageNum).then(data => {
      this.setState({
        materialList: data,
        materialPage: 1,
      })
    });
  }

  handleMaterialSearch = () => {
    this.refreshMaterialList();
  }

  onUploadSuccess = async ({ url, fileName }) => {
    const { post } = this.props;
    const insertRes = await post('/api/material/add', { imgUrl: url, fileName })
    if (insertRes.success) {
      this.getOwnMaterialList();
    }
  }

  delMaterial = imgInfo => {
    if (!imgInfo || !imgInfo.id) {
      return message.warn('操作失败')
    }
    Modal.confirm({
      icon: <WarningOutlined />,
      content: '确定要删除吗',
      okText: '确认',
      onOk: async () => {
        const { post } = this.props;
        const res = await post('/api/material/delete', { id: imgInfo.id })
        if (res.success) {
          message.success('操作成功')
          this.getOwnMaterialList()
        } else {
          message.warn('操作失败')
        }
      },
      cancelText: '取消',
    });
  }

  setMenu = imgInfo => (
    <Menu>
      <CopyToClipboard text={imgInfo.coverUrl} onCopy={() => message.success('复制成功')}>
        <MenuItem>
          <>
            <CopyOutlined />
            复制链接
          </>
        </MenuItem>
      </CopyToClipboard>
      <MenuItem onClick={() => this.delMaterial(imgInfo)}>
        <DeleteOutlined />
        删除
      </MenuItem>
    </Menu>
  )

  changeMaterialType = val => {
    this.setState({
      materialKey: val,
    })
  }

  resetKeyWords = () => {
    this.setState({
      keywords: '',
    }, this.handleMaterialSearch)
  }

  render() {
    const { handleClick } = this.props
    const {
      keywords,
      materialKey,
      materialList = [],
      ownMaterialList,
    } = this.state
    return (
      <div className="material-list">
        <div className="tab-bar">
          <div className={classnames('tabpane-bar', { active: materialKey === 0 })} onClick={() => this.setState({ materialKey: 0 })}>在线素材</div>
          <div className={classnames('tabpane-bar', { active: materialKey === 1 })} onClick={() => this.setState({ materialKey: 1 })}>我的素材</div>
        </div>
        {
          materialKey === 0
          && (
            <>
              <div className="search-bar">
                <span className="all-tag" onClick={this.resetKeyWords}>全部</span>
                <Input placeholder="搜索素材" value={keywords} onChange={e => this.setState({ keywords: e.target.value })} className="search-input" />
                <Button type="primary" icon={<SearchOutlined />} onClick={this.handleMaterialSearch} className="search-btn" />
              </div>

              { materialList.length > 0 ? (
                <div className="content-wrap" onScroll={this.handleListenScroll} ref={this.boxRef}>
                  {materialList.map(item => (
                    <div className="grid-item" key={item.id} onClick={handleClick}>
                      <img className="img" src={item.cover || breviary} alt="" onLoad={this.onImageLoaded} />
                    </div>
                  ),
                  )}
                </div>
              ) : <Empty className="empty" description="这里空空如也～什么也没有" />}
            </>
          )
        }
        {
          materialKey === 1 && (
            <>
              <div className="content-wrap no-header" onScroll={this.handleListenScroll} ref={this.boxRef}>
                <Uploader onSuccess={this.onUploadSuccess} btnClass="grid-item upload-card">
                  <>
                    <div className="upload-card-btn"><PlusOutlined className="upload-card-icon" /></div>
                    <div className="upload-card-text">上传素材</div>
                  </>
                </Uploader>
                {ownMaterialList.map(item => (
                  <div className="grid-item" key={item.id}>
                    <img className="img" src={item.coverUrl || breviary} alt={item.coverUrl} onClick={handleClick} onLoad={this.onImageLoaded} />
                    <span className="material-container-owns-content-list-item-icons">
                      <Dropdown overlay={() => this.setMenu(item)} placement="bottomRight" trigger={['click']}>
                        <MoreOutlined
                          className="icon-more icon-opt"
                          rotate={90}
                        />
                      </Dropdown>
                    </span>
                  </div>
                ),
                )}
              </div>
            </>
          )
        }
      </div>
    )
  }
}

export default connect(bindState, bindActions())(MaterialList)