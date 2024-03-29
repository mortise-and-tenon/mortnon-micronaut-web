"use client";

import { UserDetailInfo } from "@/app/_modules/definies";
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProForm,
  ProFormRadio,
  ProFormText,
} from "@ant-design/pro-components";
import { Col, Divider, Flex, message, Row, Space, Tabs, Upload } from "antd";

import type { GetProp, TabsProps, UploadProps } from "antd";

import { fetchApi } from "@/app/_modules/func";

import {
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { faSitemap, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useRouter } from "@/node_modules/next/navigation";
import { useState } from "react";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

const getBase64 = (img: FileType, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

//上传图片前校验
const beforeUpload = (file: FileType) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("只能上传 JPG/PNG 格式图片!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片大小不能超过 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

export default function Profile() {
  const [imageUrl, setImageUrl] = useState<string>();

  const { push } = useRouter();

  const [user, setUser] = useState({} as UserDetailInfo);

  //获取用户profile
  const getProfile = async () => {
    const body = await fetchApi("/api/profile", push);
    if (body !== undefined) {
      if (!body.success) {
        message.error(body.message);
        return;
      }

      const data = body.data.user;
      const userData: UserDetailInfo = {
        user_name: data.user_name,
        nick_name: data.nick_name,
        phone: data.phone,
        email: data.email,
        deptName:
          data.project_roles.length > 0
            ? data.project_roles[0].project_name ?? ""
            : "",
        roleName:
          data.project_roles.length > 0
            ? data.project_roles[0].role_name ?? ""
            : "",
        sex: data.sex,
        createTime: data.gmt_create,
      };

      setUser(userData);
      setImageUrl(
        data.avatar === "" || data.avatar === null
          ? userData.sex === "1"
            ? "/avatar1.jpeg"
            : "/avatar0.jpeg"
          : "/api" + data.avatar
      );

      return userData;
    }
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as FileType, (url) => {
        setImageUrl(url);
      });
    }
  };

  //更新用户基本信息
  const updateProfile = async (values: any) => {
    const body = await fetchApi("/api/profile", push, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    return body;
  };

  //修改用户密码
  const updatePassword = async (values: any) => {
    const params = {
      old_password: values.old_password,
      password: values.password,
      repeat_password: values.repeat_password,
    };
    const body = await fetchApi(`/api/profile/password`, push, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    return body;
  };

  const uploadAvatar = async (options: any) => {
    const formData = new FormData();
    formData.append("file", options.file);
    const body = await fetchApi("/api/profile/avatar", push, {
      method: "POST",
      body: formData,
    });
    if (body.success) {
      message.success("上传头像成功");
      setImageUrl("/api" + body.data);
    } else {
      message.error(body.message);
    }
  };

  const executeUpdateProfile = async (values: any) => {
    const body = await updateProfile(values);
    if (body.success) {
      message.success("修改成功，刷新页面更新数据");
    } else {
      message.error(body.message);
    }
  };

  const executeUpdatePassword = async (values: any) => {
    const body = await updatePassword(values);
    if (body !== undefined) {
      if (body.success) {
        message.success("修改成功");
        return;
      }
      message.error(body.message);
    }
  };

  //定义的基本资料的tab页
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "基本资料",
      children: (
        <ProForm
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          submitter={{
            render: (props, doms) => {
              return (
                <Row>
                  <Col span={14} offset={4}>
                    <Space>{doms}</Space>
                  </Col>
                </Row>
              );
            },
          }}
          onFinish={executeUpdateProfile}
          request={getProfile}
        >
          <ProFormText
            width="md"
            name="nick_name"
            label="姓名"
            placeholder="请输入姓名"
            rules={[{ required: true, message: "请输入姓名" }]}
          />
          <ProFormText
            width="md"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
          />
          <ProFormText
            name="email"
            width="md"
            label="邮箱"
            placeholder="请输入邮箱"
          />
          <ProFormRadio.Group
            name="sex"
            width="md"
            label="性别"
            options={[
              {
                label: "男",
                value: 0,
              },
              {
                label: "女",
                value: 1,
              },
            ]}
            rules={[{ required: true, message: "请选择性别" }]}
          />
        </ProForm>
      ),
    },
    {
      key: "2",
      label: "修改密码",
      children: (
        <ProForm<{
          oldPassword: string;
          newPassword: string;
        }>
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          submitter={{
            render: (props, doms) => {
              return (
                <Row>
                  <Col span={14} offset={4}>
                    <Space>{doms}</Space>
                  </Col>
                </Row>
              );
            },
          }}
          onFinish={executeUpdatePassword}
          params={{}}
        >
          <ProFormText.Password
            width="md"
            name="old_password"
            label="当前密码"
            placeholder="请输入当前密码"
            rules={[{ required: true, message: "请输入当前密码" }]}
          />
          <ProFormText.Password
            width="md"
            name="password"
            label="新密码"
            placeholder="请输入新密码"
            rules={[{ required: true, message: "请输入新密码" }]}
          />
          <ProFormText.Password
            width="md"
            name="repeat_password"
            label="确认新密码"
            placeholder="请再次输入新密码"
            rules={[
              { required: true, message: "请再次输入新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("新密码两次输入不一致"));
                },
              }),
            ]}
          />
        </ProForm>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: "个人中心",
        breadcrumb: {},
      }}
    >
      <ProCard gutter={[16, 16]}>
        <ProCard
          colSpan="30%"
          title="个人信息"
          headerBordered
          bordered
          hoverable
        >
          <Flex justify="center" align="center">
            <div>
              <Upload
                name="avatarfile"
                accept=".jpg,.jpeg,.png"
                listType="picture-circle"
                className="avatar-uploader"
                showUploadList={false}
                customRequest={uploadAvatar}
                beforeUpload={beforeUpload}
                onChange={handleChange}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                >
                  {imageUrl && (
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                      src={imageUrl}
                      alt="avatar"
                    />
                  )}
                </div>
              </Upload>
            </div>
          </Flex>
          <Divider />
          <ProDescriptions column={1}>
            <ProDescriptions.Item
              label={
                <>
                  <UserOutlined />
                  用户名
                </>
              }
            >
              {user.user_name}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label={
                <>
                  <PhoneOutlined />
                  手机号码
                </>
              }
            >
              {user.phone}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label={
                <>
                  <MailOutlined />
                  用户邮箱
                </>
              }
            >
              {user.email}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label={
                <>
                  <FontAwesomeIcon icon={faSitemap} />
                  所属部门
                </>
              }
            >
              {user.deptName}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label={
                <>
                  <FontAwesomeIcon icon={faUsers} />
                  所属角色
                </>
              }
            >
              {user.roleName}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label={
                <>
                  <CalendarOutlined />
                  创建时间
                </>
              }
            >
              {user.createTime}
            </ProDescriptions.Item>
          </ProDescriptions>
        </ProCard>
        <ProCard title="基本资料" headerBordered bordered hoverable>
          <Tabs defaultActiveKey="1" items={items} />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
