"use client";
import React from "react";

import { Breadcrumb, Layout, Menu, theme,MenuProps,Avatar } from "antd";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,HomeOutlined, SettingOutlined
} from "@ant-design/icons";

import Image from "next/image";

import Link from "next/link";

const { Header, Content, Sider } = Layout;

const items1: MenuProps["items"] = ["1", "2", "3"].map((key) => ({
  key,
  label: `nav ${key}`,
}));

const items2: MenuProps["items"] = [
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
].map((icon, index) => {
  const key = String(index + 1);

  return {
    key: `sub${key}`,
    icon: React.createElement(icon),
    label: `subnav ${key}`,

    children: new Array(4).fill(null).map((_, j) => {
      const subKey = index * 4 + j + 1;
      return {
        key: subKey,
        label: `option${subKey}`,
      };
    }),
  };
});

const menuItems:MenuProps = [
  {
    key: 'dashboard',
    label: (<Link href="/">首页</Link>),
    icon: <HomeOutlined/>
  },
  {
    key: 'sys',
    label: (<Link href="/user">系统管理</Link>),
    icon: <SettingOutlined/>
  }
]

export default function User() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="layout-full-screen">
      <Header className="main-header">
      <Image src="/clover.png" alt="Logo" width={48} height={48} />
        <Menu
          mode="horizontal"
          defaultSelectedKeys={["sys"]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Avatar icon={<UserOutlined />} />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: "gray" }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
          />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            User
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
