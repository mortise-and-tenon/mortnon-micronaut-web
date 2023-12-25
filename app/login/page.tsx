"use client";
import React, { useState } from "react";
import Image from "next/image";
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
  Alert,
  Spin
} from "antd";

const { Header, Footer, Sider, Content } = Layout;

import { useRouter } from "@/node_modules/next/navigation";

import "./style.css";

export default function Login() {
  const router = useRouter();

  //是否等待加载中
  const [isLoading, setIsLoading] = useState(false);

  const [loginFailMsg, setLoginFailMsg] = useState("");
  const [loginFail, setLoginFail] = useState(false);

  //表单提交执行逻辑
  const onFinish = async (values) => {
    setIsLoading(true);

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
        router.push("/");
      } else {
        setLoginFail(true);
        const data = await response.json();
        //TODO:前端有一个错误码和国际化文字的对应关系，用错误码对应的文字显示
        setLoginFailMsg(data.message);
      }
    } catch (error) {
      setLoginFail(true);
      setLoginFailMsg("登录发生异常，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  //登录按钮绑定回车
  const handleSubmit = (event) => {
    if (event.key === "Enter") {
      // 表单提交
      event.target.form.submit();
    }
  };

  return (
    <Layout className="layout-almost-full-screen background-style">
      <Header className="headerStyle">
        <Image src="/clover.png" alt="Logo" width={50} height={50}/>
        <h1 className="title-style">Monrton 管理系统</h1>
      </Header>
      <Content className="contentStyle">
        <div className="formSytle">
          <Divider>登录</Divider>
          {loginFail && (
            <Alert
              message={loginFailMsg}
              type="error"
              className="alert-style"
            />
          )}
          <Spin spinning={isLoading}>
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
                  onKeyDown={handleSubmit}
                  
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </Content>
      <Footer className="footer-style">©2023 Mortnon.</Footer>
    </Layout>
  );
}
