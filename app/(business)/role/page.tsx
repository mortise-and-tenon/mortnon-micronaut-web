"use client";
import { useState, useEffect, useRef } from "react";
import {
  Layout,
  Breadcrumb,
  Card,
  Table,
  Tooltip,
  Button,
  Form,
  Modal,
  Toast,
  CheckboxGroup,
} from "@douyinfe/semi-ui";
import { IconRefresh, IconPlus } from "@douyinfe/semi-icons";

import {
  QueryInfo,
  BaesQueryResult,
  LogInfo,
  ColumnFilter,
  RoleInfo,
} from "@/app/lib/definitions";

import "../style.css";

//查询日志数据结果定义
export type QueryResult = BaesQueryResult & {
  //数据
  data: Array<RoleInfo>;
};

export type CreateRoleData = {
  name: string;
  identifier: string;
  description: string;
  permissions: Array<string>;
};

//获取日志数据
export async function getLog(
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

    const response = await fetch(`/api/roles?${queryParams.toString()}`);
    if (response.ok) {
      const body = await response.json();
      const data = body.data;
      const roleList: Array<RoleInfo> = new Array<RoleInfo>();
      data.content.forEach((role) => {
        const roleInfo: RoleInfo = {
          key: role.id,
          name: role.name,
          identifier: role.identifier,
          description: role.description,
          permissions: role.permissions,
        };

        roleList.push(roleInfo);
      });

      roleList.sort((a, b) => (a.key > b.key ? 1 : -1));

      //绑定查询到的数据
      //前台semi默认页数从1开始，后端从0开始
      const queryResult: QueryResult = {
        pageNumber: data.page_number + 1,
        totalPages: data.total_pages,
        pageSize: data.page_size,
        totalSize: data.total_size,
        data: roleList,
      };
      setQueryResult(queryResult);
      setLoading(false);
    }
  } catch (error) {
    console.log("error:", error);
    setLoading(false);
  }
}

//权限数据定义
export type PermissionInfo = {
  label: string,
  value: number,
}


