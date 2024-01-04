//表格过滤器定义
export type ColumnFilter = {
  text: string;
  value: number | string;
};

//分页查询数据定义
export type QueryInfo = {
  //查询页码
  page: number;
  //查询每页数量
  size: number;
};

//用户信息定义
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

//组织树信息定义
export type ProjectTreeNode = {
  key: string;
  label: string;
  children: Array<ProjectTreeNode>;
};
