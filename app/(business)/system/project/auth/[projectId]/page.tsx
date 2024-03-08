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
  ModalForm,
  ProForm,
  ProFormTreeSelect,
  ProFormText,
} from "@ant-design/pro-components";

import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
  TreeSelect,
} from "antd";
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

export default function ProjectAuth({
  params,
}: {
  params: { projectId: number };
}) {
  const { push } = useRouter();

  const projectId = params.projectId;

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
              onClick={() => modifyUserProject(record)}
            >
              变更部门
            </Button>,
          ];
      },
    },
  ];

  //查询部门关联用户数据
  const getProjectAllocate = async (params: any, sorter: any, filter: any) => {
    const searchParams = {
      project_id: projectId,
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

  useEffect(() => {
    getDeptList();
  }, []);

  const [projectValue, setProjectValue] = useState([]);

  //查询组织信息
  const getDeptList = async () => {
    const body = await fetchApi("/api/projects/tree", push);
    if (body !== undefined) {
      body.data.forEach((item: any) => {
        parseChild(item);
      });

      setProjectValue(body.data);
    }
  };

  const parseChild = (parentNode: any) => {
    if (parentNode.children.length == 0) {
      delete parentNode.children;
      return;
    }

    parentNode.children.sort((a: any, b: any) => a.order - b.order);

    parentNode.children.forEach((child: any) => {
      parseChild(child);
    });
  };

  //操作用户的附加数据
  const [attachUserdata, setAttachUserdata] = useState<{ [key: string]: any }>(
    {}
  );

  //是否展示部门修改对话框
  const [showModifyProjectModal, setShowModifyProjectModal] = useState(false);

  //修改部门表单引用
  const [projectFormRef] = Form.useForm();

  //确认修改部门
  const confirmModifyProject = () => {
    projectFormRef.submit();
  };

  //点击修改部门
  const modifyUserProject = (record: any) => {
    attachUserdata["id"] = record.id;
    attachUserdata["nick_name"] = record.nick_name;
    const projectId =
      record.project_roles.length > 0
        ? record.project_roles[0].project_id ?? null
        : null;
    setShowModifyProjectModal(true);
    projectFormRef.setFieldsValue({
      nick_name: record.nick_name,
      project_id: projectId,
    });
  };

  //取消修改部门
  const cancelModifyProject = () => {
    setShowModifyProjectModal(false);
    projectFormRef.resetFields();
  };

  //执行修改部门
  const executeModifyUserProject = async (values: any) => {
    setShowModifyProjectModal(false);
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
        message.success(`修改"${attachUserdata["nick_name"]}"部门成功`);
        //刷新列表
        if (actionRef.current) {
          actionRef.current.reload();
        }
      } else {
        message.error(body.message);
      }
    }
    projectFormRef?.current?.resetFields();
  };

  return (
    <PageContainer
      header={{
        title: "部门成员",
        onBack(e) {
          push("/system/project");
        },
      }}
    >
      <ProTable
        formRef={formRef}
        rowKey="id"
        columns={columns}
        request={async (params: any, sorter: any, filter: any) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          const body = await getProjectAllocate(params, sorter, filter);
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
        title="编辑部门"
        open={showModifyProjectModal}
        onOk={confirmModifyProject}
        onCancel={cancelModifyProject}
      >
        <Form
          form={projectFormRef}
          onFinish={executeModifyUserProject}
          layout="vertical"
        >
          <Form.Item label="姓名" name="nick_name">
            <Input disabled />
          </Form.Item>
          <Form.Item label="部门" name="project_id">
            <TreeSelect
              fieldNames={{
                label: "name",
                value: "id",
              }}
              treeData={projectValue}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
