"use client";

import {
  encrypt,
  encryptWithKey,
  fetchApi,
  generateRandomString,
} from "@/app/_modules/func";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  ProForm,
  ProFormRadio,
  ProFormSelect,
  ProFormTreeSelect,
  ProCard,
  ProFormDigit,
  ProFormSwitch,
  ProFormText,
  ProFormCaptcha,
} from "@ant-design/pro-components";
import type { ProFormInstance } from "@ant-design/pro-components";

import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { message, Button } from "antd";
import { useEffect, useRef, useState } from "react";
import SkeletonLoad from "@/app/_modules/SkeletonLoad";
import { commonPublicKey, domainRule, ipRule } from "@/app/_modules/definies";
import { getCookie } from "cookies-next";

//查询配置API
const queryAPI = "/api/system/message/email";
//更新配置API
const updateAPI = "/api/system/message/email";
//验证码API
const codeAPI = "/api/system/message/email/code";

export default function Config() {
  const { push } = useRouter();

  const modifyFormRef = useRef<ProFormInstance>();

  //配置加载状态
  const [loading, setLoading] = useState(true);

  //查询配置
  const queryConfig = async () => {
    setLoading(true);
    const body = await fetchApi(queryAPI, push);
    if (body !== undefined) {
      if (!body.success) {
        message.error(body.message);
        return;
      }

      if (body.data.enabled) {
        modifyFormRef?.current?.setFieldsValue({
          enabled: body.data.enabled,
          host: body.data.host,
          port: body.data.port,
          https: body.data.https,
          connection_timeout: body.data.connection_timeout,
          timeouit: body.data.timeout,
          email: body.data.email,
          auth: body.data.auth,
          user_name: body.data.user_name,
        });
      }

      setEnabledSwitch(body.data.enabled);
      setEnabledAuth(body.data.auth);

      setLoading(false);
    }
  };

  useEffect(() => {
    queryConfig();
  }, []);

  //保存配置
  const executeAddData = async (values: any) => {
    setSaveLoading(true);

    values["password"] = encryptWithKey(values["password"], commonPublicKey);

    const body = await fetchApi(updateAPI, push, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (body !== undefined) {
      if (body.success) {
        message.success("保存配置成功");
      } else {
        if (body.error_code === "B0004") {
          message.error("登录认证双因子已使用电子邮件，无法停用！");
        } else {
          message.error(body.message);
        }
      }
    }
    setSaveLoading(false);
  };


  const [enabledSwitch, setEnabledSwitch] = useState(false);

  //启用/停用配置
  const switchConfig = (checked: boolean, event: Event) => {
    setEnabledSwitch(checked);
  };

  const [enabledAuth, setEnabledAuth] = useState(false);

  //开启/关闭认证
  const swithAuth = (checked: boolean, event: Event) => {
    setEnabledAuth(checked);
  };

  //校验码
  const [verifyCode, setVerifyCode] = useState("");

  //校验码是否通过
  const [verifyPass, setVerifyPass] = useState(false);

  //发送验证码，以确认邮箱配置正确
  const sendCode = async () => {
    let values = modifyFormRef.current.getFieldsValue();
    values["password"] = encryptWithKey(values["password"], commonPublicKey);

    const code = generateRandomString(4);
    values["code"] = code;
    setVerifyCode(code);
    setVerifyPass(false);

    const result = await fetchApi(codeAPI, push, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (result !== undefined) {
      if (result.success) {
        message.success(`验证码已发送`);
      } else {
        if (result.error_code === "A0113") {
          message.error("验证码发送异常，请检查当前管理员邮箱配置");
        } else {
          message.error("验证码发送异常，请检查配置是否正确");
        }
      }
    } else {
      message.error("验证码发送异常，请检查配置是否正确");
    }
  };

  //保存配置加载状态
  const [saveLoading, setSaveLoading] = useState(false);

  return (
    <PageContainer title={false}>
      <ProCard title="电子邮件">
        {loading ? (
          <SkeletonLoad />
        ) : (
          <ProForm
            key="addmodal"
            formRef={modifyFormRef}
            layout="horizontal"
            submitTimeout={2000}
            onFinish={executeAddData}
            submitter={{
              render: (props, doms) => {
                return [
                  <Button
                    type="primary"
                    key="submit"
                    disabled={!verifyPass && enabledSwitch}
                    loading={saveLoading}
                    onClick={() => props.form?.submit?.()}
                  >
                    保存
                  </Button>,
                ];
              },
            }}
          >
            <ProForm.Group>
              <ProFormSwitch
                name="enabled"
                checkedChildren="启用"
                unCheckedChildren="停用"
                onChange={switchConfig}
              />
            </ProForm.Group>
            {enabledSwitch && (
              <>
                <ProForm.Group>
                  <ProFormText
                    name="host"
                    label="邮箱服务器"
                    autoFocus
                    width="md"
                    tooltip="服务器IP/域名"
                    placeholder="请填写邮箱服务器"
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (ipRule.test(value)) {
                            return Promise.resolve();
                          } else if (domainRule.test(value)) {
                            return Promise.resolve();
                          } else {
                            return Promise.reject(
                              new Error("请输入正确的邮箱服务器地址")
                            );
                          }
                        },
                      }),
                    ]}
                  />
                </ProForm.Group>
                <ProForm.Group>
                  <ProFormDigit
                    name="port"
                    label="SMTP 端口"
                    width="md"
                    tooltip="默认为25，SSL下为465，TLS下为587"
                    fieldProps={{ precision: 0 }}
                    placeholder="请填写 SMTP 协议端口"
                    max={65536}
                    rules={[
                      { required: true, message: "请填写 SMTP 协议端口" },
                    ]}
                  />
                </ProForm.Group>
                <ProForm.Group>
                  <ProFormRadio.Group
                    name="https"
                    width="md"
                    label="传输安全协议"
                    initialValue="NONE"
                    options={[
                      {
                        label: "未启用",
                        value: "NONE",
                      },
                      {
                        label: "SSL",
                        value: "SSL",
                      },
                      {
                        label: "TLS",
                        value: "TLS",
                      },
                    ]}
                  />
                </ProForm.Group>
                <ProForm.Group>
                  <ProFormDigit
                    name="connection_timeout"
                    label="连接超时"
                    initialValue="10000"
                    fieldProps={{ precision: 0, addonAfter: "秒" }}
                    placeholder="请填写连接超时"
                    rules={[{ required: true, message: "请填写连接超时" }]}
                  />
                </ProForm.Group>
                <ProForm.Group>
                  <ProFormDigit
                    name="timeout"
                    label="发送超时"
                    initialValue="15000"
                    fieldProps={{ precision: 0, addonAfter: "秒" }}
                    placeholder="请填写发送超时"
                    rules={[{ required: true, message: "请填写发送超时" }]}
                  />
                </ProForm.Group>
                <ProForm.Group>
                  <ProFormText
                    name="email"
                    label="邮箱地址"
                    width="md"
                    tooltip="用于消息中心发送电子邮件"
                    placeholder="请填写邮箱地址"
                    rules={[{ type: "email", message: "请输入正确的邮箱地址" }]}
                  />
                </ProForm.Group>
                <ProForm.Group>
                  <ProFormSwitch
                    name="auth"
                    checkedChildren="认证"
                    unCheckedChildren="不认证"
                    onChange={swithAuth}
                  />
                </ProForm.Group>
                {enabledAuth && (
                  <>
                    <ProForm.Group>
                      <ProFormText
                        name="user_name"
                        label="认证用户名/邮箱"
                        width="md"
                        tooltip="用于消息中心发送电子邮件"
                        placeholder="请填写认证用户名/邮箱"
                        rules={[
                          { required: true, message: "请填写认证用户名/邮箱" },
                        ]}
                      />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormText.Password
                        name="password"
                        label="认证密码/授权码"
                        width="md"
                        placeholder="请填写认证密码"
                        rules={[
                          { required: true, message: "请填写认证密码/授权码" },
                        ]}
                      />
                    </ProForm.Group>
                  </>
                )}
                <ProForm.Group>
                  <ProFormCaptcha
                    fieldProps={{
                      onChange: (e: any) => {
                        setVerifyPass(e.target.value === verifyCode);
                      },
                      suffix: verifyPass && (
                        <FontAwesomeIcon
                          icon={faCheck}
                          style={{ color: "green" }}
                        />
                      ),
                    }}
                    label="验证码"
                    tooltip="输入当前用户邮箱收到的验证码，如果未收到，请检查邮箱配置及当前用户的邮箱是否正确"
                    placeholder="请输入验证码"
                    onGetCaptcha={async (phone: any) => {
                      await sendCode();
                    }}
                  />
                </ProForm.Group>
              </>
            )}
          </ProForm>
        )}
      </ProCard>
    </PageContainer>
  );
}
