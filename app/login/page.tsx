"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import "./style.css";
import NavLogo from "../_modules/navLogo";
import Footer from "../_modules/footer";
import Header from "../_modules/header";
import {
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  InputLabel,
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  LinearProgress,
  Alert,
} from "@mui/material";

import { Visibility, VisibilityOff, Person, Lock } from "@mui/icons-material";

import { getFormValues } from "../lib/formAction";

export default function Login() {
  //是否登录中
  const [loading, setLoading] = useState(false);
  const [tipMsg, setTipMsg] = useState("");

  const router = useRouter();

  const userNameErrmsg = "用户名不能为空";
  const passwordErrmsg = "密码不能为空";

  const [userNameIsError, setUserNameIsError] = useState(false);
  const [passwordIsError, setPasswordIsError] = useState(false);

  //提交
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setTipMsg("");
    setLoading(true);
    const formJson = getFormValues(event);
    setUserNameIsError(formJson.userName === "");
    setPasswordIsError(formJson.password === "");

    if (formJson.username === "" || formJson.password === "") {
      return;
    }

    try {
      const response = await fetch("/api/login/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formJson),
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("success:", data);
        router.push("/");
      } else {
        const data = await response.json();
        //TODO:前端有一个错误码和国际化文字的对应关系，用错误码对应的文字显示
        setTipMsg(data.message);
      }
    } catch (error) {
      setTipMsg("登录发生异常，请重试");
    } finally {
      setLoading(false);
    }
  };

  const userNameValidator = (event: React.ChangeEvent) => {
    const userName = event.target.value;
    setUserNameIsError(userName === "");
  };

  const passwordValidator = (event: React.ChangeEvent) => {
    const password = event.target.value;
    setPasswordIsError(password === "");
  };

  const [showPassword, setShowPassword] = React.useState(false);

  const clickShowPassword = () => {
    setShowPassword((show) => !show);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <div className="layout background-style">
      <Header>
        <NavLogo />
      </Header>
      <div className="layout-content">
        <div className="form-style">
          <Divider>账号登录</Divider>
          <form onSubmit={onSubmit}>
            {loading && <LinearProgress className="formItemStyle" />}
            {tipMsg !== "" && <Alert severity="error">{tipMsg}</Alert>}
            <Input
              className="formItemStyle"
              id="userName"
              name="username"
              placeholder="用户名"
              variant="standard"
              fullWidth
              onBlur={userNameValidator}
              {...(loading ? { disabled: true } : {})}
              {...(userNameIsError ? { error: true } : {})}
              startAdornment={
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              }
            />
            {userNameIsError && (
              <FormHelperText {...(userNameIsError ? { error: true } : {})}>
                {userNameErrmsg}
              </FormHelperText>
            )}

            <Input
              className="formItemStyle"
              id="password"
              name="password"
              placeholder="密码"
              variant="standard"
              fullWidth
              type="password"
              onBlur={passwordValidator}
              {...(loading ? { disabled: true } : {})}
              {...(passwordIsError ? { error: true } : {})}
              helperText={passwordIsError ? passwordErrmsg : ""}
              startAdornment={
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={clickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            {passwordIsError && (
              <FormHelperText {...(passwordIsError ? { error: true } : {})}>
                {passwordErrmsg}
              </FormHelperText>
            )}
            <Button
              className="formItemStyle"
              variant="contained"
              fullWidth
              type="submit"
              {...(loading ? { disabled: true } : {})}
            >
              登录
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
