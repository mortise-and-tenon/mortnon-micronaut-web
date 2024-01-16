"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import Image from "next/image";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  LinearProgress,
  Typography,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";
import Footer from "../_modules/footer";
import "./style.css";

import {
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  LockOutlined,
} from "@mui/icons-material";

import { getFormValues } from "../lib/formAction";
import NavLogo from "../_modules/navLogo";

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
    const formJson = getFormValues(event);
    setUserNameIsError(formJson.username === "");
    setPasswordIsError(formJson.password === "");

    if (formJson.username === "" || formJson.password === "") {
      return;
    }

    setLoading(true);

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
    <Grid
      container
      component="main"
      sx={{ height: "100vh" }}
      direction="column"
    >
      <Grid sx={{ height: 64 }}>
        <AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <NavLogo />
            </Toolbar>
          </Container>
        </AppBar>
      </Grid>
      <Grid container sx={{ height: "calc(100vh - 64px)" }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              "url(https://source.unsplash.com/random?wallpapers)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item sm={8} md={5}>
          <Box
            fullWidth
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              账号登录
            </Typography>
            <Box component="form" noValidate onSubmit={onSubmit}>
              {loading && <LinearProgress sx={{ my: "8px" }} />}
              {tipMsg !== "" && <Alert severity="error">{tipMsg}</Alert>}
              <FormControl fullWidth>
                <Input
                  id="userName"
                  name="username"
                  placeholder="用户名"
                  variant="standard"
                  fullWidth
                  sx={{ mt: 3, mb: 2 }}
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
                  <FormHelperText
                    fullWidth
                    {...(userNameIsError ? { error: true } : {})}
                  >
                    {userNameErrmsg}
                  </FormHelperText>
                )}
              </FormControl>
              <FormControl fullWidth>
                <Input
                  id="password"
                  name="password"
                  placeholder="密码"
                  variant="standard"
                  fullWidth
                  sx={{ mt: 3, mb: 2 }}
                  type={showPassword ? "text" : "password"}
                  onBlur={passwordValidator}
                  {...(loading ? { disabled: true } : {})}
                  {...(passwordIsError ? { error: true } : {})}
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
                  <FormHelperText
                    fullWidth
                    {...(passwordIsError ? { error: true } : {})}
                  >
                    {passwordErrmsg}
                  </FormHelperText>
                )}
              </FormControl>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, mb: 2 }}
                type="submit"
                {...(loading ? { disabled: true } : {})}
              >
                登录
              </Button>
            </Box>
          </Box>
          <Footer />
        </Grid>
      </Grid>
    </Grid>
  );
}
