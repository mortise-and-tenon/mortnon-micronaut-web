"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import "./style.css";
import NavLogo from "../_modules/navLogo";
import Footer from "../_modules/footer";
import Header from "../_modules/header";
import { Button, Divider, FormControl, FormLabel, Input, TextField } from "@mui/material";

export default function Login() {
  //是否登录中
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  //提交
  // const onSubmit = async (values) => {
  //   setLoading(true);
  //   console.log(values);
  //   try {
  //     const response = await fetch("/api/login/password", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(values),
  //       credentials: "include",
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log("success:", data);
  //       router.push("/");
  //     } else {
  //       const data = await response.json();
  //       //TODO:前端有一个错误码和国际化文字的对应关系，用错误码对应的文字显示
  //       Toast.warning(data.message);
  //     }
  //   } catch (error) {
  //     Toast.error("登录发生异常，请重试");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="layout background-style">
      <Header>
        <NavLogo />
      </Header>
      <div className="layout-content">
        <div className="form-style">
          <Divider>登录</Divider>
          <FormControl>
    <FormLabel>Enter Name</FormLabel>
    <Input></Input>
    <Button variant="contained">Submit</Button>
</FormControl>
          {/* <Spin tip="登录中" spinning={loading}>
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
          </Spin> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
