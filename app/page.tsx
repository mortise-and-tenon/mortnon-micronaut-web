'use client';
import React from 'react';
import { Breadcrumb, Layout, Menu, theme } from 'antd';

const { Header, Content, Footer } = Layout;

class MenuItem {
  constructor(public key: string,public label:string){}
}

const items = new Array(new MenuItem('dashbord','首页'),new MenuItem('sys','系统管理'))

export default function Home() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="layout-full-screen">
    <Header style={{ display: 'flex', alignItems: 'center' }} className="main-header">
      <div className="demo-logo" />
      <Menu
        mode="horizontal"
        defaultSelectedKeys={['1']}
        items={items}
        style={{ flex: 1, minWidth: 0 }}
        theme="light"
      />
    </Header>
    <Content style={{ padding: '0 48px' }}>
      Dashbord
    </Content>
  </Layout>
  );
}
