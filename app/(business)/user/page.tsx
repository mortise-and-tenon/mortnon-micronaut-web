"use client";
import React from "react";

import { Breadcrumb, Layout, Menu, theme, MenuProps, Avatar } from "antd";
import {
  LaptopOutlined,
  NotificationOutlined,
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
} from "@ant-design/icons";

import Image from "next/image";

import Link from "next/link";

import NavHeader from "@/app/components/navHeader";

const { Content, Sider } = Layout;

const menuSider: MenuProps["items"] = [
  { key: "user", label: "用户管理", icon: <UserOutlined /> },
  { key: "role", label: "角色管理", icon: <UserOutlined /> },
  { key: "org", label: "组织管理", icon: <UserOutlined /> },
  { key: "menu", label: "菜单管理", icon: <UserOutlined /> },
  { key: "log", label: "日志管理", icon: <UserOutlined /> },
];

export default function User() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="layout-full-screen">
      <NavHeader />
      <Layout>
        <Sider width={200} style={{ background: "gray" }}>
          <Menu
            mode="inline"
            style={{ height: "100%", borderRight: 0 }}
            items={menuSider}
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
