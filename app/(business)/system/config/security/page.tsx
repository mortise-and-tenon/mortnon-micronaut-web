"use client";

import { fetchApi } from "@/app/_modules/func";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  ProForm,
  ProFormRadio,
  ProFormSelect,
  ProFormTreeSelect,
  ProCard,
  ProFormDigit,
} from "@ant-design/pro-components";
import type { ProFormInstance } from "@ant-design/pro-components";

import { message } from "antd";
import { useEffect, useRef, useState } from "react";
import SkeletonLoad from "@/app/_modules/SkeletonLoad";

//查询配置API
const queryAPI = "/api/system/config";
//更新配置API
const updateAPI = "/api/system/config";

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

      modifyFormRef?.current?.setFieldsValue({
        captcha: body.data.captcha,
        password_encrypt: body.data.password_encrypt,
        double_factor: body.data.double_factor,
        try_count: body.data.try_count,
        lock_time: body.data.lock_time,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    queryConfig();
  }, []);

  //保存配置
  const executeAddData = async (values: any) => {
    const body = await fetchApi(updateAPI, push, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (body !== undefined) {
      if (body.success) {
        message.success("修改成功");
      } else {
        message.error(body.message);
      }
    }
  };

  return (
    <PageContainer title={false}>
      <ProCard title="登录安全">
        {loading ? (
          <SkeletonLoad />
        ) : (
          <ProForm
            key="addmodal"
            formRef={modifyFormRef}
            layout="horizontal"
            autoFocusFirstInput
            submitTimeout={2000}
            onFinish={executeAddData}
            submitter={{
              searchConfig: { submitText: "保存" },
            }}
          >
            <ProForm.Group>
              <ProFormRadio.Group
                name="captcha"
                width="md"
                label="验证码"
                options={[
                  {
                    label: "关闭",
                    value: "DISABLE",
                  },
                  {
                    label: "算术验证码",
                    value: "ARITHMETIC",
                  },
                  {
                    label: "文本验证码",
                    value: "OTHER",
                  },
                ]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormRadio.Group
                name="password_encrypt"
                width="md"
                label="密码加密"
                tooltip="登录过程中密码将加密后再传输"
                options={[
                  {
                    label: "加密",
                    value: true,
                  },
                  {
                    label: "明文",
                    value: false,
                  },
                ]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormDigit
                label="允许失败次数"
                tooltip="0表示无限制"
                name="try_count"
                min={0}
                max={10}
                fieldProps={{ precision: 0 }}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormDigit
                label="失败锁定时间"
                tooltip="达到允许失败次数时开始锁定"
                name="lock_time"
                fieldProps={{ precision: 0, addonAfter: "秒" }}
              />
            </ProForm.Group>
          </ProForm>
        )}
      </ProCard>
    </PageContainer>
  );
}
