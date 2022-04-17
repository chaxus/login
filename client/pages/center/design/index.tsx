/*
 * @Author: your name
 * @Date: 2022-02-20 15:06:41
 * @LastEditTime: 2022-02-28 23:40:59
 * @LastEditors: Please set LastEditors
 */
import React, { useState } from "react";
import { Menu, Dropdown, Button, Modal, message, Input } from "antd";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useSelector, useDispatch, connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MoreOutlined,
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { bindActions, bindState } from '@/lib/redux'
import addIcon from "@/assets/svgs/add-icon.svg"
import defect from "@/assets/svgs/defect.svg"

const MenuItem = Menu.Item;

type Props = {
  get: Function,
  [k: string]: any
}

const Design = ({ get, post, history }: Props) => {
  const navigate = useNavigate();
  const [state, setState] = useState<any>({
    curPicInfo: {},
    previewVisible: false,
    templateList: [],
    verticalPosterArr: [],
    horizontalPosterArr: [],
  });
  const getDesigns = async () => {
    // const { get } = this.props;
    const res = await get("/api/userCenter/template");
    if (res.success) {
      const { data = [] } = res;
      const verticalPosterArr: any = [];
      const horizontalPosterArr: any = [];
      data.forEach((item: { content: string }) => {
        const { width, height } = JSON.parse(item.content);
        if (height > width) {
          verticalPosterArr.push(item);
        } else {
          horizontalPosterArr.push(item);
        }
      });
      setState({
        ...state,
        verticalPosterArr,
        horizontalPosterArr,
      });
    } else {
      const { error } = res;
      message.warn(error.message);
    }
  };

  const previewPic = (e: { stopPropagation: () => void }, picInfo: any) => {
    e.stopPropagation();
    setState({
      ...state,
      curPicInfo: picInfo,
      previewVisible: true,
    });
  };

  const closePreviewModal = () => {
    setState({
      ...state,
      previewVisible: false,
    });
  };

  const setMenu = (tplInfo: { image: any }) => (
    <Menu>
      <CopyToClipboard
        text={tplInfo.image}
        onCopy={() => message.success("复制成功")}
      >
        <MenuItem>
          <>
            <CopyOutlined />
            复制链接
          </>
        </MenuItem>
      </CopyToClipboard>
      {/* <MenuItem>
              <DeleteOutlined />
              删除
            </MenuItem> */}
    </Menu>
  );

  const handleTime = (time: string | number | Date) => {
    const now = Date.now();
    const m = 1000 * 60;
    const h = m * 60;
    const d = h * 24;
    const month = d * 30;
    const cur = new Date(time).getTime();
    const diff = now - cur;
    const monthC: any = diff / month;
    const weekC: any = diff / (7 * d);
    const dayC: any = diff / d;
    const hC: any = diff / h;
    const mC: any = diff / m;
    if (monthC > 12) {
      const yy = new Date(time).getFullYear();
      const mm = new Date(time).getMonth() + 1;
      const dd = new Date(time).getDate();
      return `${yy}-${mm}-${dd}`;
    }
    if (monthC >= 1) {
      return `${parseInt(monthC, 10)}个月前`;
    }
    if (weekC >= 1) {
      return `${parseInt(weekC, 10)}星期前`;
    }
    if (dayC >= 1) {
      return `${parseInt(dayC, 10)}天前`;
    }
    if (hC >= 1) {
      return `${parseInt(hC, 10)}小时前`;
    }
    if (mC >= 1) {
      return `${parseInt(mC, 10)}分钟前`;
    }
    return "刚刚";
  };

  const saveTplName = async (
    e: { target: { value: any } },
    { id, index }: any
  ) => {
    const val = e.target.value;
    const res = await post("/api/template/update", { name: val, id });
    if (res.success) {
      message.success("修改成功");
      getDesigns();
    } else {
      console.log(res.message);
      message.warn("操作失败");
    }
    toggleEdit("editVisible", index);
  };

  const toggleEdit = (name: string | number, index: number) => {
    const { templateList } = state;
    const curTpl = templateList[index];
    const newTpl = { ...curTpl, [name]: !curTpl[name] };
    templateList[index] = newTpl;
    setState({
      ...state,
      templateList,
    });
  };

  const splitNameWithDot = (str: string, len: number) => {
    if (!str) return "";
    const realLen = (s: any) => s.replace(/[^\x00-\xff]/g, "**").length;
    if (realLen(str) <= len) return str;
    const m = Math.floor(len / 2);
    for (let i = m; i < str.length; i++) {
      const cur = str.slice(0, i);
      if (realLen(cur) >= len) {
        return `${cur}...`;
      }
    }
    return str;
  };

  const onEditorPoster = (id?: any) => {
    const search = id ? `?templateId=${id}` : null;
    navigate("/painter", { replace: true, state: search })
    // history.push({ pathname: "/painter", search, from: "userCenter" });
  };
  const { verticalPosterArr } = state
  return (
    <div className="user-center-design-container">
      <section className="design-container-owns">
        <div className="poster-content-label">海报数据</div>
        <div className="poster-analytic-data"></div>
      </section>
      <section className="design-container-owns">
        <div className="poster-content-label">我的海报</div>
        <div className="design-container-owns-content">
          <div
            className="create-new-poster-template"
            onClick={() => onEditorPoster()}
          >
            <img
              className="create-img"
              src={addIcon}
            />
            <div className="create-text">创建海报</div>
          </div>
          {verticalPosterArr.map((item: any) => {
            const { width, height } = JSON.parse(item.content);
            return (
              <div
                key={item.id}
                className="poster-card-item-vertical"
                onClick={() => onEditorPoster(item.id)}
              >
                {item.image ? (
                  <div
                    style={{ backgroundImage: `url(${item.image})` }}
                    className="poster-image-item"
                  />
                ) : (
                  <div className="no-content">
                    <img src={defect} />
                    <div className="no-content-text">暂无缩略图</div>
                  </div>
                )}
                <div className="poster-info-container">
                  <div className="unactive-container">
                    <div className="poster-template-name">{item.name}</div>
                  </div>
                  <div className="active-container">
                    <div className="poster-template-name">
                      模版尺寸：{width} * {height}
                    </div>
                    <div className="poster-template-name">
                      创建时间：{dayjs(item.createTime).format("YYYY-MM-DD")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* {
        horizontalPosterArr.map(item => (
          <div key={item.id} className="poster-card-item-horizontal" onClick={() => this.onEditorPoster(item)}>
            <div style={{ backgroundImage: `url(${item.image})` }} className="poster-image-item"/>
            <div className='poster-info-container'></div>
          </div>
        ))
      } */}
        </div>
      </section>
    </div>
  );
};
export default connect(bindState, bindActions())(Design)

