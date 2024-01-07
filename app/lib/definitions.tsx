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

//基础分页查询结果
export type BaesQueryResult = {
    //当前页数
    pageNumber: number;
    //总页数
    totalPages: number;
    //每页条数
    pageSize: number;
    //总条数
    totalSize: number;
}

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

//日志数据定义
export type LogInfo = {
  //日志id对应的表格key
  key: number,
  action: string,
  userName: string,
  projectName:string,
  ip:string,
  result:string,
  level:string,
  time:string
}