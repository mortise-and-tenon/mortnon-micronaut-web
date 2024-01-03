"use client";
import {
  Layout,
  Table,
  Breadcrumb,
  Card,
  Button,
  Modal,
  Form,
  Toast,
} from "@douyinfe/semi-ui";

import { IconUserAdd, IconRefresh } from "@douyinfe/semi-icons";

import NavHeader from "@/app/_modules/navHeader";
import NavSider from "@/app/_modules/navSider";

import "../style.css";

import React, { useEffect, useState, useRef } from "react";

const { Content } = Layout;

//过滤器定义
export type ColumnFilter = {
  text: string;
  value: number | string;
};

//性别
enum Sex {
  //女
  Female = 0,
  //男
  Male = 1,
}

//分页查询数据定义
export type QueryInfo = {
  //查询页码
  page: number;
  //查询每页数量
  size: number;
};

//查询用户数据结果定义
export type QueryResult = {
  //当前页数
  pageNumber: number;
  //总页数
  totalPages: number;
  //每页条数
  pageSize: number;
  //总条数
  totalSize: number;
  //数据
  data: Array<UserInfo>;
  //用户名列过滤器
  userNameFilter: Array<ColumnFilter>;
};

//用户信息定义
export type UserInfo = {
  //用户id对应表格key
  key: number;
  userName: string;
  nickName: string;
  sex: string;
  email: string;
  phone: string;
  projectId: number;
  projectName: string;
  roleId: number;
  roleName: string;
};

//组织树信息定义
export type ProjectTreeNode = {
  key: string;
  label: string;
  children: Array<ProjectTreeNode>;
};

//角色信息定义
export type RoleInfo = {
  value: number;
  label: string;
};

//创建用户的组织角色信息定义
export type CreateUserProjectRole = {
  projectId: number;
  roleId: number;
};

//创建用户的信息定义
export type CreateUserData = {
  userName: string;
  nickName: string;
  password: string;
  repeatPassword: string;
  email: string;
  phone: string;
  head: string;
  sex: number;
  projectRoles: Array<CreateUserProjectRole>;
};

//获取用户数据
export async function getUser(
  queryInfo: QueryInfo,
  setQueryResult: React.Dispatch<React.SetStateAction<QueryResult>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    const queryParams = new URLSearchParams({
      page: queryInfo.page,
      size: queryInfo.size,
    });
    const response = await fetch(`/api/users?${queryParams.toString()}`);
    if (response.ok) {
      const body = await response.json();
      const data = body.data;
      const userList: Array<UserInfo> = new Array<UserInfo>();
      const userNameFilters: Array<ColumnFilter> = new Array<ColumnFilter>();
      data.content.forEach((user) => {
        const userInfo: UserInfo = {
          key: user.id,
          userName: user.userName,
          nickName: user.nickName,
          sex: user.sex === Sex.Female ? "女" : "男",
          email: user.email,
          phone: user.phone,
          projectId:
            user.project_roles.length > 0 ? user.project_roles[0].projectId : 0,
          projectName:
            user.project_roles.length > 0
              ? user.project_roles[0].projectName
              : "",
          roleId:
            user.project_roles.length > 0 ? user.project_roles[0].roleId : 0,
          roleName:
            user.project_roles.length > 0 ? user.project_roles[0].roleName : "",
        };
        userList.push(userInfo);

        const userNameFilter: ColumnFilter = {
          text: user.userName,
          value: user.userName,
        };
        userNameFilters.push(userNameFilter);
      });

      //绑定查询到的数据
      //前台semi默认页数从1开始，后端从0开始
      const queryResult: QueryResult = {
        pageNumber: data.pageNumber + 1,
        totalPages: data.totalPages,
        pageSize: data.pageSize,
        totalSize: data.totalSize,
        data: userList,
        userNameFilter: userNameFilters,
      };
      setQueryResult(queryResult);
      setLoading(false);
    }
  } catch (error) {
    console.log("error:", error);
    setLoading(false);
  }
}

//获取树型组织信息
export async function getProjectTree(
  setProjectTree: React.Dispatch<React.SetStateAction<Array<ProjectTreeNode>>>
) {
  try {
    const response = await fetch("/api/projects/tree");
    if (response.ok) {
      const body = await response.json();
      const data = body.data;
      const rootNode: ProjectTreeNode = {
        key: data.id.toString(),
        label: data.name,
        children: [],
      };
      convertProjectNode(rootNode, data.children);

      const topProjectTreeNodeArray: Array<ProjectTreeNode> =
        new Array<ProjectTreeNode>();
      topProjectTreeNodeArray.push(rootNode);
      setProjectTree(topProjectTreeNodeArray);
    }
  } catch (error) {
    console.log("query project error", error);
  }
}