export default function Log() {
  //表格查询数据
  const [queryResult, setQueryResult] = useState({} as QueryResult);

  //表格加载状态
  const [loading, setLoading] = useState(true);
  //表格默认分页数
  const defaultPageSize = 10;
  //表格查询结果数据
  const [queryInfo, setQueryInfo] = useState({
    page: 0,
    size: defaultPageSize,
    property: "id",
    order: "asc",
  } as QueryInfo);

  useEffect(() => {
    getLog(queryInfo, setQueryResult, setLoading);
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
      property: property === null ? "id" : property,
      order: order === null ? "asc" : order,
    });
  };

  //变更页码和每页条数时刷新表格
  const handleChange = (currentPage: number, pageSize: number) => {
    refreshTable(currentPage - 1, pageSize, "", "");
  };

  //初始刷新表格数据
  const refreshAll = () => {
    refreshTable(0, defaultPageSize, "", "");
  };

  const [permissions,SetPermissions] = useState(Array<PermissionInfo>);

  const tableChange = ({ pagination, filters, sorter, extra }) => {
    console.log("user表格变化page::", pagination);
    console.log("user表格变化filter::", filters);
    console.log("user表格变化sort:", sorter);

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

  //是否展示模态框
  const [visible, setVisible] = useState(false);
  //模态框中的表单是否禁用
  const [dialogDisabled, setDialogDisabled] = useState(false);

  //删除行角色对话框是否可见
  const [deleteDialogVisiable, setDeleteDialogVisiable] = useState(false);
  //编辑行角色对话框是否可见
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  //操作的行角色数据
  const [rowRoleInfo, setRowRoleInfo] = useState({} as RoleInfo);

    //展示添加角色模态框
    const showDialog = () => {
      getPermission(SetPermissions);
      setVisible(true);
    };
  

  //删除行用户确定
  const handleDeleteOk = async () => {
    setDialogDisabled(true);
    try {
      const response = await fetch(`/api/roles/${rowRoleInfo.key}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        Toast.success("删除角色成功");
        setDeleteDialogVisiable(false);
        //操作成功后刷新表格
        refreshAll();
      } else if (response.status == 403) {
        Toast.error(`你无权删除角色！`);
      } else {
        const body = await response.json();
        Toast.error(`${body.message}，删除角色失败，请重试`);
      }
    } catch (error) {
      console.log("delete role error:", error);
    } finally {
      setDialogDisabled(false);
    }
  };

  //删除行角色取消
  const handleDeleteCancel = () => {
    setDeleteDialogVisiable(false);
  };

  const formApiRef = useRef();

  //获取Form的 formApi，用于模态框的按钮手动提交表单
  const bindFormApi = (formApi) => {
    formApiRef.current = formApi;
  };

  //添加角色
  const onSubmit = async (values) => {
    //提交时禁用表单和按钮
    setDialogDisabled(true);

    console.log("role:", values);

    const createRoleData: CreateRoleData = {
      name: values.name,
      identifier: values.identifier,
      description: values.description,
      permissions: values.permissions,
    };
    console.log("data:",createRoleData);

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createRoleData),
        credentials: "include",
      });

      //创建角色成功
      if (response.ok) {
        Toast.success("添加角色成功");
        //操作成功后关闭模态框
        setVisible(false);
        //操作成功后刷新表格
        refreshAll();
      } else if (response.status == 400) {
        const body = await response.json();
        const msg = body.message;
        Toast.error(`${msg}，请修改后重试`);
      } else {
        Toast.error("添加角色失败，请重试");
      }
    } catch (error) {
      console.log("create role fail:", error);
      Toast.error("发生异常，请重试");
    } finally {
      //提交流程结束，恢复表单状态
      setDialogDisabled(false);
    }
  };

  //点击添加角色窗口确认按钮
  const addUserConfirm = async () => {
    console.log("confirm");
    if (formApiRef.current != null) {
      formApiRef.current.submitForm();
    } else {
      Toast.error("发生异常，请刷新重试");
      console.log("formapi error,can't submit form.");
    }
  };

  const addUserCancel = () => {
    setVisible(false);
  };

  //编辑行角色确定
  const handleEditOk = async () => {
    if (formApiRef.current != null) {
      formApiRef.current.submitForm();
    } else {
      Toast.error("发生异常，请刷新重试");
      console.log("formapi error,can't submit form.");
    }
  };

  //编辑行角色取消
  const handleEditCancel = () => {
    setEditDialogVisible(false);
  };

  //提交编辑角色信息
  const onEditSubmit = async (values) => {
    setDialogDisabled(true);
    const editRoleData = {
      id: rowRoleInfo.key,
      name: values.name,
      identifier: values.identifier,
      description: values.description,
      permissions: values.permissions,
    };

    try {
      const response = await fetch("/api/roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editRoleData),
        credentials: "include",
      });

      if (response.ok) {
        Toast.success("修改角色成功");
        setEditDialogVisible(false);
        //操作成功后刷新表格
        refreshAll();
      } else {
        Toast.error("修改角色失败");
      }
    } catch (error) {
    } finally {
      setDialogDisabled(false);
    }
  };

  //获取权限数据
 const getPermission = async (
  setPermissions: React.Dispatch<React.SetStateAction<Array<PermissionInfo>>>,
  setRoleCheckPermission?:React.Dispatch<React.SetStateAction<Array<number>>>,
  record?:RoleInfo
) =>{
  try {

    const response = await fetch(`/api/permissions`);
    if (response.ok) {
      const body = await response.json();
      const data = body.data;
      const permissionList: Array<PermissionInfo> = new Array<PermissionInfo>();
      data.content.forEach((permission) => {
        const permissionInfo: PermissionInfo = {
          label: permission.description,
          value: permission.id,
        };

        permissionList.push(permissionInfo);
      });

      setPermissions(permissionList);
      if(setRoleCheckPermission != null && record != null){
        // setRoleCheckPermission(record.permissions.map(k=>k.id))
        formApiRef.current.setValue("permissions",record.permissions.map(k=>k.id));
      }
    }
  } catch (error) {
    console.log("error:", error);
  }
}

  //角色对应的权限id
  const [roleCheckPermission,SetRoleCheckPermission] = useState([] as Array<number>);

  //表格列定义
  const columns = [
    {
      title: "角色名",
      dataIndex: "name",
    },
    {
      title: "标识值",
      dataIndex: "identifier",
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "操作",
      render: (text, record: RoleInfo, index) => {
        const deleteProps = {};
        const editProps = {};

        if (record.key == 1) {
          deleteProps.disabled = true;
        }
        deleteProps.onClick = async () => {
          setDeleteDialogVisiable(true);
          setRowRoleInfo(record);
        };
        editProps.onClick = () => {
          getPermission(SetPermissions,SetRoleCheckPermission,record);
          setEditDialogVisible(true);
          setRowRoleInfo(record);
        };
        return (
          <div>
            <Button theme="borderless" {...deleteProps}>
              删除
            </Button>
            <Modal
              title="删除角色"
              visible={deleteDialogVisiable}
              centered
              maskStyle={{ backgroundColor: "rgba(244,244,244,0.2)" }}
              maskClosable={false}
              onOk={handleDeleteOk}
              onCancel={handleDeleteCancel}
              confirmLoading={dialogDisabled}
            >
              确定删除角色 {rowRoleInfo.name} ？
            </Modal>
            <Button theme="borderless" {...editProps}>
              编辑
            </Button>
            <Modal
              title="编辑角色"
              visible={editDialogVisible}
              centered
              onOk={handleEditOk}
              onCancel={handleEditCancel}
              maskClosable={false}
              maskStyle={{ backgroundColor: "rgba(244,244,244,0.2)" }}
              confirmLoading={dialogDisabled}
            >
              <Form
                wrapperCol={{ span: 18 }}
                labelCol={{ span: 6 }}
                labelPosition="left"
                labelAlign="right"
                onSubmit={onEditSubmit}
                getFormApi={bindFormApi}
                disabled={dialogDisabled}
              >
                <Form.Input
                  field="name"
                  label="角色名"
                  placeholder={"角色名"}
                  trigger="blur"
                  rules={[{ required: true, message: "请输入角色名" }]}
                  initValue={rowRoleInfo.name}
                />
                <Form.Input
                  field="identifier"
                  label="标识值"
                  placeholder={"标识值"}
                  trigger="blur"
                  rules={[{ required: true, message: "请输入标识值" }]}
                  initValue={rowRoleInfo.identifier}
                />
                <Form.Input
                  field="description"
                  label="描述"
                  placeholder={"描述"}
                  initValue={rowRoleInfo.description}
                />
                <Form.CheckboxGroup
                field="permissions"
                label="权限"
                options={permissions}
                direction="horizontal"
                defaultValue={roleCheckPermission}
                rules={[{ required: true, message: "请至少选择一个权限" }]}
              />
              </Form>
            </Modal>
          </div>
        );
      },
    },
  ];

  return (
    <Layout>
      <Breadcrumb className="bread-style">
        <Breadcrumb.Item noLink={true}>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item noLink={true}>角色管理</Breadcrumb.Item>
      </Breadcrumb>
      <Card className="card-style">
        <div className="action-style">
          <Tooltip content="添加角色">
            <Button
              theme="borderless"
              icon={<IconPlus />}
              aria-label="添加角色"
              onClick={showDialog}
            />
          </Tooltip>
          <Modal
            title="添加角色"
            visible={visible}
            centered
            onOk={addUserConfirm}
            onCancel={addUserCancel}
            maskClosable={false}
            confirmLoading={dialogDisabled}
          >
            <Form
              wrapperCol={{ span: 18 }}
              labelCol={{ span: 6 }}
              labelPosition="left"
              labelAlign="right"
              onSubmit={onSubmit}
              getFormApi={bindFormApi}
              disabled={dialogDisabled}
            >
              <Form.Input
                field="name"
                label="角色名"
                placeholder={"角色名"}
                trigger="blur"
                rules={[{ required: true, message: "请输入角色名" }]}
              />
              <Form.Input
                field="identifier"
                label="标识值"
                placeholder={"标识值"}
                trigger="blur"
                rules={[{ required: true, message: "请输入标识值" }]}
              />
              <Form.Input
                field="description"
                label="描述"
                initValue=""
                placeholder={"描述"}
              />
              <Form.CheckboxGroup
                field="permissions"
                label="权限"
                options={permissions}
                direction="horizontal"
                rules={[{ required: true, message: "请至少选择一个权限" }]}
              />
            </Form>
          </Modal>
          <Tooltip content="刷新表格">
            <Button
              theme="borderless"
              icon={<IconRefresh />}
              aria-label="刷新页面"
              className="action-btn-style"
              onClick={refreshAll}
            />
          </Tooltip>
        </div>
        <Table
          columns={columns}
          dataSource={queryResult.data}
          onChange={tableChange}
          pagination={{
            currentPage: queryResult.pageNumber,
            pageSize: queryResult.pageSize,
            total: queryResult.totalSize,
            showSizeChanger: true,
            onChange: handleChange,
          }}
          loading={loading}
        />
      </Card>
    </Layout>
  );
}
