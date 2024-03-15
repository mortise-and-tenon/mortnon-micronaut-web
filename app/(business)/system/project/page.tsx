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
import {
  ModalForm,
  PageContainer,
  ProForm,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
  ProFormTreeSelect,
  ProTable,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { Button, message, Modal, Space, Tag } from "antd";
import { useRouter } from "next/navigation";

import {
  faArrowsUpDown,
  faCheck,
  faPenToSquare,
  faToggleOff,
  faToggleOn,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useContext, useRef, useState } from "react";
import SkeletonModal from "@/app/_modules/SkeletonModal";
import { GlobalContext } from "@/app/_modules/globalProvider";
import { UserPermission } from "@/app/_modules/definies";

//查询表格数据API
const queryAPI = "/api/projects/tree";
//新建数据API
const newAPI = "/api/projects";
//修改数据API
const modifyAPI = "/api/projects";
//查询详情数据API
const queryDetailAPI = "/api/projects";
//删除API
const deleteAPI = "/api/projects";

export default function Project() {
  const { push } = useRouter();

  //全局的权限数据
  const { globalPermission } = useContext(GlobalContext);

  //表格列定义
  const columns: ProColumns[] = [
    {
      title: "部门名称",
      fieldProps: {
        placeholder: "请输入部门名称",
      },
      dataIndex: "name",
      order: 2,
      render: (text, record) => {
        return globalPermission.includes(UserPermission.USER_ASSIGNMENT) ? (
          <a onClick={() => push(`/system/project/auth/${record.id}`)}>
            {text}
          </a>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: "标识值",
      dataIndex: "identifier",
      search: false,
    },
    {
      title: "排序",
      dataIndex: "order",
      width: 48,
      search: false,
    },
    {
      title: "备注",
      dataIndex: "description",
      ellipsis: true,
      search: false,
    },
    {
      title: "创建时间",
      dataIndex: "time",
      valueType: "dateTime",
      ellipsis: true,
      search: false,
    },
    {
      title: "操作",
      key: "option",
      search: false,
      render: (_, record) => {
        if (globalPermission.includes(UserPermission.PROJECT_UPDATE)) {
          if (record.id == 1) {
            return [
              <Button
                key="modifyBtn"
                type="link"
                icon={<FontAwesomeIcon icon={faPenToSquare} />}
                onClick={() => onClickShowRowModifyModal(record)}
              >
                编辑
              </Button>,
              <Button
                key="newBtn"
                type="link"
                icon={<PlusOutlined />}
                onClick={() => onClickAdd(record)}
              >
                新建
              </Button>,
            ];
          } else {
            return [
              <Button
                key="modifyBtn"
                type="link"
                icon={<FontAwesomeIcon icon={faPenToSquare} />}
                onClick={() => onClickShowRowModifyModal(record)}
              >
                编辑
              </Button>,
              <Button
                key="newBtn"
                type="link"
                icon={<PlusOutlined />}
                onClick={() => onClickAdd(record)}
              >
                新建
              </Button>,
              <Button
                key="deleteBtn"
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onClickDeleteRow(record)}
              >
                删除
              </Button>,
            ];
          }
        }
      },
    },
  ];

  //0.查询表格数据

  //原始的可展开的所有行的 id
  const [defaultExpandKeys, setDefaultExpandKeys] = useState<any[]>([]);

  //控制行展开的数据
  const [expandKeys, setExpandKeys] = useState<any[]>([]);

  const queryTableData = async (params: any, sorter: any, filter: any) => {
    const searchParams = {
      ...params,
    };

    const queryParams = new URLSearchParams(searchParams);

    Object.keys(sorter).forEach((key) => {
      queryParams.append("property", key);
      if (sorter[key] === "ascend") {
        queryParams.append("order", "asc");
      } else {
        queryParams.append("order", "desc");
      }
    });

    const body = await fetchApi(`${queryAPI}?${queryParams}`, push);

    if (body === undefined) {
      return undefined;
    } else {
      if (!body.success) {
        message.error(body.message);
        return undefined;
      }
    }

    const dataArray = body.data;

    dataArray.forEach((item: any) => {
      parseChild(item);
    });

    const newExpandedKeys: any[] = [];
    const render = (treeDatas: any[]) => {
      // 获取到所有可展开的父节点
      treeDatas.map((item) => {
        if (item.children) {
          newExpandedKeys.push(item.id);
          render(item.children);
        }
      });
      return newExpandedKeys;
    };

    const keys = render(dataArray);
    setDefaultExpandKeys(keys);
    setExpandKeys(keys);
    return dataArray;
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

  //1.新建

  const [showAddModal, setShowAddModal] = useState(false);

  //新建表单是否带有父节点id
  const [rowParentId, setRowParentId] = useState(1);

  //点击新建，如果从行点击新建，给定父组织
  const onClickAdd = (record?: any) => {
    setRowParentId(record.id);
    setShowAddModal(true);
  };

  const cancelAddModal = () => {
    setShowAddModal(false);
    setRowParentId(1);
  };

  //确定新建数据
  const executeAddData = async (values: any) => {
    const body = await fetchApi(newAPI, push, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (body != undefined) {
      if (body.success) {
        message.success("添加成功");
        if (actionTableRef.current) {
          actionTableRef.current.reload();
        }
        setShowAddModal(false);
        return true;
      }

      message.error(body.message);
      return false;
    }
    return false;
  };

  //2.修改

  //是否展示修改对话框
  const [isShowModifyDataModal, setIsShowModifyDataModal] = useState(false);

  //编辑框加载状态
  const [editLoading, setEditLoading] = useState(true);

  //展示修改对话框
  const onClickShowRowModifyModal = (record: any) => {
    setEditLoading(true);
    queryRowData(record);
    setIsShowModifyDataModal(true);
  };

  //修改数据表单引用
  const modifyFormRef = useRef<ProFormInstance>();

  //操作当前数据的附加数据
  const [operatRowData, setOperateRowData] = useState<{
    [key: string]: any;
  }>({});

  //顶级部门编辑时不展示父部门
  const [showParentProject, setShowParentProject] = useState(true);

  //查询并加载待修改数据的详细信息
  const queryRowData = async (record: any) => {
    const id = record.id;

    operatRowData["id"] = id;

    setShowParentProject(id !== 1);

    setOperateRowData(operatRowData);

    if (id !== undefined) {
      const body = await fetchApi(`${queryDetailAPI}/${id}`, push);

      if (body !== undefined) {
        if (body.success) {
          modifyFormRef?.current?.setFieldsValue({
            //需要加载到修改表单中的数据
            parent_id: body.data.parent_id,
            name: body.data.name,
            order: body.data.order,
            status: body.data.status,
            description: body.data.description,
          });

          setEditLoading(false);
        } else {
          message.error(body.message);
        }
      }
    }
  };

  //确认修改数据
  const executeModifyData = async (values: any) => {
    values["id"] = operatRowData["id"];

    const body = await fetchApi(modifyAPI, push, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    if (body !== undefined) {
      if (body.success) {
        message.success(body.msg);
        //刷新列表
        if (actionTableRef.current) {
          actionTableRef.current.reload();
        }
        setIsShowModifyDataModal(false);
        return true;
      }
      message.error(body.message);
      return false;
    }
  };

  //3.展开/折叠

  //点击展开/折叠按钮
  const onClickExpandRow = () => {
    if (expandKeys.length > 0) {
      setExpandKeys([]);
    } else {
      setExpandKeys(defaultExpandKeys);
    }
  };

  //处理行的展开/折叠逻辑
  const handleExpand = (expanded: boolean, record: any) => {
    let keys = [...expandKeys];

    if (expanded) {
      keys.push(record.id);
    } else {
      keys = keys.filter((key: number) => key !== record.id);
    }

    setExpandKeys(keys);
  };

  //4.导出

  //5.选择行

  //搜索栏显示状态
  const [showSearch, setShowSearch] = useState(true);
  //action对象引用
  const actionTableRef = useRef<ActionType>();
  //搜索表单对象引用
  const searchTableFormRef = useRef<ProFormInstance>();

  const getDeptList = async () => {
    const body = await fetchApi(queryAPI, push);
    if (body !== undefined) {
      if (!body.success) {
        message.error(body.message);
        return [];
      }
      body.data.forEach((item: any) => {
        parseChild(item);
      });

      return body.data;
    }
  };

  //点击删除按钮
  const onClickDeleteRow = (record: any) => {
    Modal.confirm({
      title: "系统提示",
      icon: <ExclamationCircleFilled />,
      content: `确定删除部门名称为“${record.name}”${
        record.children?.length > 0 ? "及子部门" : ""
      }的数据项？`,
      onOk() {
        executeDeleteRow(record.id);
      },
      onCancel() {},
    });
  };

  //确定删除选中的部门
  const executeDeleteRow = async (roleId: any) => {
    const body = await fetchApi(`${deleteAPI}/${roleId}`, push, {
      method: "DELETE",
    });
    if (body !== undefined) {
      if (body.success) {
        message.success("删除成功");
        //刷新列表
        if (actionTableRef.current) {
          actionTableRef.current.reload();
        }
      } else {
        message.error(body.message);
      }
    }
  };

  return (
    <PageContainer title={false}>
      <ProTable
        formRef={searchTableFormRef}
        rowKey="id"
        columns={columns}
        expandable={{
          expandedRowKeys: expandKeys,
          onExpand: handleExpand,
        }}
        request={async (params: any, sorter: any, filter: any) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          const data = await queryTableData(params, sorter, filter);
          if (data !== undefined) {
            return Promise.resolve({
              data: data,
              success: true,
              total: data.length,
            });
          }
          return Promise.resolve({
            data: [],
            success: true,
          });
        }}
        pagination={false}
        search={
          showSearch
            ? {
                defaultCollapsed: false,
                searchText: "搜索",
              }
            : false
        }
        dateFormatter="string"
        actionRef={actionTableRef}
        toolbar={{
          actions: [
            globalPermission.includes(UserPermission.PROJECT_UPDATE) && (
              <ModalForm
                key="addmodal"
                title="添加部门"
                open={showAddModal}
                trigger={
                  <Button icon={<PlusOutlined />} type="primary">
                    新建
                  </Button>
                }
                autoFocusFirstInput
                modalProps={{
                  destroyOnClose: true,
                  onCancel: () => {
                    cancelAddModal();
                  },
                }}
                submitTimeout={2000}
                onFinish={executeAddData}
              >
                <ProForm.Group>
                  <ProFormTreeSelect
                    width="md"
                    name="parent_id"
                    initialValue={rowParentId}
                    label="上级部门"
                    placeholder="请选择上级部门"
                    rules={[{ required: true, message: "请选择上级部门" }]}
                    request={getDeptList}
                    fieldProps={{
                      filterTreeNode: true,
                      showSearch: true,
                      treeNodeFilterProp: "label",
                      fieldNames: {
                        label: "name",
                        value: "id",
                      },
                    }}
                  />
                  <ProFormText
                    width="md"
                    name="name"
                    autoFocus
                    label="部门名称"
                    placeholder="请输入部门名称"
                    rules={[{ required: true, message: "请输入部门名称" }]}
                  />
                </ProForm.Group>
                <ProForm.Group>
                  <ProFormDigit
                    fieldProps={{ precision: 0 }}
                    width="md"
                    name="order"
                    initialValue="1"
                    label="排序"
                    placeholder="请输入排序"
                    rules={[{ required: true, message: "请输入排序" }]}
                  />
                  <ProFormRadio.Group
                    name="status"
                    width="sm"
                    label="状态"
                    initialValue={true}
                    options={[
                      {
                        label: "正常",
                        value: true,
                      },
                      {
                        label: "停用",
                        value: false,
                      },
                    ]}
                  />
                </ProForm.Group>
                <ProFormTextArea
                  name="description"
                  width={688}
                  label="备注"
                  placeholder="请输入内容"
                />
              </ModalForm>
            ),
            <Button
              key="expand"
              icon={<FontAwesomeIcon icon={faArrowsUpDown} />}
              onClick={() => onClickExpandRow()}
            >
              折叠/展开
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
                if (actionTableRef.current) {
                  actionTableRef.current.reload();
                }
              },
            },
          ],
        }}
      />
      <ModalForm
        key="modifymodal"
        title="编辑部门"
        formRef={modifyFormRef}
        open={isShowModifyDataModal}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setIsShowModifyDataModal(false);
          },
        }}
        submitTimeout={2000}
        onFinish={executeModifyData}
      >
        {editLoading ? (
          <SkeletonModal />
        ) : (
          <>
            <ProForm.Group>
              {showParentProject && (
                <ProFormTreeSelect
                  width="md"
                  name="parent_id"
                  label="上级部门"
                  placeholder="请选择上级部门"
                  rules={[{ required: true, message: "请选择上级部门" }]}
                  request={getDeptList}
                  fieldProps={{
                    filterTreeNode: true,
                    showSearch: true,
                    treeNodeFilterProp: "label",
                    fieldNames: {
                      label: "name",
                      value: "id",
                    },
                  }}
                />
              )}

              <ProFormText
                width="md"
                name="name"
                label="部门名称"
                placeholder="请输入部门名称"
                rules={[{ required: true, message: "请输入部门名称" }]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormDigit
                fieldProps={{ precision: 0 }}
                width="md"
                name="order"
                initialValue="1"
                label="排序"
                placeholder="请输入排序"
                rules={[{ required: true, message: "请输入排序" }]}
              />
              <ProFormRadio.Group
                name="status"
                width="sm"
                label="状态"
                initialValue={true}
                options={[
                  {
                    label: "正常",
                    value: true,
                  },
                  {
                    label: "停用",
                    value: false,
                  },
                ]}
              />
              <ProFormTextArea
                name="description"
                width={688}
                label="备注"
                placeholder="请输入内容"
              />
            </ProForm.Group>
          </>
        )}
      </ModalForm>
    </PageContainer>
  );
}
