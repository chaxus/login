import * as React from 'react'
import { map, cloneDeep, find } from 'lodash'
import { Chart, Axis, Tooltip, Slider, Coordinate, DonutChart, Interaction, Geom } from 'bizcharts'
import { message, Form, Input, Menu, Dropdown, Select, Statistic, DatePicker } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import SearchForm from '@/components/searchForm';
import SearchInput from '@/components/searchInput';
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { get } from '@/lib/request';
const { RangePicker } = DatePicker;
const { Option } = Select;

dayjs.extend(isoWeek);
const today = dayjs(); // 今天
const weekStartDate = dayjs().startOf('isoWeek') // 本周第一天
const weekEndDate = dayjs().endOf('isoWeek'); // 本周最后一天
const lastWeekStartDate = weekStartDate.subtract(7, 'day'); // 上周第一天
const monthStartDate = dayjs().startOf('month'); // 本月第一天
const monthEndDate = dayjs().endOf('month');// 本月最后一天
const lastMonthStartDate = monthStartDate.subtract(1, 'month');// 上月第一天
const yearStartDate = dayjs().startOf('year'); // 本年第一天
const yearEndDate = dayjs().endOf('year');// 本年最后一天
const lastYearStartDate = yearStartDate.subtract(1, 'year');// 去年第一天

function formatDate(date: dayjs.Dayjs): string {
  return date.format('YYYY-MM-DD')
}
function CustomTooltip(props: any) {
  const { title, items, isSorted, children } = props;
  if (isSorted) {
    items.sort((v1, v2) => Number(v2.value) - Number(v1.value))
  }
  return (
    <div className="custom-tooltip">
      <div className="custom-tooltip-title">{title}</div>
      {items.map(item => (
        <div className="custom-tooltip-content" key={item.name}>
          <div className="custom-tooltip-content-title">
            <span className="custom-tooltip-content-color" style={{ backgroundColor: item.color }} />
            <span className="custom-tooltip-content-name">
              {item.name}
              :
            </span>
          </div>
          <span className="custom-tooltip-content-value">{item.value}</span>
        </div>
      ))}
      <div className="custom-tooltip-footer">
        {children}
      </div>
    </div>
  )
}
export default class Dashboard extends React.Component<any, any> {
  timer: any
  g2Ins1: any
  g2Ins2: any
  constructor(props) {
    super(props)
    this.state = {
      minutelyData: [],
      hourlyData: [],
      dailyData: [],
      serviceList: [],
      queryData: [],
      dailyDataDateRange: '',
      top10: [],
      top10DataDateRange: '',
      templateCountData: [], // 各模版生成数量
      weeklyTemplateDailyCountData: [], // 近七天各模版生成情况
      someDay: '', // 每天中选中的某一天
      someHour: '', // 某一天选中的某一个小时
      statsData: {}, // 指标卡数据
    }
    this.timer = null
  }

