"use client";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCheckbox,
  ProFormText,
  ModalForm,
  ProForm,
  ProFormCaptcha,
} from "@ant-design/pro-components";
import { Divider, message, Spin, theme, Flex } from "antd";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";

import type { ProFormInstance } from "@ant-design/pro-components";

import Image from "next/image";

import { useEffect, useRef, useState } from "react";
import { LoginReq } from "../_modules/definies";
import {
  decrypt,
  displayModeIsDark,
  encrypt,
  encryptWithKey,
  fetchApi,
  watchDarkModeChange,
} from "../_modules/func";
import { time } from "console";

type Captcha = {
  image: string;
  key: string;
};

//cookies 记住的用户名 key
const cookie_username_key = "mortnon_username";
//cookies 记住的密码 key
const cookie_password_key = "mortnon_password";

//浅色背景图
const backgroudLight = "/bg_light.jpg";
//深色前景图
const backgroundDark = "/bg_dark.jpg";

export default function Login() {
  //验证码数据
  const [captcha, setCaptcha] = useState({} as Captcha);
  //是否展示验证码框
  const [showCaptcha, setShowCaptcha] = useState(false);
  //验证码加载状态
  const [isLoadingImg, setIsLoadingImg] = useState(true);

  //获取验证码
  const getCaptcha = async () => {
    try {
      const response = await fetch("/api/captcha");
      if (response.ok) {
        const body = await response.json();

        setShowCaptcha(body.data.enabled);

        if (body.data.enabled) {
          const captchaData: Captcha = {
            image: body.data.image,
            key: body.data.key,
          };

          setCaptcha(captchaData);
          setIsLoadingImg(false);
        }
      } else {
      }
    } catch (error) {
    } finally {
    }
  };

  const [loginConfig, setLoginConfig] = useState(undefined as any);

  //获取登录相关配置项
  const getLoginConfig = async () => {
    const response = await fetch("/api/system/login/config");
    if (response.ok) {
      const body = await response.json();
      if (body !== undefined) {
        setLoginConfig(body.data);
        setShowDoubleFactor(body.data.double_factor !== "DISABLE");
      }
    }
  };

  //深色模式
  const [isDark, setIsDark] = useState(false);
  //背景图片
  const [background, setBackground] = useState(backgroudLight);

  useEffect(() => {
    getCaptcha();
    getLoginConfig();
    readUserNamePassword();
    setIsDark(displayModeIsDark());
    setBackground(displayModeIsDark() ? backgroundDark : backgroudLight);
    const unsubscribe = watchDarkModeChange((matches: boolean) => {
      setIsDark(matches);
      setBackground(matches ? backgroundDark : backgroudLight);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const router = useRouter();

  //提交登录
  const userLogin = async (values: any) => {
    //如果开启了加密传输，将密码敏感数据加密后再调用api
    let encryptPwd = values.password;
    if (loginConfig?.password_encrypt) {
      encryptPwd = encryptWithKey(encryptPwd, loginConfig?.public_key);
    }
    const loginData: LoginReq = {
      username: values.username,
      password: encryptPwd,
      code: values.code,
      verify_code: values.verify_code,
      verify_key: captcha.key,
    };

    //是否记住密码
    const autoLogin = values.autoLogin;

    try {
      const response = await fetch("/api/login/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      //获得响应
      if (response.ok) {
        const data = await response.json();

        //登录成功
        if (data.success) {
          message.success("登录成功");
          //记住密码
          if (autoLogin) {
            rememberUserNamePassword(values.username, values.password);
          } else {
            removeUserNamePassword();
          }

          router.push("/");
        } else {
          message.error(data.message);

          //异常，自动刷新验证码
          getCaptcha();
        }
      } else {
        const data = await response.json();

        message.error(data.message);

        //异常，自动刷新验证码
        getCaptcha();

        //如果发生锁定，展示锁定倒计时
        if (data.data && data.data.lock_time) {
          startLock(data.data.lock_time);
        }
      }
    } catch (error) {
      console.log("error:", error);
      message.error("登录发生异常，请重试");
    } finally {
    }
  };

  //记住用户名密码到cookie
  const rememberUserNamePassword = (username: string, password: string) => {
    setCookie(cookie_username_key, encrypt(username));
    setCookie(cookie_password_key, encrypt(password));
  };

  //移除cookie中的用户名和密码
  const removeUserNamePassword = () => {
    deleteCookie(cookie_username_key);
    deleteCookie(cookie_password_key);
  };

  const loginFormRef = useRef<ProFormInstance>();

  //读取cookie中用户名密码，并填写到表单中
  const readUserNamePassword = () => {
    const username = getCookie(cookie_username_key);
    const password = getCookie(cookie_password_key);

    if (username !== undefined && password !== undefined) {
      if (loginFormRef) {
        loginFormRef.current?.setFieldsValue({
          username: decrypt(username),
          password: decrypt(password),
          autoLogin: true,
        });
      }
      setCanSendCode(true);
    }
  };

  const { token } = theme.useToken();

  //锁定倒计时
  const [countdown, setCountdown] = useState(0);

  const [isCounting, setIsCounting] = useState(false);

  const frameRef = useRef(0);
  const startTimeRef = useRef(0);

  const startLock = (time: number) => {
    if (!isCounting) {
      setIsCounting(true);
      setCountdown(time);
    }
  };

  useEffect(() => {
    const animate = (time: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = time;
      }

      const elapsedTime = time - startTimeRef.current;

      if (elapsedTime >= 1000) {
        startTimeRef.current = time;
        setCountdown((preCount) => (preCount > 0 ? preCount - 1 : 0));
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    if (isCounting) {
      frameRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(frameRef.current);
  }, [isCounting]);

  //是否展示双因子输入
  const [showDoubleFactor, setShowDoubleFactor] = useState(false);

  //是否允许发送双因子验证码
  const [canSendCode, setCanSendCode] = useState(false);

  //双因子验证码倒计时秒数
  const [codeCountdown, setCodeCountdown] = useState(60);

  //发送双因子验证码
  const sendCode = async () => {
    const values = loginFormRef?.current?.getFieldsValue();

    const codeReq = {
      username: values.username,
    };

    try {
      const response = await fetch("/api/login/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(codeReq),
        credentials: "include",
      });

      //获得响应
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          message.success("已发送双因子验证码，请查收");
        } else {
          message.error("发送双因子验证码异常");
        }
      }
    } catch (error) {
    } finally {
    }
  };

  return (
    <ProConfigProvider dark={isDark}>
      <div
        style={{
          backgroundColor: "white",
          height: "100vh",
        }}
      >
        <LoginFormPage
          formRef={loginFormRef}
          backgroundImageUrl={background}
          logo="./mortnon.svg"
          title={(<span>MorTnon 后台管理系统</span>) as any}
          containerStyle={{
            backgroundColor: "rgba(0,0,0,0)",
            backdropFilter: "blur(4px)",
          }}
          subTitle={
            <span style={{ color: "rgba(255,255,255,1)" }}>
              MorTnon，高质量的快速开发框架
            </span>
          }
          actions={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p style={{ color: "rgba(255,255,255,.6)" }}>
                ©{new Date().getFullYear()} Mortnon.
              </p>
            </div>
          }
          onFinish={userLogin}
        >
          <Divider>账号密码登录</Divider>
          {countdown > 0 && (
            <Flex justify="center">
              <span style={{ color: "#ff4d4f" }}>
                登录锁定中，请{countdown}秒后重试
              </span>
            </Flex>
          )}

          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: "large",
                prefix: (
                  <UserOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
                onChange: (e: any) => {
                  if (e.target.value !== "") {
                    const password =
                      loginFormRef?.current?.getFieldValue("password");
                    setCanSendCode(password !== "");
                  } else {
                    setCanSendCode(false);
                  }
                },
              }}
              placeholder={"用户名"}
              rules={[
                {
                  required: true,
                  message: "用户名不能为空",
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: "large",
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={"prefixIcon"}
                  />
                ),
                onChange: (e: any) => {
                  if (e.target.value !== "") {
                    const username =
                      loginFormRef?.current?.getFieldValue("username");
                    setCanSendCode(username !== "");
                  } else {
                    setCanSendCode(false);
                  }
                },
              }}
              placeholder={"密码"}
              rules={[
                {
                  required: true,
                  message: "密码不能为空",
                },
              ]}
            />
            {showDoubleFactor && (
              <ProFormCaptcha
                name="code"
                placeholder="请输入双因子验证码"
                onTiming={(count: number) => {
                  setCodeCountdown(count);
                }}
                onGetCaptcha={async (phone: any) => {
                  if (codeCountdown == 60) {
                    await sendCode();
                  }
                }}
                captchaProps={{
                  disabled: !canSendCode,
                  size: "large",
                }}
                fieldProps={{
                  size: "large",
                }}
                rules={[
                  {
                    required: true,
                    message: "双因子验证码不能为空",
                  },
                ]}
              />
            )}
            {showCaptcha && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <ProFormText
                  name="verify_code"
                  fieldProps={{
                    size: "large",
                  }}
                  placeholder={"验证码"}
                  rules={[
                    {
                      required: true,
                      message: "验证码不能为空",
                    },
                  ]}
                />

                <div style={{ margin: "0 0 0 8px" }}>
                  <Spin spinning={isLoadingImg}>
                    {captcha.image === undefined ? (
                      <div style={{ width: 80, height: 40 }}></div>
                    ) : (
                      <Image
                        src={captcha.image}
                        width={112}
                        height={40}
                        alt="captcha"
                        onClick={getCaptcha}
                      />
                    )}
                  </Spin>
                </div>
              </div>
            )}
          </>
          <div
            style={{
              marginBlockEnd: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              记住密码
            </ProFormCheckbox>
            {/* <a
              style={{
                float: "right",
              }}
            >
              忘记密码
            </a> */}
          </div>
        </LoginFormPage>
      </div>
    </ProConfigProvider>
  );
}
