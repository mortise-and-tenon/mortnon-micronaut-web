"use client";
import React from "react";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import {
  Form,
  Button,
  Input,
  Space,
  Divider,
  Row,
  Col,
  Layout,
  Flex,
} from "antd";

const { Header, Footer, Sider, Content } = Layout;

import './style.css'

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 64,
  paddingInline: 48,
  lineHeight: "64px",
  backgroundColor: "#4096ff",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#fff",
  backgroundColor: "#4096ff",
};

/**
 * 登录页全屏
 */
const layoutStyle: React.CSSProperties = {
  minHeight: "100vh",
};

/**
 * 登录表单靠右，纵向居中
 */
const contentStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-end',
};

/**
 * 登录表单和 Divider 控制展示宽度，并整体靠右
 */
const formSytle : React.CSSProperties = {
  width: '40%',
  minWidth: '100px',
  maxWidth: '300px',
  textAlign: 'right',
  marginRight: '10%',
}

/**
 * 登录按钮靠左
 */
const loginBtnSytle : React.CSSProperties = {
  width: '40%',
  textAlign: 'right',
  marginRight: '16px',
}

export default function Login() {
  return (
    <Layout className="layoutStyle">
      <Header className="headerStyle">Header</Header>
      <Content className="contentStyle">
        <div className="formSytle">
         <Divider>登录</Divider>
          <Form name="login" className="login-form">
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="用户名"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="密码"
              />
            </Form.Item>
            <Form.Item  className="loginBtnSytle">
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          </div>
      </Content>
      <Footer style={footerStyle}>©2023 Mortnon.</Footer>
    </Layout>
  );
}
