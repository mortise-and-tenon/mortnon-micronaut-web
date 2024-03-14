"use client";

import { fetchApi } from "@/app/_modules/func";
import {
  CaretDownOutlined,
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
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProTable,
} from "@ant-design/pro-components";
import { Button, Dropdown, message, Modal, Space } from "antd";
import { useRouter } from "next/navigation";

import {
  faPenToSquare,
  faToggleOff,
  faToggleOn,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useContext, useRef, useState } from "react";
import { GlobalContext } from "@/app/_modules/globalProvider";
import { UserPermission } from "@/app/_modules/definies";
import SkeletonModal from "@/app/_modules/SkeletonModal";

//查询表格数据API
const queryAPI = "/api/roles";
//新建数据API
const newAPI = "/api/roles";
//修改数据API
const modifyAPI = "/api/roles";
//查询详情数据API
const queryDetailAPI = "/api/roles";
//删除API
const deleteAPI = "/api/roles";
//导出API
const exportAPI = "/api/roles/export";
//导出文件前缀名
const exportFilePrefix = "角色";

export default function Role() {
  const { push } = useRouter();

  //全局的权限数据
  const { globalPermission } = useContext(GlobalContext);

  //表格列定义
  const columns: ProColumns[] = [
    {
      title: "编号",
      dataIndex: "id",
      width: 48,
      search: false,
    },
    {
      title: "名称",
      dataIndex: "name",
      sorter: true,
      order: 3,
      render: (text, record) => {
        return globalPermission.includes(UserPermission.USER_ASSIGNMENT) ? (
          <a onClick={() => push(`/system/role/auth/${record.id}`)}>{text}</a>
        ) : (
          <span>{text}</span>
        );
      },
    },
    {
      title: "标识值",
      dataIndex: "identifier",
      ellipsis: true,
      width: 128,
      order: 2,
    },
    {
      title: "备注",
      dataIndex: "description",
      ellipsis: true,
      search: false,
    },
    {
      title: "创建时间",
      dataIndex: "gmt_create",
      valueType: "dateTime",
      ellipsis: true,
      search: false,
    },
    {
      title: "操作",
      key: "option",
      search: false,
      render: (_, record) => {
        if (
          record.id != 1 &&
          globalPermission.includes(UserPermission.ROLE_UPDATE)
        )
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
              key="deleteBtn"
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onClickDeleteRow(record)}
            >
              删除
            </Button>,
          ];
      },
    },
  ];

  //0.查询表格数据
  const queryTableData = async (params: any, sorter: any, filter: any) => {
    const searchParams = {
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

    const body = await fetchApi(`${queryAPI}?${queryParams}`, push);

    if (body !== undefined) {
      if (!body.success) {
        message.error(body.message);
        return undefined;
      }
    }

    return body;
  };

  //1.新建

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
        message.success("新建成功");
        if (actionTableRef.current) {
          actionTableRef.current.reload();
        }
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

  //是否加载编辑数据
  const [editLoading, setEditLoading] = useState(true);

  //展示修改对话框
  const onClickShowRowModifyModal = (record?: any) => {
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

  //查询并加载待修改数据的详细信息
  const queryRowData = async (record?: any) => {
    const id = record.id;

    operatRowData["id"] = id;

    setOperateRowData(operatRowData);

    if (id !== undefined) {
      const body = await fetchApi(`${queryDetailAPI}/${id}`, push);

      if (body !== undefined) {
        if (body.success) {
          modifyFormRef?.current?.setFieldsValue({
            //需要加载到修改表单中的数据
            name: body.data.name,
            identifier: body.data.identifier,
            status: body.data.status,
            description: body.data.description,
            permissions: body.data.permissions.map((item: any) => item.id),
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
        message.success("修改成功");
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

  //3.删除

  //点击删除按钮，展示删除确认框
  const onClickDeleteRow = (record?: any) => {
    Modal.confirm({
      title: "系统提示",
      icon: <ExclamationCircleFilled />,
      content: `确定删除角色名称为“${record.name}”的数据项？`,
      onOk() {
        executeDeleteRow(record.id);
      },
      onCancel() {},
    });
  };

  //确定删除选中的数据
  const executeDeleteRow = async (id: any) => {
    const body = await fetchApi(`${deleteAPI}/${id}`, push, {
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

  //搜索栏显示状态
  const [showSearch, setShowSearch] = useState(true);
  //action对象引用
  const actionTableRef = useRef<ActionType>();
  //搜索表单对象引用
  const searchTableFormRef = useRef<ProFormInstance>();
  //当前页数和每页条数
  const [page, setPage] = useState(1);
  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const pageChange = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  };


  //查询所有权限树
  const getPermissionList = async () => {
    const body = await fetchApi("/api/permissions", push);
    if (body !== undefined) {
      if (body.success) {
        return body.data.content;
      } else {
        message.error(body.message);
      }
    }

    return [];
  };

  const [permissionValue, setPermissionValue] = useState([] as number[]);

  return (
    <PageContainer title={false}>
      <ProTable
        formRef={searchTableFormRef}
        rowKey="id"
        columns={columns}
        request={async (params: any, sorter: any, filter: any) => {
          // 表单搜索项会从 params 传入，传递给后端接口。
          const body = await queryTableData(params, sorter, filter);
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
          onChange: pageChange,
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
        actionRef={actionTableRef}
        toolbar={{
          actions: [
            globalPermission.includes(UserPermission.ROLE_UPDATE) && (
              <ModalForm
                key="addmodal"
                title="添加角色"
                trigger={
                  <Button icon={<PlusOutlined />} type="primary">
                    新建
                  </Button>
                }
                autoFocusFirstInput
                modalProps={{
                  destroyOnClose: true,
                }}
                submitTimeout={2000}
                onFinish={executeAddData}
              >
                <ProForm.Group>
                  <ProFormText
                    width="md"
                    name="name"
                    autoFocus
                    label="角色名称"
                    placeholder="请输入角色名称"
                    rules={[{ required: true, message: "请输入角色名称" }]}
                  />
                  <ProFormText
                    width="md"
                    name="identifier"
                    label="角色标识值"
                    placeholder="请输入角色标识值"
                    rules={[{ required: true, message: "请输入角色标识值" }]}
                  />
                </ProForm.Group>
                <ProForm.Group>
                  <ProFormSelect
                    width="md"
                    name="permissions"
                    label="权限"
                    placeholder="请选择权限"
                    request={async () => {
                      return getPermissionList();
                    }}
                    fieldProps={{
                      placement: "bottomRight",
                      mode: "multiple",
                      fieldNames: {
                        label: "name",
                        value: "id",
                      },
                    }}
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
            globalPermission.includes(UserPermission.ROLE_UPDATE) && (
              <ModalForm
                key="modifymodal"
                title="修改角色"
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
                      <ProFormText
                        width="md"
                        name="name"
                        autoFocus
                        label="角色名称"
                        placeholder="请输入角色名称"
                        rules={[{ required: true, message: "请输入角色名称" }]}
                      />
                      <ProFormText
                        width="md"
                        name="identifier"
                        autoFocus
                        label="角色标识值"
                        readonly
                      />
                    </ProForm.Group>
                    <ProForm.Group>
                      <ProFormSelect
                        width="md"
                        name="permissions"
                        label="权限"
                        placeholder="请选择权限"
                        request={async () => {
                          return getPermissionList();
                        }}
                        fieldProps={{
                          placement: "bottomRight",
                          mode: "multiple",
                          fieldNames: {
                            label: "name",
                            value: "id",
                          },
                        }}
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
                  </>
                )}
              </ModalForm>
            ),
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
    </PageContainer>
  );
}
