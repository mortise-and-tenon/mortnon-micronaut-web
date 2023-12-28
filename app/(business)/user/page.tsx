"use client";

import { Layout } from "@douyinfe/semi-ui";

import NavHeader from '@/app/_modules/navHeader';
import NavSider from '@/app/_modules/navSider';

import "../style.css";

const { Content } = Layout;

export default function User() {
  
  return (
    <Layout className="layout-almost-full-screen">
      <NavHeader selectedKey="system" />
      <Content className="content">
        <NavSider selectedKey="user"/>
      </Content>
    </Layout>
  );
}