  componentDidMount() {
    this.refreshAllCharts()
    this.fetchService()
    this.timer = setInterval(() => {
      if (!this.state.someHour) {
        this.getMinutelyCount()
      }
    }, 30 * 1000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  fetchService = async () => {
    try {
      let { success, data = [], message } = await get('/api/accessService/list')
      if (success) {
        data = map(data, item => ({
          label: item.serviceName,
          value: item.serviceId,
        }))
      } else {
        message.error('查询失败', message)
        console.error('查询失败', message)
      }
      this.setState({ serviceList: data })
    } catch (error) {
      message.error('查询失败', error)
      console.error('查询失败', error)
      this.setState({ serviceList: [] })
    }
  }

  getStats = async () => {
    try {
      let queryData = cloneDeep(this.state.queryData)
      let { createTime } = queryData
      if (createTime) {
        queryData.createTimeStart = dayjs(createTime[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        queryData.createTimeEnd = dayjs(createTime[1]).startOf('day').format('YYYY-MM-DD HH:mm:ss')
        delete queryData.createTime
      }
      const res = await get('/api/dashboard/stats', queryData, { hideLoading: true })
      let { success, data } = res
      if (success) {
        this.setState({
          statsData: data,
        })
      } else {
        message.error(`查询失败: ${res.message}`)
      }
    } catch (error) {
      console.error(error)
      message.error(`查询失败: ${error}`)
    }
  }

  getMinutelyCount = async () => {
    let { someHour } = this.state
    try {
      let timestamp;
      if (someHour === '') {
        timestamp = Date.now() - 60 * 60 * 1000;
      } else {
        timestamp = someHour;
      }
      let lastHourCountTimes = Array.from({ length: 60 }, (v, index) => index * 60 * 1000 + timestamp).map(t => {
        let time = new Date(t)
        return `${(`0${time.getHours()}`).slice(-2)}:${(`0${time.getMinutes()}`).slice(-2)}`
      })
      const res = await get('/api/dashboard/minutelyStats', { someHour })
      let { success, data } = res
      if (success) {
        data = lastHourCountTimes.map(t => {
          let item = find(data, item => item.time === t)
          return {
            time: t,
            count: item ? item.count : 0,
          }
        })
        this.setState({
          minutelyData: data,
        })
      } else {
        this.setState({
          minutelyData: lastHourCountTimes.map(t => ({
            time: t,
            count: 0,
          })),
        })
        message.error(`查询失败: ${res.message}`)
      }
    } catch (error) {
      console.error(error)
      message.error(`查询失败: ${error}`)
    }
  }

  getHourlyCount = async () => {
    let { someDay } = this.state
    try {
      const res = await get('/api/dashboard/hourlyStats', { someDay })
      let { success, data } = res
      if (success) {
        this.setState({
          hourlyData: data.map(item => ({
            ...item,
            time: item.time.replace(/(\d{2})-(\d{2}) (\d{2})/, '$3时'),
          })),
        })
      } else {
        this.setState({
          hourlyData: [],
        })
        message.error(`查询失败: ${res.message}`)
      }
    } catch (error) {
      console.error(error)
      message.error(`查询失败: ${error}`)
    }
  }

  getDailyCount = async () => {
    let { dailyDataDateRange } = this.state
    try {
      const res = await get('/api/dashboard/dailyStats', dailyDataDateRange)
      let { success, data } = res
      if (success) {
        this.setState({
          dailyData: data,
        })
      } else {
        this.setState({
          dailyData: [],
        })
        message.error(`查询失败: ${res.message}`)
      }
    } catch (error) {
      console.error(error)
      message.error(`查询失败: ${error}`)
    }
  }

  getTemplateCount = async () => {
    try {
      const { top10DataDateRange } = this.state;
      const res = await get('/api/dashboard/templateStats', top10DataDateRange)
      let { success, data } = res
      if (success) {
        const top10 = data.slice(0, 10).reverse();
        this.setState({
          templateCountData: data,
          top10,
        })
      } else {
        this.setState({
          templateCountData: [],
        })
        message.error(`查询失败: ${res.message}`)
      }
    } catch (error) {
      console.error(error)
      message.error(`查询失败: ${error}`)
    }
  }

  getWeeklyTemplateDailyCount = async () => {
    try {
      const res = await get('/api/dashboard/weeklyTemplateStats')
      let { success, data } = res
      if (success) {
        this.setState({
          weeklyTemplateDailyCountData: data,
        })
      } else {
        this.setState({
          weeklyTemplateDailyCountData: [],
        })
        message.error(`查询失败: ${res.message}`)
      }
    } catch (error) {
      console.error(error)
      message.error(`查询失败: ${error}`)
    }
  }

  refreshAllCharts = () => {
    this.getStats()
    this.getMinutelyCount()
    this.getHourlyCount()
    this.getDailyCount()
    this.getTemplateCount();
    this.getWeeklyTemplateDailyCount();
  }

  handleSearch = values => {
    this.setState({
      queryData: values,
    }, this.getStats)
  }

  getTimeRange = val => {
    let from = '';
    let to = '';
    switch (val) {
      case '本周':
        {
          from = formatDate(weekStartDate);
          to = formatDate(weekEndDate);
          break;
        }
      case '上周':
        {
          from = formatDate(lastWeekStartDate);
          to = formatDate(lastWeekStartDate.endOf('isoWeek'));
          break;
        }
      case '本月':
        {
          from = formatDate(monthStartDate);
          to = formatDate(monthEndDate);
          break;
        }
      case '上月':
        {
          from = formatDate(lastMonthStartDate);
          to = formatDate(lastMonthStartDate.endOf('month'));
          break;
        }
      case '本年':
        {
          from = formatDate(yearStartDate);
          to = formatDate(yearEndDate);
          break;
        }
      case '去年':
        {
          from = formatDate(lastYearStartDate);
          to = formatDate(lastYearStartDate.endOf('year'));
          break;
        }
      case '近七天':
        {
          from = formatDate(today.subtract(7, 'day'));
          to = formatDate(today);
          break;
        }
      case '今天':
        {
          from = formatDate(today);
          to = formatDate(today);
          break;
        }
      default: {
        break;
      }
    }
    return { from, to };
  }

  onDateRangeChange = (tag, val, callbackName) => {
    const { from, to } = this.getTimeRange(val);
    if (from && to) {
      this.setState({
        [tag]: {
          from,
          to,
        },
      }, this[callbackName])
    } else {
      this.setState({
        [tag]: {},
      }, this[callbackName])
    }
  }

  checkoutSomeDayData = dateString => {
    let parseDate = dayjs(dateString, 'YYYYMMDD').startOf('day');
    const time = parseDate.valueOf();
    this.setState({
      someDay: time,
    }, this.getHourlyCount)
  }

  checkoutSomeHourData = hour => {
    const { someDay } = this.state;
    let day;
    if (someDay) {
      day = dayjs(someDay);
    } else {
      day = dayjs().startOf('day');
    }
    const time = day.hour(hour);
    const timestamp = +new Date(time);
    this.setState({
      someHour: timestamp,
    }, this.getMinutelyCount)
  }

  checkoutTodayData = (val, callbackName) => {
    this.setState({
      [val]: '',
    }, this[callbackName])
  }

  setMenu = (val, callbackName) => (
    <Menu>
      <Menu.Item>
        <span onClick={() => this.checkoutTodayData(val, callbackName)}>查看今日数据</span>
      </Menu.Item>
    </Menu>
  )

  renderStats = () => {
    let { statsData } = this.state
    let statsList = [
      {
        title: '海报请求总量',
        content: statsData.total,
      }, {
        title: '成功数量',
        content: statsData.successCount,
      }, {
        title: '失败数量',
        content: statsData.failureCount,
      },
      {
        title: '成功率',
        content: statsData.total ? `${((statsData.successCount / statsData.total) * 100).toFixed(4)}%` : '100%',
      },
    ]

    return (
      <div className="stats-container">
        <div className="poster-stats">
          {
            statsList.map(item => (
              <div className="stats-item" key={item.title}>
                <Statistic title={item.title} value={item.content} />
              </div>
            ))
          }
        </div>
      </div>
    )
  }

  render() {
    let { serviceList, minutelyData, hourlyData, dailyData, top10, templateCountData, weeklyTemplateDailyCountData, someDay, someHour } = this.state
    let flag = false;
    return (
      <div className="poster-stats-container">
        <div className="stats-search-container">
          <SearchForm handleSearch={this.handleSearch}>
            <Form.Item label="模版ID" name="templateId"><Input allowClear /></Form.Item>
            <Form.Item label="服务名" name="serviceId">
              <SearchInput options={serviceList} placeholder="输入服务名查找" style={{ width: 170 }} />
            </Form.Item>
            <Form.Item label="生成时间" name="createTime"><RangePicker /></Form.Item>
          </SearchForm>
        </div>
        {this.renderStats()}
        <div className="charts-container">
          <div className="charts-container-part">
            <div className="charts-container-part-horizontal">
              <div className="charts-container-part-title">
                <h4 className="chart-title">
                  海报生成量
                </h4>
                <div className="range-form">
                  <Select defaultValue="开始至今" bordered={false} onChange={val => this.onDateRangeChange('dailyDataDateRange', val, 'getDailyCount')}>
                    <Option value="近七天">近七天</Option>
                    <Option value="本周">本周</Option>
                    <Option value="上周">上周</Option>
                    <Option value="本月">本月</Option>
                    <Option value="上月">上月</Option>
                    <Option value="本年">本年</Option>
                    <Option value="去年">去年</Option>
                    <Option value="开始至今">开始至今</Option>
                  </Select>
                </div>
              </div>
              <div>
                <Chart
                  autoFit
                  className="poster-chart"
                  height={300}
                  data={dailyData}
                  scale={{
                    count: { min: 0, alias: '单日生成数' },
                    total: { min: 0, alias: '累计数' },
                  }}
                  onPlotClick={e => {
                    let { x, y } = e
                    let [toolTip = {}] = this.g2Ins1.getTooltipItems({ x, y })
                    this.checkoutSomeDayData(toolTip.title)
                  }}
                  onGetG2Instance={g2chart => {
                    this.g2Ins1 = g2chart
                  }}
                >
                  <Tooltip shared enterable>
                    {
                      (title, items) => {
                        let customTitle = dayjs(title, 'YYYYMMDD').format('YYYY年MM月DD日');
                        return (
                          <CustomTooltip title={customTitle} items={items}>
                            点击查看当天生成数据
                          </CustomTooltip>
                        );
                      }
                    }
                  </Tooltip>
                  <Axis name="count" title />
                  <Axis name="total" title />
                  <Geom type="interval" position="time*count" />
                  <Geom type="line" position="time*total" color="#ff0000" />
                  <Slider
                    start={0}
                    formatter={(v, d, i) => {
                      flag = !flag;
                      return `${v}${flag ? '开始' : '结束'}`;
                    }}
                  />
                </Chart>
              </div>
            </div>
            <div className="charts-container-part-inline">
              <div className="charts-container-part-inline-item">
                <div className="charts-container-part-title">
                  <h4 className="chart-title">
                    24小时海报生成量
                  </h4>
                  <div className="chart-option">
                    <Dropdown overlay={() => this.setMenu('someDay', 'getHourlyCount')} placement="bottomRight">
                      <MoreOutlined rotate={90} className="chart-option-icon" />
                    </Dropdown>
                  </div>
                </div>
                <div className="sub-title">
                  时间：
                  {someDay ? dayjs(someDay).format('YYYY年MM月DD日') : dayjs().format('YYYY年MM月DD日')}
                </div>
                <div>
                  <Chart
                    autoFit
                    className="poster-chart"
                    height={300}
                    data={hourlyData}
                    scale={{ count: { min: 0, alias: '生成数' } }}
                    onPlotClick={e => {
                      let { x, y } = e
                      let [toolTip = {}] = this.g2Ins2.getTooltipItems({ x, y })
                      this.checkoutSomeHourData(toolTip.title.slice(0, 2))
                    }}
                    onGetG2Instance={g2chart => {
                      this.g2Ins2 = g2chart
                    }}
                    label={{ autoHide: false, autoEllipsis: false }}
                  >
                    <Tooltip enterable shared>
                      {
                        (title, items) => (
                          <CustomTooltip title={title} items={items}>
                            点击查看该小时生成数据
                          </CustomTooltip>
                        )
                      }
                    </Tooltip>
                    <Axis name="count" title />
                    <Geom type="interval" position="time*count" />
                  </Chart>
                </div>
              </div>
              <div className="charts-container-part-inline-item">
                <div className="charts-container-part-title">
                  <h4 className="chart-title">
                    实时海报生成量
                  </h4>
                  <div className="chart-option">
                    <Dropdown overlay={() => this.setMenu('someHour', 'getMinutelyCount')} placement="bottomRight">
                      <MoreOutlined rotate={90} className="chart-option-icon" />
                    </Dropdown>
                  </div>
                </div>
                <div className="sub-title">
                  时间：
                  {someHour ? dayjs(someHour).format('YYYY年MM月DD日 HH时') : dayjs().format('YYYY年MM月DD日 最近1小时数据')}
                </div>
                <div className="chart-wrap">
                  <Chart
                    className="poster-chart"
                    autoFit
                    height={300}
                    data={minutelyData}
                    scale={{ count: { min: 0, alias: '生成数' } }}
                    label={{ autoHide: false, autoEllipsis: false }}
                  >
                    <Axis name="count" title />
                    <Geom type="interval" position="time*count" />
                  </Chart>
                </div>
              </div>

            </div>
          </div>
          <div className="charts-container-part-horizontal">
            <h4 className="chart-title">
              近七天各模版生成数量情况
            </h4>
            <div>
              <Chart
                className="poster-chart"
                height={400}
                padding="auto"
                data={weeklyTemplateDailyCountData}
                autoFit
                filter={[]}
              >
                <Geom
                  type="interval"
                  position="time*count"
                  adjust={[
                    {
                      type: 'dodge',
                      marginRatio: 0,
                    },
                  ]}
                  color="name" />
                <Tooltip shared>
                  {
                    (title, items) => <CustomTooltip isSorted={true} title={title} items={items} />
                  }
                </Tooltip>
                <Interaction type="active-region" />
              </Chart>
            </div>
          </div>
          <div className="charts-container-part">
            <div className="charts-container-part-horizontal">
              <div className="charts-container-part-title">
                <h4 className="chart-title">
                  模版生成情况
                </h4>
                <div className="range-form">
                  <div>
                    <Select defaultValue="开始至今" bordered={false} onChange={val => this.onDateRangeChange('top10DataDateRange', val, 'getTemplateCount')}>
                      <Option value="近七天">近七天</Option>
                      <Option value="今天">今天</Option>
                      <Option value="本周">本周</Option>
                      <Option value="上周">上周</Option>
                      <Option value="本月">本月</Option>
                      <Option value="上月">上月</Option>
                      <Option value="本年">本年</Option>
                      <Option value="去年">去年</Option>
                      <Option value="开始至今">开始至今</Option>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="charts-container-part-horizontal-charts">
                <div className="charts-container-part-horizontal-charts-inline">
                  <DonutChart
                    data={templateCountData}
                    forceFit
                    radius={0.8}
                    padding="auto"
                    angleField="count"
                    colorField="name"
                    legend={{ flipPage: true }}
                    label={{ visible: false }}
                    tooltip={{ visible: true }}
                  />
                </div>
                <div className="charts-container-part-horizontal-charts-inline">
                  <div>
                    <Chart height={400} data={top10} autoFit scale={{ count: { min: 0, alias: '生成数' } }}>
                      <Coordinate transpose />
                      <Geom type="interval" position="name*count" />
                    </Chart>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
