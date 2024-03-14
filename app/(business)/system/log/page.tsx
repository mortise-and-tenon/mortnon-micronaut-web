"use client";

import { fetchApi, fetchFile } from "@/app/_modules/func";
import {
  ClearOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type {
  ActionType,
  ProColumns,
  ProFormInstance,
} from "@ant-design/pro-components";
import {
  PageContainer,
  ProDescriptions,
  ProTable,
} from "@ant-design/pro-components";
import { Button, message, Modal, Space, Tag } from "antd";
import { useRouter } from "next/navigation";

import {
  faCheck,
  faDownload,
  faToggleOff,
  faToggleOn,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useRef, useState } from "react";

export default function OperLog() {
  const { push } = useRouter();

  //表格列定义
  const columns: ProColumns[] = [
    {
      title: "编号",
      dataIndex: "id",
      search: false,
    },
    {
      title: "用户操作",
      fieldProps: {
        placeholder: "请输入用户操作",
      },
      dataIndex: "action_desc",
      order: 9,
    },
    {
      title: "操作人员",
      fieldProps: {
        placeholder: "请输入操作人员",
      },
      dataIndex: "user_name",
      sorter: true,
      order: 8,
    },
    {
      title: "所属部门",
      dataIndex: "project_name",
      ellipsis: true,
      order: 7,
    },
    {
      title: "IP 地址",
      fieldProps: {
        placeholder: "请输入IP地址",
      },
      dataIndex: "ip",
      order: 10,
    },
    {
      title: "操作结果",
      fieldProps: {
        placeholder: "请选择操作结果",
      },
      dataIndex: "result",
      valueType: "select",
      render: (_, record) => {
        return (
          <Space>
            <Tag
              color={record.result === "SUCCESS" ? "green" : "red"}
              icon={
                record.result === "SUCCESS" ? (
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
        SUCCESS: {
          text: "成功",
          status: "SUCCESS",
        },
        FAILURE: {
          text: "失败",
          status: "FAILURE",
        },
      },
      order: 6,
    },
    {
      title: "级别",
      dataIndex: "level",
      valueType: "select",
      sorter: true,
      order: 5,
      valueEnum: {
        INFO: {
          text: "提示",
          status: "INFO",
        },
        WARN: {
          text: "警告",
          status: "WARN",
        },
        DANGER: {
          text: "危险",
          status: "DANGER",
        },
      },
    },
    {
      title: "操作时间",
      dataIndex: "time",
      valueType: "dateTime",
      search: false,
      sorter: true,
      order: 4,
    },
    {
      title: "操作时间",
      fieldProps: {
        placeholder: ["开始日期", "结束日期"],
      },
      dataIndex: "timeRange",
      valueType: "dateRange",
      hideInTable: true,
      order: 5,
      search: {
        transform: (value) => {
          return {
            begin_time: `${value[0]} 00:00:00`,
            end_time: `${value[1]} 23:59:59`,
          };
        },
      },
    },
    {
      title: "操作",
      key: "option",
      search: false,
      render: (_, record) => [
        <Button
          key={record.operId}
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showRowModal(record)}
        >
          详情
        </Button>,
      ],
    },
  ];

  //查询日志数据
  const getLog = async (params: any, sorter: any, filter: any) => {
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

    const body = await fetchApi(`/api/logs?${queryParams}`, push);
    if (body !== undefined) {
      if (!body.success) {
        message.error(body.message);
        return undefined;
      }
    }

    return body;
  };

  //选中行操作
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  //控制是否展示行详情模态框
  const [isModalOpen, setIsModalOpen] = useState(false);

  //关闭行详情展示
  function closeRowModal() {
    setIsModalOpen(false);
  }

  const [selectedRow, setSelectedRow] = useState(undefined as any);

  //展示行详情
  function showRowModal(record: any) {
    setIsModalOpen(true);
    setSelectedRow(record);
  }

  //搜索栏显示状态
  const [showSearch, setShowSearch] = useState(true);
  //action对象引用
  const actionRef = useRef<ActionType>();
  //表单对象引用
  const formRef = useRef<ProFormInstance>();

  //当前页数和每页条数
  const [page, setPage] = useState(1);
  const defaultPageSize = 10;
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const pageChange = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  };

  //导出日志文件
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
        `/api/logs/export?${queryParams}`,
        push,
        `操作日志_${new Date().getTime()}.xlsx`
      );
    }
  };

  return (
    <PageContainer title={false}>
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
          const body = await getLog(params, sorter, filter);
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
        actionRef={actionRef}
        toolbar={{
          actions: [
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
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              },
            },
          ],
        }}
      />

      {selectedRow !== undefined && (
        <Modal
          title="操作日志详情"
          footer={<Button onClick={closeRowModal}>关闭</Button>}
          open={isModalOpen}
          onCancel={closeRowModal}
        >
          <ProDescriptions column={2}>
            <ProDescriptions.Item label="用户操作">
              {selectedRow.action_desc}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="IP 地址">
              {selectedRow.ip}
            </ProDescriptions.Item>
          </ProDescriptions>
          <ProDescriptions column={2}>
            <ProDescriptions.Item label="操作人员">
              {selectedRow.user_name}
            </ProDescriptions.Item>
            <ProDescriptions.Item label="所属部门">
              {selectedRow.project_name}
            </ProDescriptions.Item>
          </ProDescriptions>

          <ProDescriptions column={2}>
            <ProDescriptions.Item
              label="操作结果"
              valueEnum={{
                SUCCESS: {
                  text: "成功",
                  status: "SUCCESS",
                },
                FAILURE: {
                  text: "失败",
                  status: "FAILURE",
                },
              }}
            >
              {selectedRow.result}
            </ProDescriptions.Item>
            <ProDescriptions.Item
              label="级别"
              valueEnum={{
                INFO: {
                  text: "提示",
                  status: "INFO",
                },
                WARN: {
                  text: "警告",
                  status: "WARN",
                },
                DANGER: {
                  text: "危险",
                  status: "DANGER",
                },
              }}
            >
              {selectedRow.level}
            </ProDescriptions.Item>
          </ProDescriptions>
          <ProDescriptions>
            <ProDescriptions.Item label="请求数据">
              {selectedRow.request}
            </ProDescriptions.Item>
          </ProDescriptions>
          <ProDescriptions>
            <ProDescriptions.Item label="响应消息">
              {selectedRow.message}
            </ProDescriptions.Item>
          </ProDescriptions>
          <ProDescriptions>
            <ProDescriptions.Item label="操作时间">
              {selectedRow.time}
            </ProDescriptions.Item>
          </ProDescriptions>
        </Modal>
      )}
    </PageContainer>
  );
}
