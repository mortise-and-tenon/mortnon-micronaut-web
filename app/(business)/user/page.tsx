"use client";

import { Layout, Table, Breadcrumb } from "@douyinfe/semi-ui";
import { IconHome, IconDesktop,IconUser } from "@douyinfe/semi-icons";

import NavHeader from "@/app/_modules/navHeader";
import NavSider from "@/app/_modules/navSider";

import "../style.css";

const { Content } = Layout;

const columns = [
  {
    title: "标题",
    dataIndex: "name",
  },
  {
    title: "大小",
    dataIndex: "size",
  },
  {
    title: "所有者",
    dataIndex: "owner",
  },
  {
    title: "更新日期",
    dataIndex: "updateTime",
  },
];
const data = [
  {
    key: "1",
    name: "Semi Design 设计稿.fig",
    nameIconSrc:
      "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/figma-icon.png",
    size: "2M",
    owner: "姜鹏志",
    updateTime: "2020-02-02 05:13",
    avatarBg: "grey",
  },
  {
    key: "2",
    name: "Semi Design 分享演示文稿",
    nameIconSrc:
      "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png",
    size: "2M",
    owner: "郝宣",
    updateTime: "2020-01-17 05:31",
    avatarBg: "red",
  },
  {
    key: "3",
    name: "设计文档",
    nameIconSrc:
      "https://lf3-static.bytednsdoc.com/obj/eden-cn/ptlz_zlp/ljhwZthlaukjlkulzlp/docs-icon.png",
    size: "34KB",
    owner: "Zoey Edwards",
    updateTime: "2020-01-26 11:01",
    avatarBg: "light-blue",
  },
];

export default function User() {
  return (
    <Layout className="layout-almost-full-screen">
      <NavHeader selectedKey="system" />
      <Content className="content">
        <NavSider selectedKey="user" />
        <div>
          <Breadcrumb>
            <Breadcrumb.Item
              icon={<IconDesktop size="small" />}
            ></Breadcrumb.Item>
            <Breadcrumb.Item icon={<IconUser size="small" />}>
              系统管理
            </Breadcrumb.Item>
            <Breadcrumb.Item>用户管理</Breadcrumb.Item>
          </Breadcrumb>

          <Table
            className="main-content"
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        </div>
      </Content>
    </Layout>
  );
}
