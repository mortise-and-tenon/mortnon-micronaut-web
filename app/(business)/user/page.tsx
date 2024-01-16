"use client";


import React, { useEffect, useState, useRef } from "react";

import { BaesQueryResult,UserInfo,QueryInfo,ProjectTreeNode } from "@/app/lib/definitions";

//性别
enum Sex {
  //女
  Female = 0,
  //男
  Male = 1,
}

//查询用户数据结果定义
export type QueryResult = BaesQueryResult & {
  //数据
  data: Array<UserInfo>;
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
      page: queryInfo.page.toString(),
      size: queryInfo.size.toString(),
      property: queryInfo.property,
      order: queryInfo.order,
    });
    const response = await fetch(`/api/users?${queryParams.toString()}`);
    if (response.ok) {
      const body = await response.json();
      const data = body.data;
      const userList: Array<UserInfo> = new Array<UserInfo>();

      data.content.forEach((user) => {
        const userInfo: UserInfo = {
          key: user.id,
          userName: user.user_name,
          nickName: user.nick_name,
          sex: user.sex === Sex.Female ? "女" : "男",
          email: user.email,
          phone: user.phone,
          projectId:
            user.project_roles.length > 0
              ? user.project_roles[0].project_id
              : 0,
          projectName:
            user.project_roles.length > 0
              ? user.project_roles[0].project_name
              : "",
          roleId:
            user.project_roles.length > 0 ? user.project_roles[0].role_id : 0,
          roleName:
            user.project_roles.length > 0
              ? user.project_roles[0].role_name
              : "",
        };
        userList.push(userInfo);

      });

      userList.sort((a, b) => a.userName.localeCompare(b.userName));

      //绑定查询到的数据
      //前台semi默认页数从1开始，后端从0开始
      const queryResult: QueryResult = {
        pageNumber: data.page_number + 1,
        totalPages: data.total_pages,
        pageSize: data.page_size,
        totalSize: data.total_size,
        data: userList,
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

export default function User() {
  //表格查询数据
  const [queryResult, setQueryResult] = useState({} as QueryResult);

  //删除行用户对话框是否可见
  const [deleteDialogVisiable, setDeleteDialogVisiable] = useState(false);
  //编辑行用户对话框是否可见
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  //操作的行用户数据
  const [rowUserInfo, setRowUserInfo] = useState({} as UserInfo);

  //删除行用户确定
  const handleDeleteOk = async () => {
    setDialogDisabled(true);
    try {
      const response = await fetch(`/api/users/${rowUserInfo.key}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        // Toast.success("删除用户成功");
        setDeleteDialogVisiable(false);
        //操作成功后刷新表格
        refreshAll();
      } else if (response.status == 403) {
        // Toast.error(`你无权删除用户！`);
      } else {
        const body = await response.json();
        // Toast.error(`${body.message}，删除用户失败，请重试`);
      }
    } catch (error) {
      console.log("delete user error:", error);
    } finally {
      setDialogDisabled(false);
    }
  };

  //删除行用户取消
  const handleDeleteCancel = () => {
    setDeleteDialogVisiable(false);
  };

  //编辑行用户确定
  const handleEditOk = async () => {
    // if (formApiRef.current != null) {
    //   formApiRef.current.submitForm();
    // } else {
    //   Toast.error("发生异常，请刷新重试");
    //   console.log("formapi error,can't submit form.");
    // }
  };

  //编辑行用户取消
  const handleEditCancel = () => {
    setEditDialogVisible(false);
  };

  //提交编辑用户信息
  const onEditSubmit = async (values) => {
    setDialogDisabled(true);
    const editUserData = {
      id: rowUserInfo.key,
      nickName: values.nickname,
      email: values.email,
      phone: values.phone,
      sex: values.sex,
    };

    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUserData),
        credentials: "include",
      });

      if (response.ok) {
        // Toast.success("修改用户成功");
        setEditDialogVisible(false);
      } else {
        // Toast.error("修改用户失败");
      }
    } catch (error) {
    } finally {
      setDialogDisabled(false);
    }
  };

  //表格列定义
  const columns = [
    {
      title: "用户名",
      dataIndex: "userName",
    },
    {
      title: "用户昵称",
      dataIndex: "nickName",
      sorter: (a, b) => {
        if (queryInfo.order === "asc") {
          return a.nickName.localeCompare(b.userName, "zh-Hans-CN", {
            sensitivity: "accent",
          }) > 0
            ? 1
            : -1;
        }
        return a.nickName.localeCompare(b.userName, "zh-Hans-CN", {
          sensitivity: "accent",
        }) < 0 ? -1 : 1;
      },
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
    {
      title: "操作",
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
    property: "nickName",
    order: "desc",
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
  const refreshTable = (
    currentPage: number,
    pageSize: number,
    property: string,
    order: string
  ) => {
    setLoading(true);

    setQueryInfo({
      page: currentPage,
      size: pageSize,
      property: property === null ? "nickName" : property,
      order: order === null ? "desc" : order,
    });
  };

  const tableChange = ({ pagination, filters, sorter, extra }) => {
    let order = "desc";

    if (sorter.sortOrder === "ascend") {
      order = "asc";
    }

    refreshTable(
      pagination.currentPage - 1,
      pagination.pageSize,
      sorter.dataIndex,
      order
    );
  };

  //变更页码和每页条数时刷新表格
  const handleChange = (currentPage: number, pageSize: number) => {
    refreshTable(currentPage - 1, pageSize, "", "");
  };

  //初始刷新表格数据
  const refreshAll = () => {
    refreshTable(0, defaultPageSize, "", "");
  };

  const formApiRef = useRef();

  //获取Form的 formApi，用于模态框的按钮手动提交表单
  const bindFormApi = (formApi) => {
    formApiRef.current = formApi;
  };

  //是否展示模态框
  const [visible, setVisible] = useState(false);
  //模态框中的表单是否禁用
  const [dialogDisabled, setDialogDisabled] = useState(false);
  //模态框的关闭按钮和ESC是否可用
  const [modalAllowClose, setModalAllowClose] = useState(true);

  //展示添加用户模态框
  const showDialog = () => {
    getProjectTree(setProjectTree);
    getRole(setRoleInfo, setRoleLoading);
    setVisible(true);
  };

  //添加用户
  const onSubmit = async (values) => {
    //提交时禁用表单和按钮
    setDialogDisabled(true);
    //提交时禁止禁止关闭模态框
    setModalAllowClose(false);

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
        // Toast.success("添加用户成功");
        //操作成功后关闭模态框
        setVisible(false);
        //操作成功后刷新表格
        refreshAll();
      } else if (response.status == 400) {
        const body = await response.json();
        const msg = body.message;
        // Toast.error(`${msg}，请修改后重试`);
      } else {
        // Toast.error("添加用户失败，请重试");
      }
    } catch (error) {
      console.log("create use fail:", error);
    //   Toast.error("发生异常，请重试");
    } finally {
      //提交流程结束，恢复表单状态和允许关闭
      setDialogDisabled(false);
      setModalAllowClose(true);
    }
  };

  //点击添加用户窗口确认按钮
  const addUserConfirm = async () => {
    console.log("confirm");
    if (formApiRef.current != null) {
      formApiRef.current.submitForm();
    } else {
    //   Toast.error("发生异常，请刷新重试");
      console.log("formapi error,can't submit form.");
    }
  };

  const addUserCancel = () => {
    setVisible(false);
  };
  const handleAfterClose = () => {};

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
    //   Toast.error("发生异常，请刷新重试");
      console.log("formapi error,can't validate pwd.");
    }
  };

  return (
    <p>user</p>
  );
}