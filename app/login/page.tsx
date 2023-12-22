"use client";
import React,{useState} from "react";
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

import { useRouter } from "@/node_modules/next/navigation";

import "./style.css";


export default function Login() {
  const router = useRouter();

  const onFinish = async (values) => {
    const { username, password } = values;
    const reqData = { username, password };
    try {
      const response = await fetch("http://localhost:8080/login/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("success:", data);
        router.push('/');
      } else {
        const data = await response.json();
        console.log("fail:", data);
      }
    } catch (error) {
      console.error("error:", error);
    }
  };

  return (
    <Layout className="layoutStyle">
      <Header className="headerStyle">Header</Header>
      <Content className="contentStyle">
        <div className="formSytle">
          <Divider>登录</Divider>
          <Form name="login" className="login-form" onFinish={onFinish}>
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
            <Form.Item className="loginBtnSytle">
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
      <Footer className="footerStyle">©2023 Mortnon.</Footer>
    </Layout>
  );
}
