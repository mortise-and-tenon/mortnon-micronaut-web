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
} from "@/app/lib/definitions";

import "../style.css";

const { Content } = Layout;

//查询组织数据结果定义
export type QueryResult = BaesQueryResult & {
  //数据
  data: Array<ProjectInfo>;
};

//创建组织数据定义
export type CreateProjectData = {
  parent_id: number;
  name: string;
  description: string;
};

//获取日志数据
export async function getLog(
  queryInfo: QueryInfo,
  setQueryResult: React.Dispatch<React.SetStateAction<QueryResult>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    const response = await fetch(`/api/projects/tree`);
    if (response.ok) {
      const body = await response.json();
      const project = body.data;
      const projectList: Array<ProjectInfo> = new Array<ProjectInfo>();

      const projectInfo: ProjectInfo = {
        key: project.id,
        name: project.name,
        label: project.name,
        description: project.description,
        children: [],
      };
      if (project.children && project.children.length > 0) {
        convertProject(projectInfo, project.children);
      }

      projectList.push(projectInfo);

      //绑定查询到的数据
      //前台semi默认页数从1开始，后端从0开始
      const queryResult: QueryResult = {
        pageNumber: 1,
        totalPages: 1,
        pageSize: 10,
        totalSize: 1,
        data: projectList,
      };

      console.log("log:", projectList);
      setQueryResult(queryResult);
      setLoading(false);
    }
  } catch (error) {
    console.log("error:", error);
    setLoading(false);
  }
}

const convertProject = (parent: ProjectInfo, children: []) => {
  const childrenList: Array<ProjectInfo> = new Array<ProjectInfo>();

  children.forEach((child) => {
    const projectInfo: ProjectInfo = {
      key: child.id,
      name: child.name,
      label: child.name,
      description: child.description,
      children: [],
    };

    if (child.children && child.children.length > 0) {
      convertProject(projectInfo, child.children);
    }

    childrenList.push(projectInfo);
  });

  parent.children = childrenList;
};

