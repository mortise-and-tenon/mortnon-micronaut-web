"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Layout, Divider, Form, Button, Spin, Toast } from "@douyinfe/semi-ui";
import "./style.css";

const { Header, Footer, Content } = Layout;

export default function Login() {
  //是否登录中
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  //提交
  const onSubmit = async (values) => {
    setLoading(true);
    console.log(values);
    try {
      const response = await fetch("/api/login/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("success:", data);
        router.push("/");
      } else {
        const data = await response.json();
        //TODO:前端有一个错误码和国际化文字的对应关系，用错误码对应的文字显示
        Toast.warning(data.message);
      }
    } catch (error) {
      Toast.error("登录发生异常，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="layout-almost-full-screen background-style">
      <Header className="header-style">
        <Image src="/clover.png" alt="Logo" width={36} height={36} />
        <span className="title-style">Mortnon 后台管理系统</span>
      </Header>
      <Content className="content-style">
        <div className="form-style">
          <Divider>登录</Divider>
          <Spin tip="登录中" spinning={loading}>
            <Form onSubmit={onSubmit}>
              <Form.Input
                field="username"
                noLabel={true}
                placeholder={"用户名"}
                rules={[{ required: true, message: "请输入用户名" }]}
              />
              <Form.Input
                field="password"
                noLabel={true}
                mode="password"
                placeholder={"密码"}
                rules={[{ required: true, message: "请输入密码" }]}
              />

              <Button theme="solid" type="primary" htmlType="submit">
                登录
              </Button>
          
            </Form>
          </Spin>
        </div>
      </Content>
      <Footer className="footer-style">©2023 Mortnon.</Footer>
    </Layout>
  );
}
