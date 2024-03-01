"use client";

import { fetchApi, fetchFile } from "@/app/_modules/func";
import {
  CaretDownOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  KeyOutlined,
  LoadingOutlined,
  CloudUploadOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import type {
  ProColumns,
  ProFormInstance,
  ActionType,
} from "@ant-design/pro-components";
import {
  ModalForm,
  PageContainer,
  ProCard,
  ProForm,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ProTable,
  ProFormDigit,
} from "@ant-design/pro-components";
import type { TreeDataNode, MenuProps, UploadProps, GetProp } from "antd";
import {
  Button,
  Col,
  Flex,
  Input,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Switch,
  Tree,
  Dropdown,
  Form,
  Upload,
  Typography,
  Checkbox,
  Tag,
} from "antd";
import { useRouter } from "next/navigation";

import {
  faDownload,
  faPenToSquare,
  faToggleOff,
  faToggleOn,
  faUpload,
  faUsers,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useMemo, useRef, useState } from "react";

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
    },
    {
      title: "标识值",
      dataIndex: "identifier",
      ellipsis: true,
      order: 2,
    },
    {
      title: "状态",
      dataIndex: "status",
      valueType: "select",
      render: (_, record) => {
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
              {_}
            </Tag>
          </Space>
        );
      },
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
      order: 1,
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
        if (record.id != 1)
          return [
            <Button
              key="modifyBtn"
              type="link"
              icon={<FontAwesomeIcon icon={faPenToSquare} />}
              onClick={() => onClickShowRowModifyModal(record)}
            >
              修改
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

    body.data.content.sort((a: any, b: any) => a.id - b.id);

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
        message.success(body.message);
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

  //展示修改对话框
  const onClickShowRowModifyModal = (record?: any) => {
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
    const id = record !== undefined ? record.id : selectedRow.id;

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
    const id = record != undefined ? record.id : selectedRowKeys.join(",");
    Modal.confirm({
      title: "系统提示",
      icon: <ExclamationCircleFilled />,
      content: `确定删除角色编号为“${id}”的数据项？`,
      onOk() {
        executeDeleteRow(id);
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

        //修改按钮变回不可点击
        setRowCanModify(false);
        //删除按钮变回不可点击
        setRowCanDelete(false);
        //选中行数据重置为空
        setSelectedRowKeys([]);
        //刷新列表
        if (actionTableRef.current) {
          actionTableRef.current.reload();
        }
      } else {
        message.error(body.message);
      }
    }
  };

  //4.导出

  //导出表格数据
  const exportTable = async () => {
    message.loading("开始导出");
    if (formRef.current) {
      const queryFields = Object.fromEntries(
        Object.entries(formRef.current.getFieldsValue()).filter(
          ([, value]) => value !== undefined
        )
      );
      const queryData = {
        pageNum: page.toString(),
        pageSize: pageSize.toString(),
        ...queryFields,
      };

      const queryParams = new URLSearchParams(queryData);

      await fetchFile(
        `exportAPI?${queryParams}`,
        push,
        `${exportFilePrefix}_${new Date().getTime()}.xlsx`
      );
    }
  };

  //5.选择行

  //选中行操作
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRow, setSelectedRow] = useState(undefined as any);

  //修改按钮是否可用，选中行时才可用
  const [rowCanModify, setRowCanModify] = useState(false);

  //删除按钮是否可用，选中行时才可用
  const [rowCanDelete, setRowCanDelete] = useState(false);

  //ProTable rowSelection
  const rowSelection = {
    onChange: (newSelectedRowKeys: React.Key[], selectedRows: any[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setRowCanDelete(newSelectedRowKeys && newSelectedRowKeys.length > 0);

      if (newSelectedRowKeys && newSelectedRowKeys.length == 1) {
        setSelectedRow(selectedRows[0]);
        setRowCanModify(true);
      } else {
        setRowCanModify(false);
        setSelectedRow(undefined);
      }
    },

    //复选框的额外禁用判断
    // getCheckboxProps: (record) => ({
    //   disabled: record.userId == 1,
    // }),
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
      }
    }

    return [];
  };

  return (
    <PageContainer title={false}>
      <ProTable
        formRef={searchTableFormRef}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          ...rowSelection,
        }}
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
                <ProFormTreeSelect
                  width="md"
                  name="permissions"
                  label="权限"
                  request={async () => {
                    return getPermissionList();
                  }}
                  fieldProps={{
                    placement: "topRight",
                    filterTreeNode: true,
                    showSearch: true,
                    multiple: true,
                    treeCheckable: true,
                    treeNodeFilterProp: "label",
                    fieldNames: {
                      label: "description",
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
            </ModalForm>,
            <ModalForm
              key="modifymodal"
              title="修改角色"
              formRef={modifyFormRef}
              trigger={
                <Button
                  icon={<FontAwesomeIcon icon={faPenToSquare} />}
                  disabled={!rowCanModify}
                  onClick={() => onClickShowRowModifyModal()}
                >
                  修改
                </Button>
              }
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
                <ProFormTreeSelect
                  width="md"
                  name="permissions"
                  label="权限"
                  request={async () => {
                    return getPermissionList();
                  }}
                  fieldProps={{
                    placement: "topRight",
                    filterTreeNode: true,
                    showSearch: true,
                    multiple: true,
                    treeCheckable: true,
                    treeNodeFilterProp: "label",
                    fieldNames: {
                      label: "description",
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
            </ModalForm>,

            <Button
              key="danger"
              danger
              icon={<DeleteOutlined />}
              disabled={!rowCanDelete}
              onClick={() => onClickDeleteRow()}
            >
              删除
            </Button>,
            <Button
              key="export"
              type="primary"
              icon={<FontAwesomeIcon icon={faDownload} />}
              onClick={exportTable}
            >
              导出
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
    </PageContainer>
  );
}