export default function Org() {
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

  useEffect(() => {
    getLog(queryInfo, setQueryResult, setLoading);
  }, [queryInfo]);

  //是否展示模态框
  const [visible, setVisible] = useState(false);
  //模态框中的表单是否禁用
  const [dialogDisabled, setDialogDisabled] = useState(false);
  const formApiRef = useRef();

  //获取Form的 formApi，用于模态框的按钮手动提交表单
  const bindFormApi = (formApi) => {
    formApiRef.current = formApi;
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

  //操作的行组织数据
  const [rowProjectInfo, setRowProjectInfo] = useState({} as ProjectInfo);
  //删除行用户对话框是否可见
  const [deleteDialogVisiable, setDeleteDialogVisiable] = useState(false);
  //编辑行用户对话框是否可见
  const [editDialogVisible, setEditDialogVisible] = useState(false);

  //删除行用户确定
  const handleDeleteOk = async () => {
    setDialogDisabled(true);
    try {
      const response = await fetch(`/api/projects/${rowProjectInfo.key}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        Toast.success("删除组织成功");
        setDeleteDialogVisiable(false);
        //操作成功后刷新表格
        refreshAll();
      } else if (response.status == 403) {
        Toast.error(`你无权删除组织！`);
      } else {
        const body = await response.json();
        Toast.error(`${body.message}，删除组织失败，请重试`);
      }
    } catch (error) {
      console.log("delete project error:", error);
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
    if (formApiRef.current != null) {
      formApiRef.current.submitForm();
    } else {
      Toast.error("发生异常，请刷新重试");
      console.log("formapi error,can't submit form.");
    }
  };

  //编辑行用户取消
  const handleEditCancel = () => {
    setEditDialogVisible(false);
  };

  //提交编辑用户信息
  const onEditSubmit = async (values) => {
    setDialogDisabled(true);
    const editUserData = {
      id: rowProjectInfo.key,
      name: values.name,
      description: values.description,
    };

    try {
      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editUserData),
        credentials: "include",
      });

      if (response.ok) {
        Toast.success("修改组织成功");
        setEditDialogVisible(false);
        //操作成功后刷新表格
        refreshAll();
      } else {
        Toast.error("修改组织失败");
      }
    } catch (error) {
    } finally {
      setDialogDisabled(false);
    }
  };

  //表格列定义
  const columns = [
    {
      title: "组织名",
      dataIndex: "name",
    },
    {
      title: "描述",
      dataIndex: "description",
    },
    {
      title: "操作",
      render: (text, record: ProjectInfo, index) => {
        const deleteProps = {};
        const editProps = {};

        if (record.key == 1) {
          deleteProps.disabled = true;
        }
        deleteProps.onClick = async () => {
          setDeleteDialogVisiable(true);
          setRowProjectInfo(record);
        };
        editProps.onClick = () => {
          setEditDialogVisible(true);
          setRowProjectInfo(record);
        };

        return (
          <>
            <Button theme="borderless" {...deleteProps}>
              删除
            </Button>
            <Modal
              title="删除组织"
              visible={deleteDialogVisiable}
              centered
              maskStyle={{ backgroundColor: "rgba(244,244,244,0.2)" }}
              maskClosable={false}
              onOk={handleDeleteOk}
              onCancel={handleDeleteCancel}
              confirmLoading={dialogDisabled}
            >
              确定删除组织 {rowProjectInfo.name} ？
            </Modal>
            <Button theme="borderless" {...editProps}>
              编辑
            </Button>
            <Modal
              title="编辑组织"
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
                  label="组织名"
                  initValue={rowProjectInfo.name}
                  trigger="blur"
                  rules={[{ required: true, message: "请输入组织名" }]}
                />
                <Form.Input
                  field="description"
                  label="描述"
                  placeholder={"描述"}
                  initValue={rowProjectInfo.description}
                />
              </Form>
            </Modal>
          </>
        );
      },
    },
  ];

  //添加组织
  const onSubmit = async (values) => {
    //提交时禁用表单和按钮
    setDialogDisabled(true);

    console.log("project:", values);

    const createProjectData: CreateProjectData = {
      parent_id: values.parentId,
      name: values.name,
      description: values.description,
    };

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createProjectData),
        credentials: "include",
      });

      //创建组织成功
      if (response.ok) {
        Toast.success("添加组织成功");
        //操作成功后关闭模态框
        setVisible(false);
        //操作成功后刷新表格
        refreshAll();
      } else if (response.status == 400) {
        const body = await response.json();
        const msg = body.message;
        Toast.error(`${msg}，请修改后重试`);
      } else {
        Toast.error("添加组织失败，请重试");
      }
    } catch (error) {
      console.log("create use fail:", error);
      Toast.error("发生异常，请重试");
    } finally {
      //提交流程结束，恢复表单状态
      setDialogDisabled(false);
    }
  };

  //点击添加组织窗口确认按钮
  const addUserConfirm = async () => {
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
        <Breadcrumb.Item noLink={true}>组织管理</Breadcrumb.Item>
      </Breadcrumb>
      <Card className="card-style">
        <div className="action-style">
          <Tooltip content="添加组织">
            <Button
              theme="borderless"
              icon={<IconPlus />}
              aria-label="添加用户"
              onClick={() => setVisible(true)}
            />
          </Tooltip>
          <Modal
            title="添加组织"
            visible={visible}
            centered
            onOk={addUserConfirm}
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
                label="选择父组织"
                placeholder="请选择组织"
                style={{ width: "100%" }}
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                treeData={queryResult.data}
                rules={[{ required: true, message: "请选择组织" }]}
              />
              <Form.Input
                field="name"
                label="组织名"
                placeholder={"组织名"}
                trigger="blur"
                rules={[{ required: true, message: "请输入组织名" }]}
              />
              <Form.Input
                field="description"
                label="描述"
                placeholder={"请输入组织描述"}
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
          defaultExpandAllRows
          loading={loading}
        />
      </Card>
    </Layout>
  );
}
