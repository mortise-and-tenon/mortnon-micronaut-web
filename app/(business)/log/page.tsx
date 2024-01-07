"use client";
import { useState, useEffect } from "react";
import {
  Layout,
  Breadcrumb,
  Card,
  Table,
  Tooltip,
  Button,
} from "@douyinfe/semi-ui";
import { IconRefresh } from "@douyinfe/semi-icons";

import NavHeader from "@/app/_modules/navHeader";
import NavSider from "@/app/_modules/navSider";

import {
  QueryInfo,
  BaesQueryResult,
  LogInfo,
  ColumnFilter,
} from "@/app/lib/definitions";

import "../style.css";

const { Content } = Layout;

//查询日志数据结果定义
export type QueryResult = BaesQueryResult & {
  //数据
  data: Array<LogInfo>;
  //用户名列过滤器
  userNameFilter: Array<ColumnFilter>;
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
    });
    const response = await fetch(`/api/logs?${queryParams.toString()}`);
    if (response.ok) {
      const body = await response.json();
      const data = body.data;
      const logList: Array<LogInfo> = new Array<LogInfo>();
      const userNameFilters: Array<ColumnFilter> = new Array<ColumnFilter>();
      data.content.forEach((log) => {
        const logInfo: LogInfo = {
          key: log.id,
          userName: log.user_name,
          projectName: log.project_name,
          ip: log.ip,
          action: log.action,
          result: log.result,
          level: log.level,
          time: log.time,
        };

        logList.push(logInfo);

        const userNameFilter: ColumnFilter = {
          text: log.user_name,
          value: log.user_name,
        };

        userNameFilters.push(userNameFilter);
      });

      logList.sort((a, b) => (new Date(a) > new Date(b) ? 1 : -1));

      //绑定查询到的数据
      //前台semi默认页数从1开始，后端从0开始
      const queryResult: QueryResult = {
        pageNumber: data.page_number + 1,
        totalPages: data.total_pages,
        pageSize: data.page_size,
        totalSize: data.total_size,
        data: logList,
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
  } as QueryInfo);

  useEffect(() => {
    getLog(queryInfo, setQueryResult, setLoading);
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

  //表格列定义
  const columns = [
    {
      title: "用户名",
      dataIndex: "userName",
    },
    {
      title: "所属组织",
      dataIndex: "projectName",
    },
    {
      title: "IP",
      dataIndex: "ip",
    },
    {
      title: "操作",
      dataIndex: "action",
    },
    {
      title: "结果",
      dataIndex: "result",
    },
    {
      title: "级别",
      dataIndex: "level",
    },
    {
      title: "操作时间",
      dataIndex: "time",
      sorter: (a, b) => (new Date(a) > new Date(b) ? 1 : -1),
    },
  ];

  return (
    <Layout className="layout-almost-full-screen">
      <NavHeader selectedKey="system" />
      <Content className="content">
        <NavSider selectedKey="log" />
        <Layout>
          <Breadcrumb className="bread-style">
            <Breadcrumb.Item noLink={true}>系统管理</Breadcrumb.Item>
            <Breadcrumb.Item noLink={true}>用户管理</Breadcrumb.Item>
          </Breadcrumb>
          <Card className="card-style">
            <div className="action-style">
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
      </Content>
    </Layout>
  );
}
