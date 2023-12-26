"use client";
import React from "react";
import Image from "next/image";
import { Layout, Menu, theme,MenuProps,Avatar  } from "antd";
import { HomeOutlined, SettingOutlined,UserOutlined  } from '@ant-design/icons';
import Link from "next/link";
const { Header, Content } = Layout;

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

export default function Home() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="layout-full-screen">
      <Header
        className="main-header"
      >
        <Image src="/clover.png" alt="Logo" width={48} height={48} />
        <Menu
          mode="horizontal"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
          theme="light"
        />
        <Avatar icon={<UserOutlined />} />
      </Header>
      <Content>Dashbord</Content>
    </Layout>
  );
}
