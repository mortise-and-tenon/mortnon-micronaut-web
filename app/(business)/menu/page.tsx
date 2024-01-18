"use client";

import { useState, useEffect, useRef } from "react";
import {
  Layout,
  Breadcrumb,
  Card,
  Tooltip,
  Button,
  Table,
  Modal,
  Form,
  Toast,
} from "@douyinfe/semi-ui";
import { IconRefresh, IconPlus } from "@douyinfe/semi-icons";

import {
  QueryInfo,
  BaesQueryResult,
  LogInfo,
  ColumnFilter,
  ProjectInfo,
  MenuInfo,
  TreeNode,
} from "@/app/lib/definitions";

import "../style.css";

const { Content } = Layout;

//查询组织数据结果定义
export type QueryResult = BaesQueryResult & {
  //数据
  data: Array<MenuInfo>;
};

//创建组织数据定义
export type CreateMenuData = {
  parent_id: number;
  name: string;
  icon: string;
  url: string;
  order: number;
  permission: string;
};

const convertMenu = (parent: MenuInfo, children: [], treeNode: TreeNode) => {
  const childrenList: Array<MenuInfo> = new Array<MenuInfo>();
  const treeNodeList: Array<TreeNode> = new Array<TreeNode>();

  children.forEach((child) => {
    const menuInfo: MenuInfo = {
      key: child.id,
      name: child.name,
      url: child.url,
      icon: child.icon,
      order: child.order,
      permission: child.permission,
      children: [],
    };

    const treeNodeChild: TreeNode = {
      key: child.id,
      label: child.name,
      children: [],
    };

    if (child.children && child.children.length > 0) {
      convertMenu(menuInfo, child.children, treeNodeChild);
    }

    childrenList.push(menuInfo);
    treeNodeList.push(treeNodeChild);
  });

  parent.children = childrenList;
  treeNode.children = treeNodeList;
};

