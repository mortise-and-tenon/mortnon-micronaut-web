"use client";

import { fetchApi } from "@/app/_modules/func";
import { ExclamationCircleFilled, ReloadOutlined } from "@ant-design/icons";
import type {
  ActionType,
  ProColumns,
  ProFormInstance,
} from "@ant-design/pro-components";
import {
  PageContainer,
  ProTable,
  ProDescriptions,
} from "@ant-design/pro-components";

import { Button, Form, Input, message, Modal, Select, Space, Tag } from "antd";
import { useRouter } from "next/navigation";

import {
  faCheck,
  faToggleOff,
  faToggleOn,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useRef, useState } from "react";

export type OptionType = {
  label: string;
  value: string | number;
};

export default function RoleAuth({ params }: { params: { roleId: number } }) {
  const { push } = useRouter();

  const roleId = params.roleId;

  //表格列定义
  const columns: ProColumns[] = [
    {
      title: "用户名称",
      dataIndex: "user_name",
      sorter: true,
      order: 5,
    },
    {
      title: "用户昵称",
      dataIndex: "nick_name",
      sorter: true,
      order: 4,
    },
    {
      title: "状态",
      dataIndex: "status",
      search: false,
      valueEnum: {
        true: {
          text: "正常",
          status: true,
        },
        false: {
          text: "停用",
          status: false,
        },
      },
      render: (text, record) => {
        return (
          <Space>
            <Tag
              color={record.status ? "green" : "red"}
              icon={
                record.status ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <FontAwesomeIcon icon={faXmark} />
                )
              }
            >
              {text}
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "所属部门",
      key: "project",
      search: false,
      render: (text, record) => {
        if (record.project_roles.length > 0) {
          return record.project_roles[0].project_name ?? "-";
        }
        return "-";
      },
    },
    {
      title: "绑定角色",
      key: "role",
      search: false,
      render: (text, record) => {
        if (record.project_roles.length > 0) {
          return record.project_roles[0].role_name;
        }
        return "-";
      },
    },
    {
      title: "创建时间",
      dataIndex: "gmt_create",
      valueType: "dateTime",
      sorter: true,
      search: false,
    },
    {
      title: "操作",
      key: "option",
      search: false,
      render: (_, record) => {
        if (record.id != 1)
          return [
            <Button
              key="deleteBtn"
              type="link"
              icon={<FontAwesomeIcon icon={faUsers} />}
              onClick={() => modifyUserRole(record)}
            >
              修改角色
            </Button>,
          ];
      },
    },
  ];

  useEffect(() => {
    queryRoleList();
    queryCurrentRole();
  }, []);

  //当前角色数据
  const [roleData, setRoleData] = useState({} as any);

  //查询当前角色数据
  const queryCurrentRole = async () => {
    const body = await fetchApi(`/api/roles/${roleId}`, push);
    if (body !== undefined) {
      setRoleData(body.data);
    }
  };

  //查询角色授权数据
  const getRoleAllocate = async (params: any, sorter: any, filter: any) => {
    const searchParams = {
      role_id: roleId,
      page: params.current - 1,
      size: params.pageSize,
      ...params,
    };

    delete searchParams.current;
    delete searchParams.pageSize;

    const queryParams = new URLSearchParams(searchParams);

    Object.keys(sorter).forEach((key) => {
      queryParams.append("property", key);
      if (sorter[key] === "ascend") {
        queryParams.append("order", "asc");
      } else {
        queryParams.append("order", "desc");
      }
    });
    const body = await fetchApi(`/api/assignment?${queryParams}`, push);

    if (body !== undefined) {
      return body;
    }
  };

  //搜索栏显示状态
  const [showSearch, setShowSearch] = useState(true);
  //action对象引用
  const actionRef = useRef<ActionType>();
  //表单对象引用
  const formRef = useRef<ProFormInstance>();

  //当前默认条数
  const defaultPageSize = 10;

  //角色数据
  const [roleValue, setRoleValue] = useState([] as Array<OptionType>);

  //查询角色信息
  const queryRoleList = async () => {
    const body = await fetchApi("/api/roles", push);
    if (body !== undefined) {
      const roleArray: Array<OptionType> = new Array<OptionType>();
      body.data.content.forEach((role: any) => {
        const option: OptionType = {
          label: role.name,
          value: role.id,
        };
        roleArray.push(option);
      });

      setRoleValue(roleArray);
    }
  };

  //操作用户的附加数据
  const [attachUserdata, setAttachUserdata] = useState<{ [key: string]: any }>(
    {}
  );

  //是否展示角色修改对话框
  const [showModifyRoleModal, setShowModifyRoleModal] = useState(false);

  //点击修改角色
  const modifyUserRole = (record: any) => {
    attachUserdata["id"] = record.id;
    attachUserdata["nick_name"] = record.nick_name;
    const roleId =
      record.project_roles.length > 0
        ? record.project_roles[0].role_id ?? null
        : null;
    setShowModifyRoleModal(true);
    roleFormRef.setFieldsValue({
      nick_name: record.nick_name,
      role_id: roleId,
    });
  };

  //修改角色表单引用
  const [roleFormRef] = Form.useForm();

  //确认修改角色
  const confirmModifyRole = () => {
    roleFormRef.submit();
  };

  //取消修改角色
  const cancelModifyRole = () => {
    setShowModifyRoleModal(false);
    roleFormRef.resetFields();
  };

  //执行修改角色
  const executeModifyUserRole = async (values: any) => {
    setShowModifyRoleModal(false);
    values["user_id"] = attachUserdata["id"];
    const body = await fetchApi(`/api/assignment`, push, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (body != undefined) {
      if (body.success) {
        message.success(`修改"${attachUserdata["nick_name"]}"角色成功`);
        //刷新列表
        if (actionRef.current) {
          actionRef.current.reload();
        }
      } else {
        message.error(body.message);
      }
    }
    roleFormRef.resetFields();
  };

  return (
    <PageContainer
      header={{
        title: "授权用户",
        onBack(e) {
          push("/system/role");
        },
      }}
    >
      <ProDescriptions column={2}>
        <ProDescriptions.Item label="角色名称">
          {roleData.name}
        </ProDescriptions.Item>
        <ProDescriptions.Item label="标识符">
          {roleData.identifier}
        </ProDescriptions.Item>
      </ProDescriptions>
      <ProDescriptions column={2}>
      <ProDescriptions.Item label="备注">
          {roleData.description}
        </ProDescriptions.Item>
      </ProDescriptions>

      <ProTable
        formRef={formRef}
        rowKey="id"
        columns={columns}
        request={async (params: any, sorter: any, filter: any) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          const body = await getRoleAllocate(params, sorter, filter);
          if (body !== undefined) {
            return Promise.resolve({
              data: body.data.content,
              success: true,
              total: body.data.total_size,
            });
          }
          return Promise.resolve({
            data: [],
            success: true,
          });
        }}
        pagination={{
          defaultPageSize: defaultPageSize,
          showQuickJumper: true,
          showSizeChanger: true,
        }}
        search={
          showSearch
            ? {
                defaultCollapsed: false,
                searchText: "搜索",
              }
            : false
        }
        dateFormatter="string"
        actionRef={actionRef}
        toolbar={{
          actions: [],
          settings: [
            {
              key: "switch",
              icon: showSearch ? (
                <FontAwesomeIcon icon={faToggleOn} />
              ) : (
                <FontAwesomeIcon icon={faToggleOff} />
              ),
              tooltip: showSearch ? "隐藏搜索栏" : "显示搜索栏",
              onClick: (key: string | undefined) => {
                setShowSearch(!showSearch);
              },
            },
            {
              key: "refresh",
              tooltip: "刷新",
              icon: <ReloadOutlined />,
              onClick: (key: string | undefined) => {
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              },
            },
          ],
        }}
      />
      <Modal
        title="修改角色"
        open={showModifyRoleModal}
        onOk={confirmModifyRole}
        onCancel={cancelModifyRole}
      >
        <Form
          form={roleFormRef}
          onFinish={executeModifyUserRole}
          layout="vertical"
        >
          <Form.Item label="姓名" name="nick_name">
            <Input disabled />
          </Form.Item>

          <Form.Item label="角色" name="role_id">
            <Select options={roleValue} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