const convertProjectNode = (parentNode: ProjectTreeNode, dataList: []) => {
  const children: Array<ProjectTreeNode> = new Array<ProjectTreeNode>();
  dataList.forEach((data) => {
    const node: ProjectTreeNode = {
      key: data.id,
      label: data.name,
      children: [],
    };

    if (null != data.children) {
      convertProjectNode(node, data.children);
    }
    children.push(node);
  });

  parentNode.children = children;
  return parentNode;
};

//获取角色信息
export async function getRole(
  setRole: React.Dispatch<React.SetStateAction<Array<RoleInfo>>>,
  setRoleLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    const response = await fetch("/api/roles");
    if (response.ok) {
      const body = await response.json();
      const data = body.data;

      const roleArray: Array<RoleInfo> = new Array<RoleInfo>();
      data.content.forEach((role) => {
        const roleInfo: RoleInfo = {
          value: role.id,
          label: role.name,
        };
        roleArray.push(roleInfo);
      });
      setRole(roleArray);
    }
  } catch (error) {
    console.log("get role fail:", error);
  } finally {
    setRoleLoading(false);
  }
}

//表格选中事件定义
const rowSelection = {
  getCheckboxProps: (record) => ({
    //系统管理员不可操作
    disabled: record.key === 1,
    name: record.name,
  }),
  onSelect: (record, selected) => {
    //选中的行
  },
  onSelectAll: (selected, selectedRows) => {
    //全选时的数据
  },
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
};

