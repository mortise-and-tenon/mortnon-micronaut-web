"use client";
import { Layout, Table, Breadcrumb, Card, Button,Modal } from "@douyinfe/semi-ui";

import { IconUserAdd, IconRefresh } from "@douyinfe/semi-icons";

import NavHeader from "@/app/_modules/navHeader";
import NavSider from "@/app/_modules/navSider";

import "../style.css";

import { useEffect, useState } from "react";

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

//查询数据定义
export type QueryInfo = {
  //查询页码
  page: number;
  //查询每页数量
  size: number;
};

//查询数据结果定义
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

//获取的用户信息定义
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

//获取用户数据
export async function getUser(queryInfo, setQueryResult, setLoading) {
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
      console.log(userList);
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

  const [loading, setLoading] = useState(true);
  const defaultPageSize = 10;
  const [queryInfo, setQueryInfo] = useState({
    page: 0,
    size: defaultPageSize,
  } as QueryInfo);

  useEffect(() => {
    getUser(queryInfo, setQueryResult, setLoading);
  }, [queryInfo]);

  //按条件刷新表格
  const refreshTable = (currentPage, pageSize) => {
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

  const [visible, setVisible] = useState(false);
  const showDialog = () => {
      setVisible(true);
  };
  const handleOk = () => {
      setVisible(false);
      console.log('Ok button clicked');
  };
  const handleCancel = () => {
      setVisible(false);
      console.log('Cancel button clicked');
  };
  const handleAfterClose = () => {
      console.log('After Close callback executed');
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
                aria-label="新建用户"
                onClick={showDialog}
              />
              <Modal
                title="基本对话框"
                visible={visible}
                onOk={handleOk}
                afterClose={handleAfterClose} //>=1.16.0
                onCancel={handleCancel}
                closeOnEsc={true}
            >
                This is the content of a basic modal.
                <br />
                More content...
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
