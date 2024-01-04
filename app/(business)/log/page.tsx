"use client";
import { Layout, Breadcrumb, Card, Table } from "@douyinfe/semi-ui";

import NavHeader from "@/app/_modules/navHeader";
import NavSider from "@/app/_modules/navSider";

import "../style.css";

const { Content } = Layout;

export default function Log() {

    //表格列定义
    const columns = [
      {
        title: "用户名",
        dataIndex: "userName",
      },
      {
        title: "IP",
        dataIndex: "ip",
      },
      {
        title: "操作",
        dataIndex: "action",
      },
      {
        title: "级别",
        dataIndex: "level",
      },
      {
        title: "操作时间",
        dataIndex: "time",
      },
    ];


  return (
    <Layout className="layout-almost-full-screen">
      <NavHeader selectedKey="system" />
      <Content className="content">
        <NavSider selectedKey="log" />
        <Layout>
          <Breadcrumb className="bread-style">
            <Breadcrumb.Item noLink={true}>系统管理</Breadcrumb.Item>
            <Breadcrumb.Item noLink={true}>用户管理</Breadcrumb.Item>
          </Breadcrumb>
          <Card className="card-style">
            <div className="action-style"></div>
            <Table columns={columns} />
          </Card>
        </Layout>
      </Content>
    </Layout>
  );
}