export default function User() {
  const [queryResult, setQueryResult] = useState({} as QueryResult);
  //表格列定义
  const columns = [
    {
      title: "用户名",
      dataIndex: "userName",
      filters: queryResult.userNameFilter,
      onFilter: (value, record) => record.userName.includes(value),
      sorter: (a, b) => (a.userName.length - b.userName.length > 0 ? 1 : -1),
    },
    {
      title: "用户昵称",
      dataIndex: "nickName",
      sorter: (a, b) => (a.nickName.length - b.nickName.length > 0 ? 1 : -1),
    },
    {
      title: "性别",
      dataIndex: "sex",
    },
    {
      title: "邮箱",
      dataIndex: "email",
    },
    {
      title: "手机号",
      dataIndex: "phone",
    },
    {
      title: "所属组织",
      dataIndex: "projectName",
    },
    {
      title: "角色",
      dataIndex: "roleName",
    },
  ];

  //表格加载状态
  const [loading, setLoading] = useState(true);
  //表格默认分页数
  const defaultPageSize = 10;
  //表格查询结果数据
  const [queryInfo, setQueryInfo] = useState({
    page: 0,
    size: defaultPageSize,
  } as QueryInfo);

  //性别选项
  const sexInfo = [
    {
      value: 1,
      label: "男",
    },
    {
      value: 0,
      label: "女",
    },
  ];

  //组织树数据
  const [projectTree, setProjectTree] = useState([] as Array<ProjectTreeNode>);

  //角色数据
  const [roleInfo, setRoleInfo] = useState([] as Array<RoleInfo>);
  //角色加载状态
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    getUser(queryInfo, setQueryResult, setLoading);
  }, [queryInfo]);

  //按条件刷新表格
  const refreshTable = (currentPage: number, pageSize: number) => {
    setLoading(true);

    setQueryInfo({
      page: currentPage,
      size: pageSize,
    });
  };

  //变更页码和每页条数时刷新表格
  const handleChange = (currentPage: number, pageSize: number) => {
    refreshTable(currentPage - 1, pageSize);
  };

  //初始刷新表格数据
  const refreshAll = () => {
    refreshTable(0, defaultPageSize);
  };

  const formApiRef = useRef();

  //获取Form的 formApi，用于模态框的按钮手动提交表单
  const bindFormApi = (formApi) => {
    formApiRef.current = formApi;
  };

  //是否展示模态框
  const [visible, setVisible] = useState(false);
  const showDialog = () => {
    getProjectTree(setProjectTree);
    getRole(setRoleInfo, setRoleLoading);
    setVisible(true);
  };

  //添加用户
  const onSubmit = async (values) => {
    console.log("create user:", values);
    const createUserProjectRoleArray: Array<CreateUserProjectRole> =
      new Array<CreateUserProjectRole>();

    const userProjectRole: CreateUserProjectRole = {
      projectId: values.projectid,
      roleId: values.roleid,
    };
    createUserProjectRoleArray.push(userProjectRole);

    const createUserData: CreateUserData = {
      nickName: values.nickname,
      userName: values.username,
      password: values.password,
      repeatPassword: values.repeatpassword,
      email: values.email,
      phone: values.phone,
      head: values.head,
      sex: values.sex,
      projectRoles: createUserProjectRoleArray,
    };

    console.log("user:", createUserData);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createUserData),
        credentials: "include",
      });

      //创建用户成功
      if (response.ok) {
        Toast.success("添加用户成功");
        //操作成功后关闭模态框
        setVisible(false);
      } else {
        Toast.error("添加用户失败");
      }
    } catch (error) {
      console.log("create use fail:", error);
      Toast.error("添加用户失败，请重试");
    } finally {
    }
  };

  //点击添加用户窗口确认按钮
  const handleOk = () => {
    if (formApiRef.current != null) {
      formApiRef.current.submitForm();
      console.log("Ok button clicked");
    } else {
      Toast.error("发生异常，请刷新重试");
      console.log("formapi error,can't submit form.");
    }
  };
  const handleCancel = () => {
    setVisible(false);
    console.log("Cancel button clicked");
  };
  const handleAfterClose = () => {
    console.log("After Close callback executed");
  };

  //校验重复密码要一致
  const validateRepeatPwd = (val, values) => {
    if (!val) {
      return "请再次输入密码";
    }
    if (formApiRef.current != null) {
      const pwd = formApiRef.current.getValue("password");
      if (pwd != val) {
        return "两次输入密码不一致";
      }
    } else {
      Toast.error("发生异常，请刷新重试");
      console.log("formapi error,can't validate pwd.");
    }
  };

  return (
    <Layout className="layout-almost-full-screen">
      <NavHeader selectedKey="system" />
      <Content className="content">
        <NavSider selectedKey="user" />
        <Layout>
          <Breadcrumb className="bread-style">
            <Breadcrumb.Item noLink={true}>系统管理</Breadcrumb.Item>
            <Breadcrumb.Item noLink={true}>用户管理</Breadcrumb.Item>
          </Breadcrumb>
          <Card className="card-style">
            <div className="action-style">
              <Button
                theme="borderless"
                icon={<IconUserAdd />}
                aria-label="添加用户"
                onClick={showDialog}
              />
              <Modal
                title="添加用户"
                visible={visible}
                centered
                onOk={handleOk}
                afterClose={handleAfterClose}
                onCancel={handleCancel}
                closeOnEsc={true}
                maskClosable={false}
              >
                <Form
                  wrapperCol={{ span: 18 }}
                  labelCol={{ span: 6 }}
                  labelPosition="left"
                  labelAlign="right"
                  onSubmit={onSubmit}
                  getFormApi={bindFormApi}
                >
                  <Form.Input
                    field="username"
                    label="用户名"
                    placeholder={"用户名"}
                    trigger="blur"
                    rules={[{ required: true, message: "请输入用户名" }]}
                  />
                  <Form.Input
                    field="nickname"
                    label="姓名"
                    placeholder={"姓名"}
                    trigger="blur"
                    rules={[{ required: true, message: "请输入姓名" }]}
                  />
                  <Form.Select
                    field="sex"
                    label="性别"
                    placeholder="请选择性别"
                    style={{ width: "100%" }}
                    optionList={sexInfo}
                    rules={[{ required: true, message: "请选择性别" }]}
                  />
                  <Form.Input
                    field="password"
                    label="密码"
                    mode="password"
                    placeholder={"请输入密码"}
                    trigger="blur"
                    rules={[{ required: true, message: "请输入密码" }]}
                  />
                  <Form.Input
                    field="repeatpassword"
                    label={{ text: "确认密码", required: true }}
                    mode="password"
                    placeholder={"请再次输入密码"}
                    trigger="blur"
                    validate={validateRepeatPwd}
                  />
                  <Form.TreeSelect
                    field="projectid"
                    label="选择组织"
                    placeholder="请选择组织"
                    style={{ width: "100%" }}
                    dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                    treeData={projectTree}
                    rules={[{ required: true, message: "请选择组织" }]}
                  />
                  <Form.Select
                    field="roleid"
                    label="选择角色"
                    placeholder="请选择角色"
                    style={{ width: "100%" }}
                    loading={roleLoading}
                    optionList={roleInfo}
                    rules={[{ required: true, message: "请选择角色" }]}
                  />
                  <Form.Input
                    field="email"
                    label="电子邮箱"
                    placeholder={"请输入电子邮箱"}
                  />
                  <Form.Input
                    field="phone"
                    label="手机号"
                    placeholder={"请输入手机号"}
                  />
                </Form>
              </Modal>
              <div>
                <Button
                  theme="borderless"
                  icon={<IconRefresh />}
                  aria-label="刷新页面"
                  className="action-btn-style"
                  onClick={refreshAll}
                />
                <Button type="secondary">列</Button>
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={queryResult.data}
              pagination={{
                currentPage: queryResult.pageNumber,
                pageSize: queryResult.pageSize,
                total: queryResult.totalSize,
                showSizeChanger: true,
                onChange: handleChange,
              }}
              loading={loading}
              rowSelection={rowSelection}
            />
          </Card>
        </Layout>
      </Content>
    </Layout>
  );
}
