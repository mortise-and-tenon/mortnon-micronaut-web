"use client";
import React from "react";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Input, Space } from "antd";

export default function Login() {


  return (
    <>
      <header>header</header>
      <main>
        <Space direction="vertical">
            <Input placeholder="用户名"/>
          <Input.Password placeholder="密码" />
        </Space>
      </main>

      <footer>footer</footer>
    </>
  );
}