export default function Menu() {
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
    property: "time",
    order: "desc",
  } as QueryInfo);

  //菜单树
  const [treeData, setMenuTreeData] = useState([] as Array<TreeNode>);

  //获取菜单数据
  async function getMenu(
    queryInfo: QueryInfo,
    setQueryResult: React.Dispatch<React.SetStateAction<QueryResult>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setTreeData: React.Dispatch<React.SetStateAction<Array<TreeNode>>>
  ) {
    try {
      const response = await fetch(`/api/menus`);
      if (response.ok) {
        const body = await response.json();
        const data = body.data;
        const menuList: Array<MenuInfo> = new Array<MenuInfo>();
        const treeNodeList: Array<TreeNode> = new Array<TreeNode>();

        const rootTreeNode: TreeNode = {
          key: "0",
          label: "根目录",
          children: [],
        };

        const rooTreeNodeList: Array<TreeNode> = new Array<TreeNode>();

        rooTreeNodeList.push(rootTreeNode);

        data.forEach((menu) => {
          if (menu.id === 1) {
            return;
          }

          const menuInfo: MenuInfo = {
            key: menu.id,
            parentId: menu.parent_id,
            name: menu.name,
            url: menu.url,
            icon: menu.icon,
            order: menu.order,
            permission: menu.permission,
            children: [],
          };

          const treeNode: TreeNode = {
            key: menu.id,
            label: menu.name,
            children: [],
          };

          if (menu.children && menu.children.length > 0) {
            convertMenu(menuInfo, menu.children, treeNode);
          }

          menuList.push(menuInfo);
          treeNodeList.push(treeNode);
        });

        rootTreeNode.children = treeNodeList;

        //绑定查询到的数据
        //前台semi默认页数从1开始，后端从0开始
        const queryResult: QueryResult = {
          pageNumber: 1,
          totalPages: 1,
          pageSize: 10,
          totalSize: 1,
          data: menuList,
        };

        console.log("menu:", menuList);
        setQueryResult(queryResult);
        setLoading(false);
        setTreeData(rooTreeNodeList);
      }
    } catch (error) {
      console.log("error:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    getMenu(queryInfo, setQueryResult, setLoading, setMenuTreeData);
  }, [queryInfo]);

  //是否展示模态框
  const [visible, setVisible] = useState(false);
  //模态框中的表单是否禁用
  const [dialogDisabled, setDialogDisabled] = useState(false);
  const formApiRef = useRef();
  const editFormApiRef = useRef();

  //获取Form的 formApi，用于模态框的按钮手动提交表单
  const bindFormApi = (formApi) => {
    formApiRef.current = formApi;
  };

  const bindEditFormApi = (formApi) => {
    console.log("edit formapi");
    editFormApiRef.current = formApi;
  };

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

  //初始刷新表格数据
  const refreshAll = () => {
    refreshTable(0, defaultPageSize, "", "");
  };

  //操作的行菜单数据
  const [rowMenuInfo, setRowMenuInfo] = useState({} as MenuInfo);
  //删除行菜单对话框是否可见
  const [deleteDialogVisiable, setDeleteDialogVisiable] = useState(false);
  //编辑行用户对话框是否可见
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  //删除行菜单确定
  const handleDeleteOk = async () => {
    setDialogDisabled(true);
    try {
      const response = await fetch(`/api/menus/${rowMenuInfo.key}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        Toast.success("删除菜单成功");
        setDeleteDialogVisiable(false);
        //操作成功后刷新表格
        refreshAll();
      } else if (response.status == 403) {
        Toast.error(`你无权删除菜单！`);
      } else {
        const body = await response.json();
        Toast.error(`${body.message}，删除菜单失败，请重试`);
      }
    } catch (error) {
      console.log("delete menu error:", error);
    } finally {
      setDialogDisabled(false);
    }
  };

  //删除行菜单取消
  const handleDeleteCancel = () => {
    setDeleteDialogVisiable(false);
  };

  //编辑行菜单确定
  const handleEditOk = async () => {
    if (editFormApiRef.current != null) {
      editFormApiRef.current.submitForm();
    } else {
      Toast.error("发生异常，请刷新重试");
      console.log("editFormApiRef error,can't submit form.");
    }
  };

  //编辑行菜单取消
  const handleEditCancel = () => {
    setEditDialogVisible(false);
  };

  //提交编辑菜单信息
  const onEditSubmit = async (values) => {
    setDialogDisabled(true);
    const editMenuData = {
      id: rowMenuInfo.key,
      parent_id: rowMenuInfo.parentId,
      name: values.name,
      url: values.url,
      icon: values.icon,
      order: values.order,
      permission: values.permission,
    };

    try {
      const response = await fetch("/api/menus", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editMenuData),
        credentials: "include",
      });

      if (response.ok) {
        Toast.success("修改菜单成功");
        setEditDialogVisible(false);
        //操作成功后刷新表格
        refreshAll();
      } else {
        Toast.error("修改菜单失败");
      }
    } catch (error) {
    } finally {
      setDialogDisabled(false);
    }
  };

  //表格列定义
  const columns = [
    {
      title: "菜单名称",
      dataIndex: "name",
    },
    {
      title: "图标",
      dataIndex: "icon",
    },
    {
      title: "权限标识",
      dataIndex: "permission",
    },
    {
      title: "排序",
      dataIndex: "order",
    },
    {
      title: "链接",
      dataIndex: "url",
    },
    {
      title: "操作",
      render: (text, record: MenuInfo, index) => {
        const deleteProps = {};
        const editProps = {};

        if (record.key == 1) {
          deleteProps.disabled = true;
        }
        deleteProps.onClick = async () => {
          setDeleteDialogVisiable(true);
          setRowMenuInfo(record);
        };
        editProps.onClick = () => {
          getMenu(queryInfo, setQueryResult, setLoading, setMenuTreeData);
          setEditDialogVisible(true);
          setRowMenuInfo(record);
        };

        return (
          <>
            <Button theme="borderless" {...deleteProps}>
              删除
            </Button>
            <Modal
              title="删除菜单"
              visible={deleteDialogVisiable}
              centered
              maskStyle={{ backgroundColor: "rgba(244,244,244,0.2)" }}
              maskClosable={false}
              onOk={handleDeleteOk}
              onCancel={handleDeleteCancel}
              confirmLoading={dialogDisabled}
            >
              确定删除菜单 {rowMenuInfo.name} ？
            </Modal>
            <Button theme="borderless" {...editProps}>
              编辑
            </Button>
            <Modal
              title="编辑菜单"
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
                getFormApi={bindEditFormApi}
                disabled={dialogDisabled}
              >
                <Form.Input
                  field="name"
                  label="菜单名称"
                  placeholder={"菜单名称"}
                  initValue={rowMenuInfo.name}
                  trigger="blur"
                  rules={[{ required: true, message: "请输入菜单名称" }]}
                />
                <Form.Input
                  field="url"
                  label="链接"
                  initValue={rowMenuInfo.url}
                  placeholder={"请输入菜单链接"}
                  rules={[{ required: true, message: "请输入菜单链接" }]}
                />
                <Form.Input
                  field="icon"
                  label="图标"
                  initValue={rowMenuInfo.icon}
                  placeholder={"图标"}
                />
                <Form.InputNumber
                  min={0}
                  max={Number.MAX_SAFE_INTEGER}
                  style={{ width: "100%" }}
                  field="order"
                  label="排序"
                  initValue={rowMenuInfo.order}
                  placeholder={"菜单排序"}
                />
                <Form.Input
                  field="permission"
                  label="权限标识"
                  placeholder={"权限标识"}
                  initValue={rowMenuInfo.permission}
                  rules={[{ required: true, message: "请输入权限标识" }]}
                />
              </Form>
            </Modal>
          </>
        );
      },
    },
  ];

  //添加菜单
  const onSubmit = async (values) => {
    //提交时禁用表单和按钮
    setDialogDisabled(true);

    console.log("add menu:", values);

    const createMenuData: CreateMenuData = {
      parent_id: values.parentId,
      name: values.name,
      icon: values.icon,
      url: values.url,
      order: values.order,
      permission: values.permission,
    };

    try {
      const response = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createMenuData),
        credentials: "include",
      });

      //创建组织成功
      if (response.ok) {
        Toast.success("添加菜单成功");
        //操作成功后关闭模态框
        setVisible(false);
        //操作成功后刷新表格
        refreshAll();
      } else if (response.status == 400) {
        const body = await response.json();
        const msg = body.message;
        Toast.error(`${msg}，请修改后重试`);
      } else {
        Toast.error("添加菜单失败，请重试");
      }
    } catch (error) {
      console.log("create menu fail:", error);
      Toast.error("发生异常，请重试");
    } finally {
      //提交流程结束，恢复表单状态
      setDialogDisabled(false);
    }
  };

  //点击添加菜单窗口确认按钮
  const addMenuConfirm = async () => {
    console.log("confirm");
    if (formApiRef.current != null) {
      formApiRef.current.submitForm();
    } else {
      Toast.error("发生异常，请刷新重试");
      console.log("formapi error,can't submit form.");
    }
  };

  return (
    <Layout>
      <Breadcrumb className="bread-style">
        <Breadcrumb.Item noLink={true}>系统管理</Breadcrumb.Item>
        <Breadcrumb.Item noLink={true}>菜单管理</Breadcrumb.Item>
      </Breadcrumb>
      <Card className="card-style">
        <div className="action-style">
          <Tooltip content="添加菜单">
            <Button
              theme="borderless"
              icon={<IconPlus />}
              aria-label="添加菜单"
              onClick={() => setVisible(true)}
            />
          </Tooltip>
          <Modal
            title="添加菜单"
            visible={visible}
            centered
            onOk={addMenuConfirm}
            onCancel={() => setVisible(false)}
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
              <Form.TreeSelect
                field="parentId"
                label="上级菜单"
                placeholder="请选择上级菜单"
                style={{ width: "100%" }}
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                treeData={treeData}
                rules={[{ required: true, message: "请选择上级菜单" }]}
              />
              <Form.Input
                field="name"
                label="菜单名称"
                placeholder={"菜单名称"}
                trigger="blur"
                rules={[{ required: true, message: "请输入菜单名称" }]}
              />
              <Form.Input
                field="url"
                label="链接"
                placeholder={"菜单链接"}
                rules={[{ required: true, message: "请输入菜单链接" }]}
              />
              <Form.Input
                field="icon"
                label="图标"
                initValue="IconArticle"
                placeholder={"请输入图标"}
              />
              <Form.InputNumber
                min={0}
                max={Number.MAX_SAFE_INTEGER}
                style={{ width: "100%" }}
                field="order"
                label="排序"
                placeholder={"菜单排序"}
              />
              <Form.Input
                field="permission"
                label="权限标识"
                placeholder={"权限标识"}
                rules={[{ required: true, message: "请输入权限标识" }]}
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
          loading={loading}
        />
      </Card>
    </Layout>
  );
}
