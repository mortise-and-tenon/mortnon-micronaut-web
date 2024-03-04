"use client";

import { fetchApi } from "@/app/_modules/func";
import {
  DeleteOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type {
  ActionType,
  ProColumns,
  ProFormInstance,
} from "@ant-design/pro-components";
import { PageContainer, ProTable } from "@ant-design/pro-components";

import type { GetProp, UploadProps } from "antd";
import { Button, message, Modal, Space, Tag, Upload } from "antd";
import { useRouter } from "next/navigation";

import {
  faCheck,
  faToggleOff,
  faToggleOn,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useRef, useState } from "react";

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
      title: "性别",
      dataIndex: "sex",
      sorter: true,
      order: 3,
      valueEnum: {
        0: {
          text: "女",
          status: 0,
        },
        1: {
          text: "男",
          status: 1,
        },
      },
    },
    {
      title: "邮箱",
      dataIndex: "email",
      order: 2,
    },
    {
      title: "手机号",
      dataIndex: "phone",
      order: 1,
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
      title: "所属组织",
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
      title: "角色",
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
        if (record.userId != 1)
          return [
            <Button
              key="deleteBtn"
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onClickRemoveAuth(record)}
            >
              取消授权
            </Button>,
          ];
      },
    },
  ];

  //未分配授权用户列定义
  const unAllocateColumns: ProColumns[] = [
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
      title: "性别",
      dataIndex: "sex",
      sorter: true,
      order: 3,
      valueEnum: {
        0: {
          text: "女",
          status: 0,
        },
        1: {
          text: "男",
          status: 1,
        },
      },
    },
    {
      title: "邮箱",
      dataIndex: "email",
      order: 2,
    },
    {
      title: "手机号",
      dataIndex: "phone",
      order: 1,
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
      title: "所属组织",
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
      title: "创建时间",
      dataIndex: "gmt_create",
      valueType: "dateTime",
      sorter: true,
      search: false,
    },
  ];

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

  //查询角色未授权数据
  const getRoleUnallocate = async (params: any, sorter: any, filter: any) => {
    const searchParams = {
      role_id: roleId,
      page: params.current - 1,
      size: params.pageSize,
      unassignment: true,
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

  //点击取消授权按钮
  const onClickRemoveAuth = (record: any) => {
    const id = record.id;

    Modal.confirm({
      title: "系统提示",
      icon: <ExclamationCircleFilled />,
      content: `确定要取消用户“${record.nick_name}”的当前角色授权吗？`,
      onOk() {
        executeRemoveRoleAuth(id);
      },
      onCancel() {},
    });
  };

  //执行批量取消用户角色授权
  const executeBatchRemoveRoleAuth = async () => {
    const data = {
      roleId: roleId,
      userIds: selectedRowKeys.join(","),
    };

    const body = await fetchApi(
      `/api/users?${new URLSearchParams(data)}`,
      push,
      {
        method: "PUT",
      }
    );

    if (body !== undefined) {
      if (body.code == 200) {
        message.success("批量取消授权成功");
      } else {
        message.error(body.msg);
      }

      setSelectedRowKeys([]);
      //刷新表格
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  //执行取消用户角色授权
  const executeRemoveRoleAuth = async (userId: any) => {
    const body = await fetchApi(
      `/api/assignment/user/${userId}/role/${roleId}`,
      push,
      {
        method: "DELETE",
      }
    );

    if (body !== undefined) {
      if (body.success) {
        message.success("取消授权成功");
      } else {
        message.error(body.message);
      }

      //刷新表格
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  //选中行操作
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const rowSelection = {
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  //未授权用户选中行操作
  const [selectedRowKeysUnallocate, setSelectedRowKeysUnallocate] = useState<
    React.Key[]
  >([]);

  const rowSelectionUnallocate = {
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeysUnallocate(newSelectedRowKeys);
    },
  };

  //是否展示分配用户对话框
  const [showUnallocateModal, setShowUnallocateModal] = useState(false);

  //展示分配用户对话框
  const onClickShowModal = () => {
    if (unallocateActionRef.current) {
      unallocateActionRef.current.reload();
    }

    setShowUnallocateModal(true);
  };

  //确认分配新的用户
  const confirmAddUnallocate = async () => {
    const data = {
      role_id: roleId,
      user_id_list: selectedRowKeysUnallocate,
    };

    const body = await fetchApi(`/api/assignment?`, push, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (body !== undefined) {
      if (body.success) {
        message.success("授权成功");
      } else {
        message.error(body.message);
      }
    }

    setSelectedRowKeysUnallocate([]);

    if (unallocateActionRef.current) {
      unallocateActionRef.current.reload();
    }

    console.log(selectedRowKeysUnallocate);

    if (actionRef.current) {
      actionRef.current.reload();
    }

    setShowUnallocateModal(false);
  };

  //取消分配用户
  const cancelAddUnallocate = () => {
    setShowUnallocateModal(false);
    setSelectedRowKeysUnallocate([]);
  };

  //搜索栏显示状态
  const [showSearch, setShowSearch] = useState(true);
  //action对象引用
  const actionRef = useRef<ActionType>();
  //表单对象引用
  const formRef = useRef<ProFormInstance>();

  //未分配用户列表action对象引用
  const unallocateActionRef = useRef<ActionType>();

  //当前默认条数
  const defaultPageSize = 10;

  return (
    <PageContainer
      header={{
        title: "分配用户",
        onBack(e) {
          push("/system/role");
        },
      }}
    >
      <ProTable
        formRef={formRef}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          ...rowSelection,
        }}
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
          actions: [
            <Button
              icon={<PlusOutlined />}
              key="allocate"
              type="primary"
              onClick={onClickShowModal}
            >
              添加用户
            </Button>,
          ],
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
        title={`选择用户`}
        width={1000}
        open={showUnallocateModal}
        onOk={confirmAddUnallocate}
        onCancel={cancelAddUnallocate}
      >
        <ProTable
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedRowKeysUnallocate,
            ...rowSelectionUnallocate,
          }}
          columns={unAllocateColumns}
          request={async (params: any, sorter: any, filter: any) => {
            // 表单搜索项会从 params 传入，传递给后端接口。
            const body = await getRoleUnallocate(params, sorter, filter);
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
          actionRef={unallocateActionRef}
          toolbar={{
            actions: [],
            settings: [],
          }}
        />
      </Modal>
    </PageContainer>
  );
}
